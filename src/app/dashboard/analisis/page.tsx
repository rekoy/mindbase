import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";
import { analyzeProject, fmtDate, fmtNum, fmtRatio } from "@/lib/mock";
import { PLATFORMS } from "@/lib/platforms";
import { requireProject } from "@/lib/session";
import { Card, PageHeader, PageSkeleton } from "../ui";

export const metadata: Metadata = { title: "Analisis — mindbase" };

export default function AnalysisPage(props: PageProps<"/dashboard/analisis">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Analysis searchParams={props.searchParams} />
    </Suspense>
  );
}

const CONFIDENCE: Record<string, string> = {
  Tinggi: "bg-nocturnal text-arctic",
  Sedang: "bg-forsythia text-noir",
  Rendah: "bg-mint text-noir",
};

async function Analysis({ searchParams }: { searchParams: PageProps<"/dashboard/analisis">["searchParams"] }) {
  const { p } = await searchParams;
  const { project } = await requireProject();
  const analyses = analyzeProject(project);
  const a = analyses.find((x) => x.account.platform === p) ?? analyses[0];
  const meta = PLATFORMS[a.account.platform];
  const top = [...a.posts].sort((x, y) => y.views - x.views).slice(0, 8);
  const commentTotal = a.comments.questions + a.comments.complaints + a.comments.corrections + a.comments.praise;

  const kpis = [
    a.avgWatch !== null && {
      label: "Rata-rata tonton",
      value: `${a.avgWatch}%`,
      target: `target ≥ ${project.watchTarget}%`,
      ok: a.avgWatch >= project.watchTarget,
    },
    {
      label: "Ritme",
      value: `${String(a.postsPerWeek).replace(".", ",")} / mgg`,
      target: `target ${project.postsPerWeek}`,
      ok: a.postsPerWeek >= project.postsPerWeek,
    },
    { label: "Reach non-follower", value: `${a.nonFollower}%`, target: "acuan ≥ 40%", ok: a.nonFollower >= 40 },
    { label: "Median views", value: fmtNum(a.medianViews), target: `total ${fmtNum(a.totalViews)}`, ok: null },
    a.avgCarouselSaves !== null && { label: "Saves carousel", value: String(a.avgCarouselSaves), target: "rata-rata per post", ok: null },
  ].filter(Boolean) as { label: string; value: string; target: string; ok: boolean | null }[];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader eyebrow={`Analisis · 30 post, ${fmtDate(a.posts.at(-1)!.date)} – ${fmtDate(a.posts[0].date)}`} title={`@${a.account.handle} di ${meta.name}`}>
        {analyses.length > 1 && (
          <nav aria-label="Pilih akun" className="flex gap-3">
            {analyses.map((x) => {
              const active = x === a;
              return (
                <Link
                  key={x.account.platform}
                  href={`/dashboard/analisis?p=${x.account.platform}`}
                  aria-current={active ? "page" : undefined}
                  className={"px-btn px-4 py-2 text-sm font-bold " + (active ? "bg-forsythia [--shade:var(--color-saffron)]" : "bg-arctic [--shade:var(--color-mint)]")}
                >
                  <Sprite grid={ICONS[x.account.platform]} colors={{ k: C.current }} scale={1.5} />
                  {PLATFORMS[x.account.platform].name}
                </Link>
              );
            })}
          </nav>
        )}
      </PageHeader>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <li key={k.label} className="px-box m-1 bg-arctic p-5">
            <p className="text-sm font-medium text-nocturnal">{k.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{k.value}</p>
            <p className="mt-1 text-sm text-nocturnal">
              {k.ok === true && <span className="font-semibold">▲ </span>}
              {k.ok === false && <span className="mr-1 bg-saffron px-1 font-bold text-noir">!</span>}
              {k.target}
            </p>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6" aria-labelledby="findings-title">
          <h2 id="findings-title" className="text-lg font-bold">
            {a.findings.length} temuan
          </h2>
          <p className="mt-1 text-sm text-nocturnal">Setiap temuan menyebut angka dan sumbernya. Salah atau kurang? Koreksi sebelum memilih rekomendasi (G1).</p>
          <ol className="mt-6 space-y-5">
            {a.findings.map((f, i) => (
              <li key={f.text} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-noir text-sm font-bold text-forsythia">{i + 1}</span>
                <div>
                  <p>{f.text}</p>
                  <p className="mt-1 text-xs text-nocturnal">Sumber: {f.source}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-t-4 border-mint pt-5">
            <h3 className="text-sm font-bold">Belum diketahui</h3>
            <ul className="mt-2 space-y-1 text-sm text-nocturnal">
              {a.unknowns.map((u) => (
                <li key={u}>· {u}</li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="min-w-0" aria-labelledby="top-title">
            <h2 id="top-title" className="p-6 pb-4 text-lg font-bold">
              Post teratas
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-y-4 border-noir bg-mint">
                  <tr>
                    <th scope="col" className="px-6 py-2.5 font-semibold">Post</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Views</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">vs median</th>
                    <th scope="col" className="px-6 py-2.5 font-semibold">{a.avgWatch !== null ? "Tonton / saves" : "Saves"}</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((post) => {
                    const ratio = post.views / a.medianViews;
                    return (
                      <tr key={post.id} className="border-b-2 border-mint last:border-b-0">
                        <td className="px-6 py-3">
                          <p className="font-semibold first-letter:uppercase">{post.topic}</p>
                          <p className="text-xs text-nocturnal">
                            {post.id} · {post.format} · {String(post.hour).padStart(2, "0")}.00
                          </p>
                        </td>
                        <td className="px-3 py-3 tabular-nums">{fmtNum(post.views)}</td>
                        <td className="px-3 py-3">
                          <span className={"px-1.5 py-0.5 text-xs font-bold tabular-nums " + (ratio >= 2 ? "bg-saffron" : "")}>{fmtRatio(ratio)}</span>
                        </td>
                        <td className="px-6 py-3 tabular-nums">{post.avgWatch !== null ? `${post.avgWatch}% tonton` : `${post.saves} saves`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6" aria-labelledby="comments-title">
            <h2 id="comments-title" className="text-lg font-bold">
              Sortir komentar
            </h2>
            <ul className="mt-5 space-y-3">
              {[
                { label: "Pertanyaan", n: a.comments.questions, cls: "bg-forsythia" },
                { label: "Pujian", n: a.comments.praise, cls: "bg-nocturnal" },
                { label: "Keluhan", n: a.comments.complaints, cls: "bg-saffron" },
                { label: "Koreksi", n: a.comments.corrections, cls: "bg-noir" },
              ].map((c) => (
                <li key={c.label} className="grid grid-cols-[96px_1fr_48px] items-center gap-3 text-sm">
                  <span className="font-semibold">{c.label}</span>
                  <span className="h-4 bg-mint">
                    <span className={"block h-4 " + c.cls} style={{ width: `${Math.round((c.n / commentTotal) * 100)}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{c.n}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <section aria-labelledby="recs-title">
        <h2 id="recs-title" className="text-2xl font-bold">
          {a.recommendations.length} rekomendasi
        </h2>
        <p className="mt-1 text-nocturnal">Pilih yang mau dikerjakan di siklus ini (G2). Setiap rekomendasi membawa buktinya ke brief konten.</p>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          {a.recommendations.map((r) => (
            <li key={r.id} className="px-box m-1 flex flex-col bg-arctic p-6">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className={"px-2 py-1 " + CONFIDENCE[r.confidence]}>Keyakinan {r.confidence.toLowerCase()}</span>
                <span className="bg-mint px-2 py-1">Effort {r.effort}</span>
                <span className="bg-mint px-2 py-1">{r.metric}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{r.title}</h3>
              <p className="mt-2 text-sm">
                <span className="font-semibold">Bukti:</span> {r.evidence}
              </p>
              <p className="mt-1 flex-1 text-sm text-nocturnal">
                <span className="font-semibold">Risiko:</span> {r.risk}
              </p>
              {r.angle ? (
                <Link href={`/dashboard/konten/baru?rec=${r.id}`} className="px-btn mt-6 self-start bg-forsythia px-4 py-2.5 text-sm font-bold [--shade:var(--color-saffron)]">
                  <Sprite grid={ICONS.plus} colors={{ k: C.current }} scale={1.5} />
                  Buat konten dari ini
                </Link>
              ) : (
                <p className="mt-6 text-sm font-semibold text-nocturnal">Dipakai otomatis sebagai saran slot di jadwal.</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
