import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/store";

/** Email of the signed-in user; redirects to /login when there is no session. */
export async function requireSessionEmail() {
  const email = (await cookies()).get("mb_session")?.value;
  if (!email) redirect("/login");
  return email;
}

export function displayName(email: string) {
  const local = email.split("@")[0].replace(/[._-]+/g, " ");
  return local.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Signed-in user's project; redirects to onboarding when there is none yet. */
export async function requireProject() {
  const email = await requireSessionEmail();
  const data = await getUserData(email);
  if (!data.project) redirect("/onboarding");
  return { email, project: data.project, drafts: data.drafts };
}
