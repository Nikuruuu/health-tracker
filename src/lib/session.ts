import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({
    headers: headersList,
  });
}

export async function requireSession(redirectTo: string = "/sign-in") {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

