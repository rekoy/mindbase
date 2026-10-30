"use server";

import { revalidatePath } from "next/cache";
import { assetExists, deleteAsset } from "@/lib/assets";
import { FONTS, MAX_ASSETS, MAX_COLORS, brandOf, isHex } from "@/lib/brand";
import { CATEGORIES } from "@/lib/mock";
import { requireProject } from "@/lib/session";
import { updateUserData } from "@/lib/store";
import type { Brand, Decision, Project } from "@/lib/types";

export type ProjectEdit = Pick<
  Project,
  "name" | "description" | "category" | "timezone" | "language" | "audience" | "voice" | "forbidden" | "postsPerWeek" | "watchTarget" | "approver"
> & { brand: Brand; note: string };

const clean = (s: string, max: number) => s.trim().slice(0, max);
const isLink = (s: string) => s === "" || /^https?:\/\/\S+$/i.test(s);

export async function saveProject(edit: ProjectEdit): Promise<{ error?: string; logged?: number }> {
  const { email, project } = await requireProject();
  const before = brandOf(project);

  const name = clean(edit.name, 60);
  if (!name) return { error: "Nama brand wajib diisi." };
  if (!CATEGORIES.includes(edit.category)) return { error: "Kategori tidak dikenal." };
  if (!["WIB", "WITA", "WIT"].includes(edit.timezone)) return { error: "Zona waktu tidak dikenal." };

  const colors = edit.brand.colors.slice(0, MAX_COLORS).map((c) => ({ role: clean(c.role, 20) || "Warna", hex: c.hex.toLowerCase() }));
  if (colors.some((c) => !isHex(c.hex))) return { error: "Kode warna harus berformat #RRGGBB." };
  if (!FONTS.includes(edit.brand.headingFont) || !FONTS.includes(edit.brand.bodyFont)) return { error: "Font tidak tersedia." };

  const linkPlain = clean(edit.brand.linkPlain, 200);
  const linkTracking = clean(edit.brand.linkTracking, 300);
  if (!isLink(linkPlain) || !isLink(linkTracking)) return { error: "Link harus diawali http:// atau https://." };

  // Only keep assets that really belong to this user.
  const assets = [];
  for (const a of edit.brand.assets.slice(0, MAX_ASSETS)) {
    if (await assetExists(email, a.id)) assets.push({ id: a.id, label: clean(a.label, 40) });
  }
  const logo = edit.brand.logo && (await assetExists(email, edit.brand.logo)) ? edit.brand.logo : null;

  const brand: Brand = {
    colors,
    headingFont: edit.brand.headingFont,
    bodyFont: edit.brand.bodyFont,
    logo,
    assets,
    wordsUsed: clean(edit.brand.wordsUsed, 300),
    claimRules: clean(edit.brand.claimRules, 500),
    linkPlain,
    linkTracking,
  };
  const next: Project = {
    ...project,
    name,
    description: clean(edit.description, 140),
    category: edit.category,
    timezone: edit.timezone,
    language: clean(edit.language, 40),
    audience: clean(edit.audience, 300),
    voice: edit.voice.slice(0, 3),
    forbidden: clean(edit.forbidden, 200),
    postsPerWeek: Math.min(14, Math.max(1, Math.round(edit.postsPerWeek))),
    watchTarget: Math.min(90, Math.max(10, Math.round(edit.watchTarget))),
    approver: clean(edit.approver, 120) || email,
    brand,
  };

  // Log what changed, in plain words, so the next cycle knows why things look the way they do.
  const now = new Date().toISOString();
  const log: string[] = [];
  if (next.name !== project.name) log.push(`Nama brand diubah menjadi "${next.name}".`);
  if (logo !== before.logo) log.push(logo ? (before.logo ? "Logo diganti." : "Logo ditambahkan.") : "Logo dihapus.");
  if (JSON.stringify(colors) !== JSON.stringify(before.colors)) log.push(`Palet warna: ${colors.map((c) => `${c.role} ${c.hex}`).join(", ")}.`);
  if (brand.headingFont !== before.headingFont || brand.bodyFont !== before.bodyFont) log.push(`Font: judul ${brand.headingFont}, isi ${brand.bodyFont}.`);
  if (assets.length !== before.assets.length) log.push(`Aset brand: ${assets.length} file.`);
  if (next.voice.join() !== project.voice.join()) log.push(`Suara brand: ${next.voice.join(", ")}.`);
  if (next.forbidden !== project.forbidden) log.push(`Kata dilarang: ${next.forbidden || "(kosong)"}.`);
  if (brand.claimRules !== before.claimRules) log.push("Aturan klaim diperbarui.");
  if (next.postsPerWeek !== project.postsPerWeek || next.watchTarget !== project.watchTarget) {
    log.push(`Target: ${next.postsPerWeek} post/minggu, rata-rata tonton ≥ ${next.watchTarget}%.`);
  }
  const note = clean(edit.note, 300);
  if (note) log.push(note);
  const entries: Decision[] = log.map((text) => ({ at: now, text }));

  await updateUserData(email, (data) => ({ ...data, project: { ...next, decisions: [...entries, ...(project.decisions ?? [])].slice(0, 100) } }));

  // Remove files that are no longer referenced anywhere.
  const kept = new Set([logo, ...assets.map((a) => a.id)]);
  for (const id of [before.logo, ...before.assets.map((a) => a.id)]) {
    if (id && !kept.has(id)) await deleteAsset(email, id);
  }

  revalidatePath("/dashboard", "layout");
  return { logged: entries.length };
}
