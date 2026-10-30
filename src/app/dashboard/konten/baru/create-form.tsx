"use client";

import { useMemo, useState, useTransition } from "react";
import { createDraft } from "@/app/actions/project";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";
import { addDays, fmtDate, hooksFor, type Recommendation } from "@/lib/mock";
import { PLATFORMS, VIDEO_FORMATS } from "@/lib/platforms";
import type { PlatformId } from "@/lib/types";

type Props = {
  project: {
    audience: string;
    forbidden: string;
    watchTarget: number;
    platforms: PlatformId[];
    handles: Record<string, string>;
  };
  recs: Recommendation[];
  carouselSaves: Record<string, number | null>;
  slot: { day: string; time: string };
  initialRecId: string | null;
};

const TIMES = ["08:00", "12:00", "17:00", "19:00", "20:00", "21:00"];
const inputCls = "px-input block w-full px-4 py-3 text-base outline-none";

export function CreateForm({ project, recs, carouselSaves, slot, initialRecId }: Props) {
  const initialRec = recs.find((r) => r.id === initialRecId) ?? null;
  const [recId, setRecId] = useState<string | null>(initialRec?.id ?? null);
  const [platform, setPlatform] = useState<PlatformId>(initialRec?.platform ?? project.platforms[0]);
  const [format, setFormat] = useState(initialRec?.format ?? PLATFORMS[project.platforms[0]].formats[0]);
  const [angle, setAngle] = useState(initialRec?.angle ?? "");
  const [hooks, setHooks] = useState<ReturnType<typeof hooksFor>>([]);
  const [hookIndex, setHookIndex] = useState(0);
  const [day, setDay] = useState(slot.day);
  const [time, setTime] = useState(slot.time);
  const [claims, setClaims] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const rec = recs.find((r) => r.id === recId) ?? null;
  const video = VIDEO_FORMATS.has(format);
  const hook = hooks[hookIndex]?.text ?? "";

  const target = video
    ? { metric: "Rata-rata tonton", value: `≥ ${project.watchTarget}%` }
    : format === "Carousel"
      ? { metric: "Saves", value: `≥ ${Math.round((carouselSaves[platform] ?? 20) * 1.3)}` }
      : { metric: "Reach non-follower", value: "≥ 40%" };
  const checkDate = addDays(day, 7);

  const forbiddenHits = useMemo(() => {
    const words = project.forbidden
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
    const text = `${angle} ${hook}`.toLowerCase();
    return words.filter((w) => text.includes(w));
  }, [project.forbidden, angle, hook]);

  const beats = video
    ? [`Hook (0–3 detik): ${hook || "pilih hook"}`, "Lead: janji yang didapat penonton", "Isi: 3 poin, rehook sebelum detik ke-20", "CTA: satu ajakan saja"]
    : [`Slide 1: ${hook || "pilih hook"}`, "Slide 2–6: satu poin per slide", "Slide terakhir: ajakan simpan"];

  const pickRec = (r: Recommendation | null) => {
    setRecId(r?.id ?? null);
    setHooks([]);
    setHookIndex(0);
    if (r) {
      setPlatform(r.platform);
      setFormat(r.format!);
      setAngle(r.angle!);
    } else {
      setAngle("");
    }
  };

  const generateHooks = () => {
    const list = hooksFor(angle, rec?.id.endsWith("-hook") ?? false);
    setHooks(list);
    setHookIndex(list.findIndex((h) => h.recommended));
  };

  const submit = () =>
    startTransition(async () => {
      setError(undefined);
      try {
        await createDraft({
          angle: angle.trim(),
          platform,
          format,
          hook,
          hooks: hooks.map((h) => h.text),
          evidence: rec ? `${rec.title}: ${rec.evidence}` : null,
          metric: target.metric,
          successTarget: target.value,
          slot: `${day}T${time}`,
          checkDate,
          claims: claims.trim(),
        });
      } catch (e) {
        // redirect() from the action surfaces as a navigation, not an error
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) setError(e.message);
      }
    });

  const ready = angle.trim().length >= 4 && hook && day;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-10">
        <section className="px-box m-1 bg-arctic p-6" aria-labelledby="source-title">
          <h2 id="source-title" className="text-lg font-bold">
            1. Mulai dari mana?
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-labelledby="source-title">
            {recs.map((r) => (
              <SourceOption key={r.id} selected={recId === r.id} onSelect={() => pickRec(r)} title={r.title} detail={`${PLATFORMS[r.platform].short} · ${r.evidence}`} />
            ))}
            <SourceOption selected={recId === null} onSelect={() => pickRec(null)} title="Ide sendiri" detail="Lewati rekomendasi; brief ditandai owner's call." />
          </div>
        </section>

        <section className="px-box m-1 bg-arctic p-6" aria-labelledby="detail-title">
          <h2 id="detail-title" className="text-lg font-bold">
            2. Platform dan sudut
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="platform" className="block text-sm font-semibold">
                Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => {
                  const p = e.target.value as PlatformId;
                  setPlatform(p);
                  setFormat(PLATFORMS[p].formats[0]);
                }}
                className={inputCls}
              >
                {project.platforms.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORMS[p].name} · @{project.handles[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label htmlFor="format" className="block text-sm font-semibold">
                Format
              </label>
              <select id="format" value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
                {PLATFORMS[platform].formats.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <label htmlFor="angle" className="block text-sm font-semibold">
              Sudut / janji konten
            </label>
            <input
              id="angle"
              value={angle}
              onChange={(e) => {
                setAngle(e.target.value);
                setHooks([]);
              }}
              maxLength={120}
              placeholder="Contoh: Cara seduh kopi V60 tanpa alat mahal"
              className={inputCls}
            />
            <p className="text-sm text-nocturnal">Satu ide per konten. Untuk: {project.audience}</p>
          </div>
        </section>

        <section className="px-box m-1 bg-arctic p-6" aria-labelledby="hook-title">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="hook-title" className="text-lg font-bold">
              3. Hook
            </h2>
            <button type="button" onClick={generateHooks} disabled={angle.trim().length < 4} className="px-btn bg-forsythia px-4 py-2 text-sm font-bold disabled:opacity-50 [--shade:var(--color-saffron)]">
              <Sprite grid={ICONS.play} colors={{ k: C.current }} scale={1.5} />
              {hooks.length ? "Buat ulang" : "Buat 3 hook"}
            </button>
          </div>
          {hooks.length === 0 ? (
            <p className="mt-4 text-nocturnal">Isi sudut konten, lalu minta 3 hook dari pola berbeda.</p>
          ) : (
            <fieldset className="mt-5 space-y-3">
              <legend className="sr-only">Pilih hook</legend>
              {hooks.map((h, i) => (
                <label key={h.text} className={"flex cursor-pointer gap-3 p-4 " + (hookIndex === i ? "bg-forsythia/40 outline-4 outline-noir" : "bg-mint")}>
                  <input type="radio" name="hook" checked={hookIndex === i} onChange={() => setHookIndex(i)} className="mt-1 accent-nocturnal" />
                  <span>
                    <span className="block font-semibold">{h.text}</span>
                    <span className="text-sm text-nocturnal">
                      {h.pattern}
                      {h.recommended && " · direkomendasikan"}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
        </section>

        <section className="px-box m-1 bg-arctic p-6" aria-labelledby="slot-title">
          <h2 id="slot-title" className="text-lg font-bold">
            4. Slot dan klaim
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="day" className="block text-sm font-semibold">
                Tanggal
              </label>
              <input id="day" type="date" value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-3">
              <label htmlFor="time" className="block text-sm font-semibold">
                Jam
              </label>
              <select id="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-sm text-nocturnal">Saran dari data: 19.00–21.00, post malam dapat views lebih tinggi.</p>
          <div className="mt-6 space-y-3">
            <label htmlFor="claims" className="block text-sm font-semibold">
              Klaim yang harus dicek (opsional)
            </label>
            <textarea id="claims" rows={2} value={claims} onChange={(e) => setClaims(e.target.value)} placeholder="Contoh: harga Rp18.000, buka jam 07.00" className={inputCls} />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-8" aria-labelledby="brief-title">
        <div className="px-box m-1 bg-noir p-6 text-arctic [--line:var(--color-noir)]">
          <p className="text-xs font-semibold text-forsythia">BRIEF · menunggu G3</p>
          <h2 id="brief-title" className="mt-2 text-xl font-bold">
            {angle || "Sudut konten belum diisi"}
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <BriefRow label="Platform">
              {PLATFORMS[platform].name} {format} · @{project.handles[platform]}
            </BriefRow>
            <BriefRow label="Slot">
              {fmtDate(day, true)} · {time.replace(":", ".")}
            </BriefRow>
            <BriefRow label="Target">
              {target.metric} {target.value}, dicek {fmtDate(checkDate)}
            </BriefRow>
            <BriefRow label="Bukti">{rec ? rec.evidence : "Owner's call"}</BriefRow>
          </dl>
          <div className="mt-5 border-t-2 border-nocturnal pt-4">
            <p className="text-xs font-semibold text-mint">Urutan beat</p>
            <ol className="mt-2 space-y-1.5 text-sm">
              {beats.map((b) => (
                <li key={b}>▸ {b}</li>
              ))}
            </ol>
          </div>
          {forbiddenHits.length > 0 && (
            <p role="alert" className="mt-5 bg-saffron px-3 py-2 text-sm font-semibold text-noir">
              Kata dilarang terdeteksi: {forbiddenHits.join(", ")}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-5 bg-saffron px-3 py-2 text-sm font-semibold text-noir">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!ready || pending || forbiddenHits.length > 0}
            className="px-btn mt-6 w-full bg-forsythia px-5 py-3 font-bold text-noir disabled:cursor-not-allowed disabled:opacity-50 [--line:var(--color-arctic)] [--shade:var(--color-saffron)]"
          >
            {pending ? "Menyimpan…" : "Kirim ke checkpoint G3"}
          </button>
          {!ready && <p className="mt-3 text-center text-xs text-mint">Isi sudut dan pilih hook untuk melanjutkan.</p>}
        </div>
      </aside>
    </div>
  );
}

function SourceOption({ selected, onSelect, title, detail }: { selected: boolean; onSelect: () => void; title: string; detail: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={"p-4 text-left " + (selected ? "bg-forsythia/40 outline-4 outline-noir" : "bg-mint hover:bg-mint/70")}>
      <span className="block font-semibold">{title}</span>
      <span className="mt-1 block text-sm text-nocturnal">{detail}</span>
    </button>
  );
}

function BriefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <dt className="text-mint">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
