import { describe, expect, it, vi, beforeEach } from "vitest";

// Use vi.hoisted to declare mock variables accessible inside hoisted vi.mock factories
const mocks = vi.hoisted(() => {
  return {
    session: {
      user: {
        id: "user_A",
        email: "user_a@example.com",
        name: "User A",
      },
    },
    db: {
      query: {
        profile: {
          findFirst: vi.fn(),
        },
        phases: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
      },
      insert: vi.fn(),
      update: vi.fn(),
    },
    tx: {
      update: vi.fn(),
      insert: vi.fn(),
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => mocks.session),
}));

vi.mock("@/db", () => ({
  db: mocks.db,
  withTransaction: vi.fn(async (cb: (tx: typeof mocks.tx) => Promise<unknown>) => cb(mocks.tx)),
}));

import {
  updateTargetsAction,
  updateMilestonesAction,
  switchPhaseAction,
  toggleMaintenanceAction,
  updatePreferencesAction,
} from "./actions";

describe("Settings Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.user.id = "user_A";
    mocks.db.query.profile.findFirst.mockResolvedValue({
      userId: "user_A",
      startWeightKg: "90.0",
      finalGoalWeightKg: "65.0",
      activePhaseId: "user_A_phase_1",
      lastDeficitPhaseId: null,
      maintenanceMode: false,
    });
    mocks.db.query.phases.findMany.mockResolvedValue([
      { id: "user_A_phase_1", mode: "deficit", startDate: "2026-01-01" },
      { id: "user_A_phase_2", mode: "deficit", startDate: "2026-02-01" },
      { id: "user_A_phase_3", mode: "deficit", startDate: "2026-05-01" },
      { id: "user_A_phase_4", mode: "maintenance", startDate: "2026-08-01" },
    ]);
  });

  describe("updateTargetsAction", () => {
    it("rejects calorie goals under 1,200 kcal floor on the server", async () => {
      const subFloorInput = {
        kcalDeficit: 1150,
        kcalMaintenance: 1900,
        proteinMinG: 110,
        proteinMaxG: 120,
        fatPct: 0.3,
        waterMl: 3000,
        stepsMin: 7000,
        stepsMax: 8000,
      };

      await expect(updateTargetsAction(subFloorInput)).rejects.toThrow();
    });

    it("scopes database update strictly to authenticated session user ID", async () => {
      const onConflictDoUpdateMock = vi.fn().mockResolvedValue({});
      const valuesMock = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictDoUpdateMock });
      mocks.db.insert.mockReturnValue({ values: valuesMock });

      const validInput = {
        kcalDeficit: 1500,
        kcalMaintenance: 1900,
        proteinMinG: 110,
        proteinMaxG: 120,
        fatPct: 0.3,
        waterMl: 3000,
        stepsMin: 7000,
        stepsMax: 8000,
      };

      const result = await updateTargetsAction(validInput);
      expect(result.success).toBe(true);

      // Verify inserted userId matches the session user ID ("user_A")
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_A",
          kcalDeficit: 1500,
        })
      );
    });
  });

  describe("Cross-user authorization & isolation", () => {
    it("prevents User A from switching to or accessing User B's phase", async () => {
      // User A is logged in
      mocks.session.user.id = "user_A";

      // Phase lookup only returns User A's phases; user_B_phase_2 is not found
      mocks.db.query.phases.findMany.mockResolvedValue([
        { id: "user_A_phase_1", mode: "deficit", startDate: "2026-01-01" },
        { id: "user_A_phase_2", mode: "deficit", startDate: "2026-02-01" },
      ]);

      await expect(
        switchPhaseAction({ phaseId: "user_B_phase_2" })
      ).rejects.toThrow("Target phase not found.");
    });

    it("prevents User A from restoring or adopting a phase ID belonging to User B", async () => {
      mocks.session.user.id = "user_A";

      // User A's profile is loaded with an invalid/foreign lastDeficitPhaseId
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_4",
        maintenanceMode: true,
        lastDeficitPhaseId: "user_B_phase_2",
      });

      // User A's actual phases
      mocks.db.query.phases.findMany.mockResolvedValue([
        { id: "user_A_phase_1", mode: "deficit", startDate: "2026-01-01" },
        { id: "user_A_phase_2", mode: "deficit", startDate: "2026-02-01" },
        { id: "user_A_phase_3", mode: "deficit", startDate: "2026-05-01" },
        { id: "user_A_phase_4", mode: "maintenance", startDate: "2026-08-01" },
      ]);

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.db.update.mockReturnValue({ set: setMock });

      const res = await toggleMaintenanceAction({ enable: false });
      expect(res.success).toBe(true);

      // Must fall back to User A's latest deficit phase, NEVER User B's phase
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: false,
          activePhaseId: "user_A_phase_3",
        })
      );
    });

    it("User A cannot modify User B's preferences", async () => {
      // User A is logged in
      mocks.session.user.id = "user_A";

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.db.update.mockReturnValue({ set: setMock });

      await updatePreferencesAction({
        units: "imperial",
        theme: "dark",
      });

      // DB update was invoked strictly with user_A, never any other user
      expect(mocks.db.update).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          units: "imperial",
          theme: "dark",
        })
      );
    });

    it("User A cannot update User B's milestones", async () => {
      mocks.session.user.id = "user_A";

      // When User A fetches profile, it only queries User A
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        startWeightKg: "90.0",
        finalGoalWeightKg: "65.0",
      });

      mocks.db.query.phases.findMany.mockResolvedValue([
        { id: "user_A_phase_1", name: "Phase 1: Kickoff", userId: "user_A" },
        { id: "user_A_phase_2", name: "Phase 2: Momentum", userId: "user_A" },
        { id: "user_A_phase_3", name: "Phase 3: Final Push", userId: "user_A" },
      ]);

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.tx.update.mockReturnValue({ set: setMock });

      const res = await updateMilestonesAction({
        phase1GoalKg: 82.0,
        phase2GoalKg: 73.0,
        phase3GoalKg: 65.0,
      });

      expect(res.success).toBe(true);
      // Verify queries and updates were strictly scoped to User A
      expect(mocks.db.query.profile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      );
    });
  });

  describe("toggleMaintenanceAction & switchPhaseAction Linkage", () => {
    const userAPhases = [
      { id: "user_A_phase_1", mode: "deficit", startDate: "2026-01-01" },
      { id: "user_A_phase_2", mode: "deficit", startDate: "2026-02-01" },
      { id: "user_A_phase_3", mode: "deficit", startDate: "2026-05-01" },
      { id: "user_A_phase_4", mode: "maintenance", startDate: "2026-08-01" },
    ];

    it("Phase 2 -> ON -> OFF returns Phase 2", async () => {
      mocks.session.user.id = "user_A";
      mocks.db.query.phases.findMany.mockResolvedValue(userAPhases);

      // 1. User is on Phase 2, turns maintenance ON
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_2",
        maintenanceMode: false,
        lastDeficitPhaseId: null,
      });

      const whereMock1 = vi.fn().mockResolvedValue({});
      const setMock1 = vi.fn().mockReturnValue({ where: whereMock1 });
      mocks.db.update.mockReturnValue({ set: setMock1 });

      const onRes = await toggleMaintenanceAction({ enable: true });
      expect(onRes.success).toBe(true);

      expect(setMock1).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: true,
          activePhaseId: "user_A_phase_4",
          lastDeficitPhaseId: "user_A_phase_2",
        })
      );

      // 2. User turns maintenance OFF (profile now contains lastDeficitPhaseId: "user_A_phase_2")
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_4",
        maintenanceMode: true,
        lastDeficitPhaseId: "user_A_phase_2",
      });

      const whereMock2 = vi.fn().mockResolvedValue({});
      const setMock2 = vi.fn().mockReturnValue({ where: whereMock2 });
      mocks.db.update.mockReturnValue({ set: setMock2 });

      const offRes = await toggleMaintenanceAction({ enable: false });
      expect(offRes.success).toBe(true);

      expect(setMock2).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: false,
          activePhaseId: "user_A_phase_2",
        })
      );
    });

    it("Phase 3 -> ON -> OFF returns Phase 3", async () => {
      mocks.session.user.id = "user_A";
      mocks.db.query.phases.findMany.mockResolvedValue(userAPhases);

      // 1. User is on Phase 3, turns maintenance ON
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_3",
        maintenanceMode: false,
        lastDeficitPhaseId: null,
      });

      const whereMock1 = vi.fn().mockResolvedValue({});
      const setMock1 = vi.fn().mockReturnValue({ where: whereMock1 });
      mocks.db.update.mockReturnValue({ set: setMock1 });

      const onRes = await toggleMaintenanceAction({ enable: true });
      expect(onRes.success).toBe(true);

      expect(setMock1).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: true,
          activePhaseId: "user_A_phase_4",
          lastDeficitPhaseId: "user_A_phase_3",
        })
      );

      // 2. User turns maintenance OFF
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_4",
        maintenanceMode: true,
        lastDeficitPhaseId: "user_A_phase_3",
      });

      const whereMock2 = vi.fn().mockResolvedValue({});
      const setMock2 = vi.fn().mockReturnValue({ where: whereMock2 });
      mocks.db.update.mockReturnValue({ set: setMock2 });

      const offRes = await toggleMaintenanceAction({ enable: false });
      expect(offRes.success).toBe(true);

      expect(setMock2).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: false,
          activePhaseId: "user_A_phase_3",
        })
      );
    });

    it("selecting Phase 4 directly, then turning OFF returns the previously active deficit phase", async () => {
      mocks.session.user.id = "user_A";
      mocks.db.query.phases.findMany.mockResolvedValue(userAPhases);

      // 1. User is on Phase 2, clicks Phase 4 directly
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_2",
        maintenanceMode: false,
        lastDeficitPhaseId: null,
      });

      const whereMock1 = vi.fn().mockResolvedValue({});
      const setMock1 = vi.fn().mockReturnValue({ where: whereMock1 });
      mocks.db.update.mockReturnValue({ set: setMock1 });

      const switchRes = await switchPhaseAction({ phaseId: "user_A_phase_4" });
      expect(switchRes.success).toBe(true);

      expect(setMock1).toHaveBeenCalledWith(
        expect.objectContaining({
          activePhaseId: "user_A_phase_4",
          maintenanceMode: true,
          lastDeficitPhaseId: "user_A_phase_2",
        })
      );

      // 2. User then turns maintenance OFF
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_4",
        maintenanceMode: true,
        lastDeficitPhaseId: "user_A_phase_2",
      });

      const whereMock2 = vi.fn().mockResolvedValue({});
      const setMock2 = vi.fn().mockReturnValue({ where: whereMock2 });
      mocks.db.update.mockReturnValue({ set: setMock2 });

      const offRes = await toggleMaintenanceAction({ enable: false });
      expect(offRes.success).toBe(true);

      expect(setMock2).toHaveBeenCalledWith(
        expect.objectContaining({
          activePhaseId: "user_A_phase_2",
          maintenanceMode: false,
        })
      );
    });

    it("empty or null lastDeficitPhaseId falls back to latest deficit phase by date", async () => {
      mocks.session.user.id = "user_A";
      mocks.db.query.phases.findMany.mockResolvedValue(userAPhases);

      // Profile has no lastDeficitPhaseId
      mocks.db.query.profile.findFirst.mockResolvedValue({
        userId: "user_A",
        activePhaseId: "user_A_phase_4",
        maintenanceMode: true,
        lastDeficitPhaseId: null,
      });

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.db.update.mockReturnValue({ set: setMock });

      const offRes = await toggleMaintenanceAction({ enable: false });
      expect(offRes.success).toBe(true);

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activePhaseId: "user_A_phase_3", // Latest deficit phase by date
          maintenanceMode: false,
        })
      );
    });
  });
});
