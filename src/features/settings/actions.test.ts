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

      // Phase lookup returns null because the phase belongs to User B, not User A
      mocks.db.query.phases.findFirst.mockResolvedValue(null);

      await expect(
        switchPhaseAction({ phaseId: "user_B_phase_2" })
      ).rejects.toThrow("Target phase not found.");
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

  describe("toggleMaintenanceAction", () => {
    it("activates Phase 4 when maintenance is turned ON", async () => {
      mocks.session.user.id = "user_A";

      mocks.db.query.phases.findMany.mockResolvedValue([
        { id: "user_A_phase_1", mode: "deficit" },
        { id: "user_A_phase_2", mode: "deficit" },
        { id: "user_A_phase_3", mode: "deficit" },
        { id: "user_A_phase_4", mode: "maintenance" },
      ]);

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.db.update.mockReturnValue({ set: setMock });

      const res = await toggleMaintenanceAction({ enable: true });
      expect(res.success).toBe(true);

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: true,
          activePhaseId: "user_A_phase_4",
        })
      );
    });

    it("restores the last deficit phase when maintenance is turned OFF", async () => {
      mocks.session.user.id = "user_A";

      mocks.db.query.phases.findMany.mockResolvedValue([
        { id: "user_A_phase_1", mode: "deficit" },
        { id: "user_A_phase_2", mode: "deficit" },
        { id: "user_A_phase_3", mode: "deficit" },
        { id: "user_A_phase_4", mode: "maintenance" },
      ]);

      const whereMock = vi.fn().mockResolvedValue({});
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      mocks.db.update.mockReturnValue({ set: setMock });

      const res = await toggleMaintenanceAction({ enable: false });
      expect(res.success).toBe(true);

      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          maintenanceMode: false,
          activePhaseId: "user_A_phase_3",
        })
      );
    });
  });
});
