// Brand asset files, stored per user under .data/uploads until real object storage exists.
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const MAX_ASSET_BYTES = 2 * 1024 * 1024;

export const ASSET_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export const ASSET_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(ASSET_TYPES).map(([mime, ext]) => [ext, mime]),
);

export const ASSET_ID = /^[0-9a-f-]{36}\.(png|jpg|webp|svg)$/;

function userDir(email: string) {
  const key = createHash("sha256").update(email).digest("hex").slice(0, 16);
  return path.join(process.cwd(), ".data", "uploads", key);
}

/** Checks the file's leading bytes so a renamed file can't pass as an image. */
export function looksLike(ext: string, bytes: Uint8Array) {
  const head = (n: number) => Array.from(bytes.slice(0, n));
  switch (ext) {
    case "png":
      return head(4).join() === [0x89, 0x50, 0x4e, 0x47].join();
    case "jpg":
      return head(3).join() === [0xff, 0xd8, 0xff].join();
    case "webp":
      return new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    case "svg":
      return new TextDecoder().decode(bytes.slice(0, 2048)).includes("<svg");
    default:
      return false;
  }
}

export async function saveAsset(email: string, ext: string, bytes: Uint8Array) {
  const id = `${crypto.randomUUID()}.${ext}`;
  const dir = userDir(email);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id), bytes);
  return id;
}

export async function readAsset(email: string, id: string) {
  if (!ASSET_ID.test(id)) return null;
  try {
    return await fs.readFile(path.join(userDir(email), id));
  } catch {
    return null;
  }
}

export async function assetExists(email: string, id: string) {
  return (await readAsset(email, id)) !== null;
}

export async function deleteAsset(email: string, id: string) {
  if (!ASSET_ID.test(id)) return;
  await fs.rm(path.join(userDir(email), id), { force: true });
}
