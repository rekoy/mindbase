import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";
import { analyzeProject, fmtDate, fmtNum } from "@/lib/mock";
import { PLATFORMS } from "@/lib/platforms";
import { displayName, requireProject } from "@/lib/session";
import { Approvals } from "./approvals";
import { Card, DRAFT_STATUS, PageHeader, PageSkeleton } from "./ui";

export const metadata: Metadata = { title: "Dashboard — mindbase" };

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Overview({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const { created } = await searchParams;
  const { email, project, drafts } = await requireProject();
  const analyses = analyzeProject(project);
  const primary = analyses[0];
  const video = analyses.find((a) => a.avgWatch !== null);
  const waiting = drafts.filter((d) => d.status === "concept").length;
  const approved = drafts.some((d) => d.status === "approved");
  const recs = analyses.flatMap((a) => a.recommendations).filter((r) => r.angle);
  const recent = primary.posts.slice(0, 10).reverse();
  const maxViews = Math.max(...recent.map((p) => p.views));

  const stages = [
    { name: "Analisis", state: "done" },
    { name: "Rekomendasi", state: drafts.length ? "done" : "current" },
    { name: "Konsep", state: !drafts.length ? "locked" : waiting ? "current" : "done" },
    { name: "Produksi", state: approved ? "current" : "locked" },
    { name: "Jadwal", state: "locked" },
    { name: "Ukur", state: "locked" },
  ];
  const current = stages.find((s) => s.state === "current")?.name ?? "Produksi";

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader eyebrow={`${project.name} · data disinkron ${fmtDate(project.syncedAt)}`} title={`Halo, ${displayName(email)}`}>
        <Link href="/dashboard/konten/baru" className="px-btn bg-forsythia px-5 py-3 font-bold [--shade:var(--color-saffron)]">
          <Sprite grid={ICONS.plus} colors={{ k: C.current }} scale={1.5} />
          Buat konten
        </Link>
      </PageHeader>

      {typeof created === "string" && (
        <p role="status" className="px-flat bg-forsythia px-5 py-4 font-semibold">
          ✔ Konsep {created} tersimpan dan menunggu persetujuan di checkpoint G3.
        </p>
      )}

      <section aria-labelledby="stage-title" className="px-box m-1 bg-noir p-6 text-arctic [--line:var(--color-noir)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="stage-title" className="text-lg font-bold">
            Siklus pertama
          </h2>
          <p className="text-sm text-mint">
            Tahap sekarang: <strong className="text-forsythia">{current}</strong>
          </p>
        </div>
        <ol className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {stages.map((stage, i) => (
            <li
              key={stage.name}
              aria-current={stage.state === "current" ? "step" : undefined}
              className={
                "flex flex-col gap-2 p-3 " +
                (stage.state === "done" ? "bg-nocturnal text-mint" : stage.state === "current" ? "bg-forsythia text-noir" : "border-2 border-dashed border-nocturnal text-mint/60")
              }
            >
              <span className="text-xs font-semibold">LV.{i + 1}</span>
              <span className="font-bold">{stage.name}</span>
              <span className="text-xs">{stage.state === "done" ? "✔ selesai" : stage.state === "current" ? "▶ berjalan" : "terkunci"}</span>
            </li>
          ))}
        </ol>
      </section>

      <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Akun terhubung" value={String(project.accounts.length)} sub={project.accounts.map((a) => PLATFORMS[a.platform].name).join(" · ")} />
        <Stat
          label="Rata-rata tonton video"
          value={video ? `${video.avgWatch}%` : "–"}
          sub={video ? `target ≥ ${project.watchTarget}% · ${video.belowThirty} video < 30%` : "belum ada video"}
          flag={video ? (video.avgWatch! >= project.watchTarget ? "good" : "warn") : undefined}
        />
        <Stat label={`Median views ${PLATFORMS[primary.account.platform].short}`} value={fmtNum(primary.medianViews)} sub="dari 30 post terakhir" />
        <Stat label="Konsep di checkpoint" value={String(waiting)} sub={`${drafts.length} konsep di siklus ini`} />
      </ul>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <Card className="min-w-0" aria-labelledby="drafts-title">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 id="drafts-title" className="text-lg font-bold">
              Konten siklus ini
            </h2>
            <span className="text-sm text-nocturnal">{drafts.length} konten</span>
          </div>
          {drafts.length === 0 ? (
            <div className="border-t-4 border-noir p-6">
              <p className="font-semibold">Belum ada konten.</p>
              <p className="mt-1 text-nocturnal">Mulai dari {recs.length} rekomendasi berbasis data akunmu, atau tulis idemu sendiri.</p>
              <div className="mt-6 flex flex-wrap gap-6">
                <Link href="/dashboard/analisis" className="px-btn bg-forsythia px-4 py-2.5 font-bold [--shade:var(--color-saffron)]">
                  Lihat rekomendasi
                </Link>
                <Link href="/dashboard/konten/baru" className="px-btn bg-arctic px-4 py-2.5 font-bold [--shade:var(--color-mint)]">
                  Ide sendiri
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-y-4 border-noir bg-mint">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Konten</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Platform</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Slot</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Target</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d) => (
                    <tr key={d.id} className="border-b-2 border-mint last:border-b-0">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{d.angle}</p>
                        <p className="text-xs text-nocturnal">
                          {d.id} · {d.evidence ? "dari rekomendasi" : "owner's call"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        {PLATFORMS[d.platform].short} {d.format}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {fmtDate(d.slot, true)} · {d.slot.slice(11, 16)}
                      </td>
                      <td className="px-3 py-4">
                        {d.metric} {d.successTarget}
                      </td>
                      <td className="px-6 py-4">
                        <span className={"inline-block px-2 py-1 text-xs font-bold " + DRAFT_STATUS[d.status].className}>{DRAFT_STATUS[d.status].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Approvals drafts={drafts} />
      </div>

      <Card className="p-6" aria-labelledby="views-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="views-title" className="text-lg font-bold">
            Views 10 post terakhir · @{primary.account.handle}
          </h2>
          <p className="text-sm text-nocturnal">Oranye = di atas 2× median ({fmtNum(primary.medianViews)})</p>
        </div>
        <ol className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
          {recent.map((p) => {
            const outlier = p.views >= primary.medianViews * 2;
            return (
              <li key={p.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold tabular-nums">{fmtNum(p.views)}</span>
                <span
                  aria-hidden
                  className={"w-full bg-[repeating-linear-gradient(0deg,transparent_0_4px,rgb(23_43_54/0.15)_4px_8px)] " + (outlier ? "bg-saffron" : "bg-nocturnal")}
                  style={{ height: `${Math.max(4, Math.round(((p.views / maxViews) * 100) / 8) * 8)}%` }}
                />
                <span className="text-xs text-nocturnal">
                  {p.date.slice(8)}/{p.date.slice(5, 7)}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
    </main>
  );
}

function Stat({ label, value, sub, flag }: { label: string; value: string; sub: string; flag?: "good" | "warn" }) {
  return (
    <li className="px-box m-1 bg-arctic p-5">
      <p className="text-sm font-medium text-nocturnal">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      <p className={"mt-1 text-sm text-nocturnal " + (flag ? "font-semibold" : "")}>
        {flag === "good" && "▲ "}
        {flag === "warn" && <span className="mr-1 bg-saffron px-1 text-noir">!</span>}
        {sub}
      </p>
    </li>
  );
}
