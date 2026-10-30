import { cookies } from "next/headers";
import { ASSET_MIME, readAsset } from "@/lib/assets";

export async function GET(_request: Request, ctx: RouteContext<"/api/assets/[id]">) {
  const { id } = await ctx.params;
  const email = (await cookies()).get("mb_session")?.value;
  const file = email ? await readAsset(email, id) : null;
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": ASSET_MIME[id.split(".").pop()!],
      // Ids are random and files never change, so the browser may keep them.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // An uploaded SVG opened directly must not run scripts.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
