"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accountStats, normalizeHandle } from "@/lib/mock";
import { PLATFORMS } from "@/lib/platforms";
import { requireSessionEmail } from "@/lib/session";
import { getUserData, updateUserData } from "@/lib/store";
import type { DraftInput, DraftStatus, ProjectInput } from "@/lib/types";

export async function createProject(input: ProjectInput): Promise<{ error?: string }> {
  const email = await requireSessionEmail();
  const name = input.name.trim().slice(0, 60);
  const prefix = input.prefix.trim().toUpperCase();

  if (!name) return { error: "Nama project wajib diisi." };
  if (!/^[A-Z]{2,4}$/.test(prefix)) return { error: "Prefix ID harus 2–4 huruf." };

  // Never trust connection data from the client: only MVP platforms, stats recomputed here.
  const now = new Date().toISOString();
  const accounts = input.accounts
    .filter((a) => PLATFORMS[a.platform]?.available)
    .map((a) => {
      const handle = normalizeHandle(a.handle);
      return { platform: a.platform, handle, ...accountStats(a.platform, handle), connectedAt: now };
    })
    .filter((a) => a.handle);
  if (!accounts.length) return { error: "Hubungkan minimal satu akun sosial media." };

  await updateUserData(email, (data) => ({
    ...data,
    project: {
      name,
      description: input.description.trim().slice(0, 140),
      prefix,
      category: input.category,
      timezone: input.timezone,
      language: input.language,
      audience: input.audience.trim().slice(0, 300),
      voice: input.voice.slice(0, 3),
      forbidden: input.forbidden.trim().slice(0, 200),
      postsPerWeek: Math.min(14, Math.max(1, Math.round(input.postsPerWeek))),
      watchTarget: Math.min(90, Math.max(10, Math.round(input.watchTarget))),
      approver: input.approver.trim() || email,
      accounts,
      createdAt: now,
      syncedAt: now,
    },
  }));
  // No revalidatePath here: it would re-render /onboarding, whose gate then
  // redirects away before the sync screen finishes. Dashboard pages read fresh data per request.
  return {};
}

export async function resetProject() {
  const email = await requireSessionEmail();
  await updateUserData(email, () => ({ drafts: [] }));
  redirect("/onboarding");
}

export async function createDraft(input: DraftInput) {
  const email = await requireSessionEmail();
  const { project, drafts } = await getUserData(email);
  if (!project) redirect("/onboarding");
  if (!project.accounts.some((a) => a.platform === input.platform)) {
    throw new Error("Platform belum terhubung.");
  }

  const now = new Date();
  const yymmdd = now.toISOString().slice(2, 10).replaceAll("-", "");
  const sameDay = drafts.filter((d) => d.id.startsWith(`${project.prefix}-${yymmdd}`)).length;
  const id = `${project.prefix}-${yymmdd}-${String(sameDay + 1).padStart(2, "0")}`;

  await updateUserData(email, (data) => ({
    ...data,
    drafts: [{ ...input, id, status: "concept", createdAt: now.toISOString() }, ...data.drafts],
  }));
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard?created=${id}`);
}

export async function decideDraft(id: string, status: DraftStatus) {
  const email = await requireSessionEmail();
  await updateUserData(email, (data) => ({
    ...data,
    drafts: data.drafts.map((d) => (d.id === id ? { ...d, status } : d)),
  }));
  revalidatePath("/dashboard", "layout");
}
