import type { DraftStatus } from "@/lib/types";

export const DRAFT_STATUS: Record<DraftStatus, { label: string; className: string }> = {
  concept: { label: "Menunggu G3", className: "bg-forsythia text-noir" },
  approved: { label: "Disetujui", className: "bg-nocturnal text-arctic" },
  revise: { label: "Revisi", className: "bg-saffron text-noir" },
};

export function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={"px-box m-1 bg-arctic " + className} {...rest}>
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-nocturnal">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-8" aria-hidden>
      <div className="h-12 w-72 bg-arctic/70" />
      <div className="h-40 bg-arctic/70" />
      <div className="h-72 bg-arctic/70" />
    </div>
  );
}
