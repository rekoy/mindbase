import type { Metadata } from "next";
import { Suspense } from "react";
import { analyzeProject, suggestedSlot } from "@/lib/mock";
import { requireProject } from "@/lib/session";
import { PageHeader, PageSkeleton } from "../../ui";
import { CreateForm } from "./create-form";

export const metadata: Metadata = { title: "Buat konten — mindbase" };

export default function NewContentPage(props: PageProps<"/dashboard/konten/baru">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function NewContent({ searchParams }: { searchParams: PageProps<"/dashboard/konten/baru">["searchParams"] }) {
  const { rec } = await searchParams;
  const { project } = await requireProject();
  const analyses = analyzeProject(project);
  const recs = analyses.flatMap((a) => a.recommendations).filter((r) => r.angle && r.format);
  const carouselSaves = Object.fromEntries(analyses.map((a) => [a.account.platform, a.avgCarouselSaves]));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader eyebrow={`${project.name} · Konsep (tahap 3)`} title="Buat konten baru" />
      <CreateForm
        project={{
          audience: project.audience,
          forbidden: project.forbidden,
          watchTarget: project.watchTarget,
          platforms: project.accounts.map((a) => a.platform),
          handles: Object.fromEntries(project.accounts.map((a) => [a.platform, a.handle])),
        }}
        recs={recs}
        carouselSaves={carouselSaves}
        slot={suggestedSlot(project)}
        initialRecId={typeof rec === "string" && recs.some((r) => r.id === rec) ? rec : null}
      />
    </main>
  );
}
