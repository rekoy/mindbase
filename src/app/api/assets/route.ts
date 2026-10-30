import { cookies } from "next/headers";
import { ASSET_TYPES, MAX_ASSET_BYTES, looksLike, saveAsset } from "@/lib/assets";

// Upload goes through a route handler: server actions cap request bodies at ~1 MB.
export async function POST(request: Request) {
  const email = (await cookies()).get("mb_session")?.value;
  if (!email) return Response.json({ error: "Sesi berakhir, silakan masuk lagi." }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "File tidak ditemukan." }, { status: 400 });

  const ext = ASSET_TYPES[file.type];
  if (!ext) return Response.json({ error: "Format harus PNG, JPG, WebP, atau SVG." }, { status: 415 });
  if (file.size > MAX_ASSET_BYTES) return Response.json({ error: "Ukuran maksimal 2 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLike(ext, bytes)) return Response.json({ error: "Isi file tidak cocok dengan formatnya." }, { status: 415 });

  return Response.json({ id: await saveAsset(email, ext, bytes) });
}
