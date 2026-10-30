import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { Suspense } from "react";
import { requireProject } from "@/lib/session";
import { PageSkeleton } from "../ui";
import { BrandHub } from "./brand-hub";

export const metadata: Metadata = { title: "Brand Hub — mindbase" };

export default function BrandPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BrandLoader />
    </Suspense>
  );
}

async function BrandLoader() {
  const { project } = await requireProject();
  // Changes whenever the stored project changes, so the editor resets to saved values.
  const version = createHash("sha1").update(JSON.stringify(project)).digest("hex");
  return <BrandHub project={project} version={version} />;
}
