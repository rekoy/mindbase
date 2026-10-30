"use client";

import { useTransition } from "react";
import { decideDraft } from "@/app/actions/project";
import { PLATFORMS } from "@/lib/platforms";
import type { Draft } from "@/lib/types";

export function Approvals({ drafts }: { drafts: Draft[] }) {
  const [pending, startTransition] = useTransition();
  const waiting = drafts.filter((d) => d.status === "concept");

  return (
    <section className="px-box m-1 bg-arctic p-6" aria-labelledby="approvals-title" aria-busy={pending}>
      <div className="flex items-center justify-between">
        <h2 id="approvals-title" className="text-lg font-bold">
          Checkpoint G3
        </h2>
        <span className="bg-saffron px-2 py-0.5 text-sm font-bold">{waiting.length}</span>
      </div>
      {waiting.length === 0 ? (
        <p className="mt-4 text-nocturnal">Tidak ada konsep yang menunggu persetujuan.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {waiting.map((d) => (
            <li key={d.id} className="border-t-2 border-mint pt-5 first:border-t-0 first:pt-0">
              <p className="font-semibold">{d.angle}</p>
              <p className="text-sm text-nocturnal">
                {d.id} · {PLATFORMS[d.platform].name} {d.format}
              </p>
              <p className="mt-2 text-sm">&ldquo;{d.hook}&rdquo;</p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => decideDraft(d.id, "approved"))}
                  className="px-btn bg-forsythia px-4 py-2 text-sm font-bold disabled:opacity-60 [--shade:var(--color-saffron)]"
                >
                  Setujui
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => decideDraft(d.id, "revise"))}
                  className="px-btn bg-arctic px-4 py-2 text-sm font-bold disabled:opacity-60 [--shade:var(--color-mint)]"
                >
                  Minta revisi
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
