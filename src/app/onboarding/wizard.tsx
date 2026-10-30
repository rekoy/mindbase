"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProject } from "@/app/actions/project";
import { Sprite } from "@/components/sprite";
import { C, ICONS, MASCOT, MASCOT_COLORS } from "@/components/sprites";
import { CATEGORIES, accountStats, fmtNum, normalizeHandle, suggestPrefix } from "@/lib/mock";
import { PLATFORMS, PLATFORM_ORDER } from "@/lib/platforms";
import type { PlatformId, Project } from "@/lib/types";

const STEPS = ["Project", "Hubungkan akun", "Profil brand", "Sinkron data"];
const VOICES = ["Santai", "Profesional", "Lucu", "Edukatif", "Hangat", "Berani", "Premium"];

type Connected = { platform: PlatformId; handle: string; followers: number; posts: number };

export function Wizard({ email }: { email: string }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    prefix: "",
    category: CATEGORIES[0],
    timezone: "WIB" as Project["timezone"],
    language: "Bahasa Indonesia",
    audience: "",
    voice: [] as string[],
    forbidden: "",
    postsPerWeek: 4,
    watchTarget: 40,
    approver: email,
  });
  const [prefixEdited, setPrefixEdited] = useState(false);
  const [accounts, setAccounts] = useState<Connected[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const prefix = prefixEdited ? form.prefix : suggestPrefix(form.name);
  const canNext = [
    form.name.trim().length > 0 && /^[A-Z]{2,4}$/.test(prefix),
    accounts.length > 0,
    form.audience.trim().length > 0 && form.voice.length > 0,
    true,
  ][step];

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
      <ol className="grid grid-cols-4 gap-2" aria-label="Langkah">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className={"h-3 " + (i < step ? "bg-nocturnal" : i === step ? "bg-forsythia" : "bg-arctic")} />
            <p className={"mt-2 text-xs font-semibold sm:text-sm " + (i === step ? "text-noir" : "text-nocturnal/70")}>
              <span className="hidden sm:inline">{i + 1}. </span>
              {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="px-box m-1 mt-10 bg-arctic p-6 sm:p-10">
        {step === 0 && (
          <StepProject headingRef={headingRef} form={form} set={set} prefix={prefix} onPrefix={(v) => { setPrefixEdited(true); set("prefix", v); }} />
        )}
        {step === 1 && (
          <StepConnect headingRef={headingRef} brandName={form.name} accounts={accounts} setAccounts={setAccounts} />
        )}
        {step === 2 && <StepProfile headingRef={headingRef} form={form} set={set} />}
        {step === 3 && (
          <StepSync
            headingRef={headingRef}
            accounts={accounts}
            input={{ ...form, prefix, accounts: accounts.map(({ platform, handle }) => ({ platform, handle })) }}
            onBack={() => setStep(2)}
          />
        )}

        {step < 3 && (
          <div className="mt-10 flex items-center justify-between border-t-4 border-mint pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={"font-semibold text-nocturnal hover:text-noir " + (step === 0 ? "invisible" : "")}
            >
              ← Kembali
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="px-btn bg-forsythia px-6 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50 [--shade:var(--color-saffron)]"
            >
              Lanjut
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

type FormState = {
  name: string;
  description: string;
  prefix: string;
  category: string;
  timezone: Project["timezone"];
  language: string;
  audience: string;
  voice: string[];
  forbidden: string;
  postsPerWeek: number;
  watchTarget: number;
  approver: string;
};
type Setter = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
type HeadingRef = React.RefObject<HTMLHeadingElement | null>;

function StepHeading({ headingRef, eyebrow, title, children }: { headingRef: HeadingRef; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-nocturnal">{eyebrow}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold outline-none sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-nocturnal">{children}</p>
    </div>
  );
}

function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-3">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-nocturnal">{hint}</p>}
    </div>
  );
}

const inputCls = "px-input block w-full px-4 py-3 text-base outline-none";

function StepProject({ headingRef, form, set, prefix, onPrefix }: { headingRef: HeadingRef; form: FormState; set: Setter; prefix: string; onPrefix: (v: string) => void }) {
  return (
    <>
      <StepHeading headingRef={headingRef} eyebrow="Langkah 1 dari 4" title="Buat project untuk brand kamu">
        Satu project = satu brand. Semua akun, data, dan konten brand ini tersimpan di sini.
      </StepHeading>
      <div className="mt-8 grid gap-7 sm:grid-cols-[1fr_160px]">
        <Field label="Nama brand" htmlFor="name">
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} placeholder="Contoh: Kopi Pagi" className={inputCls} autoComplete="organization" />
        </Field>
        <Field label="Prefix ID konten" htmlFor="prefix" hint={prefix ? `${prefix}-261102-01` : "2–4 huruf"}>
          <input id="prefix" value={prefix} onChange={(e) => onPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4))} className={inputCls + " uppercase"} />
        </Field>
      </div>
      <div className="mt-7 space-y-7">
        <Field label="Deskripsi satu kalimat" htmlFor="description" hint="Dipakai AI sebagai konteks di setiap naskah dan rekomendasi.">
          <input id="description" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={140} placeholder="Contoh: Kedai kopi susu gula aren untuk pekerja kantoran di Jakarta Selatan." className={inputCls} />
        </Field>
        <div className="grid gap-7 sm:grid-cols-3">
          <Field label="Kategori" htmlFor="category">
            <select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Zona waktu" htmlFor="timezone">
            <select id="timezone" value={form.timezone} onChange={(e) => set("timezone", e.target.value as FormState["timezone"])} className={inputCls}>
              <option>WIB</option>
              <option>WITA</option>
              <option>WIT</option>
            </select>
          </Field>
          <Field label="Bahasa konten" htmlFor="language">
            <select id="language" value={form.language} onChange={(e) => set("language", e.target.value)} className={inputCls}>
              <option>Bahasa Indonesia</option>
              <option>English</option>
              <option>Campuran</option>
            </select>
          </Field>
        </div>
      </div>
    </>
  );
}

type OAuthPhase = { platform: PlatformId; stage: "consent" | "connecting"; handle: string; line: number };

function StepConnect({ headingRef, brandName, accounts, setAccounts }: { headingRef: HeadingRef; brandName: string; accounts: Connected[]; setAccounts: React.Dispatch<React.SetStateAction<Connected[]>> }) {
  const [oauth, setOauth] = useState<OAuthPhase | null>(null);

  // Simulated OAuth round trip: consent → token exchange → first profile read.
  useEffect(() => {
    if (oauth?.stage !== "connecting") return;
    const t = setTimeout(() => {
      if (oauth.line < 2) {
        setOauth({ ...oauth, line: oauth.line + 1 });
        return;
      }
      const handle = normalizeHandle(oauth.handle);
      setAccounts((list) => [...list.filter((a) => a.platform !== oauth.platform), { platform: oauth.platform, handle, ...accountStats(oauth.platform, handle) }]);
      setOauth(null);
    }, 550);
    return () => clearTimeout(t);
  }, [oauth, setAccounts]);

  return (
    <>
      <StepHeading headingRef={headingRef} eyebrow="Langkah 2 dari 4" title="Hubungkan akun sosial media">
        mindbase membaca data lewat API resmi tiap platform. Hubungkan minimal satu akun untuk mulai menganalisis dan membuat konten.
      </StepHeading>

      <ul className="mt-8 grid gap-8 sm:grid-cols-2">
        {PLATFORM_ORDER.map((id) => {
          const meta = PLATFORMS[id];
          const connected = accounts.find((a) => a.platform === id);
          return (
            <li key={id} className={"px-box m-1 flex flex-col p-5 " + (connected ? "bg-mint" : "bg-arctic") + (meta.available ? "" : " opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={"flex h-10 w-10 items-center justify-center " + (connected ? "bg-nocturnal text-forsythia" : "bg-noir text-arctic")}>
                    <Sprite grid={ICONS[id]} colors={{ k: C.current }} scale={2.5} />
                  </span>
                  <div>
                    <p className="font-bold">{meta.name}</p>
                    <p className="text-xs text-nocturnal">{meta.api}</p>
                  </div>
                </div>
                {!meta.available && <span className="shrink-0 bg-noir px-2 py-0.5 text-xs font-bold whitespace-nowrap text-forsythia">{meta.release} · segera</span>}
              </div>

              {connected ? (
                <div className="mt-5 flex-1">
                  <p className="font-semibold">✔ @{connected.handle}</p>
                  <p className="text-sm text-nocturnal">
                    {fmtNum(connected.followers)} follower · {connected.posts} post
                  </p>
                  <p className="mt-2 text-xs text-nocturnal">Token disimpan terenkripsi dan tidak pernah ditampilkan.</p>
                  <button type="button" onClick={() => setAccounts((list) => list.filter((a) => a.platform !== id))} className="mt-3 text-sm font-semibold underline underline-offset-4 hover:text-saffron">
                    Putuskan
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
                  <p className="text-sm text-nocturnal">{meta.requirement}</p>
                  <button
                    type="button"
                    disabled={!meta.available}
                    onClick={() => setOauth({ platform: id, stage: "consent", handle: normalizeHandle(brandName), line: 0 })}
                    className="px-btn self-start bg-forsythia px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-mint [--shade:var(--color-saffron)]"
                  >
                    {meta.available ? "Hubungkan" : "Belum tersedia"}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {oauth && <OAuthDialog phase={oauth} setPhase={setOauth} />}
    </>
  );
}

function OAuthDialog({ phase, setPhase }: { phase: OAuthPhase; setPhase: React.Dispatch<React.SetStateAction<OAuthPhase | null>> }) {
  const meta = PLATFORMS[phase.platform];
  const inputRef = useRef<HTMLInputElement>(null);
  const handle = normalizeHandle(phase.handle);
  const lines = [`Mengarahkan ke ${meta.login}…`, "Menukar kode otorisasi dengan token…", `Membaca profil @${handle}…`];

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase.stage === "consent") setPhase(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase.stage, setPhase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/70 p-4" role="dialog" aria-modal="true" aria-labelledby="oauth-title">
      <div className="px-box w-full max-w-md bg-arctic">
        <div className="flex items-center gap-3 bg-noir px-5 py-4 text-arctic">
          <Sprite grid={ICONS[phase.platform]} colors={{ k: C.current }} scale={2.5} />
          <p id="oauth-title" className="font-bold">
            {meta.login}
          </p>
        </div>

        {phase.stage === "consent" ? (
          <form
            className="space-y-6 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (handle) setPhase({ ...phase, stage: "connecting", line: 0 });
            }}
          >
            <p>
              <strong>mindbase</strong> ingin mengakses akun {meta.name} kamu:
            </p>
            <ul className="space-y-2 text-sm">
              {meta.scopes.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span aria-hidden className="text-saffron">■</span>
                  <span>
                    {s.label} <code className="text-xs text-nocturnal">{s.id}</code>
                  </span>
                </li>
              ))}
            </ul>
            <Field label="Akun yang dihubungkan" htmlFor="oauth-handle" hint={meta.requirement}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-nocturnal">@</span>
                <input ref={inputRef} id="oauth-handle" value={phase.handle} onChange={(e) => setPhase({ ...phase, handle: e.target.value })} placeholder="username" className={inputCls} />
              </div>
            </Field>
            {meta.note && <p className="px-flat mx-1 bg-forsythia/20 px-3 py-2 text-sm [--line:var(--color-forsythia)]">{meta.note}</p>}
            <div className="flex justify-end gap-5">
              <button type="button" onClick={() => setPhase(null)} className="font-semibold text-nocturnal hover:text-noir">
                Batal
              </button>
              <button type="submit" disabled={!handle} className="px-btn bg-forsythia px-5 py-2.5 font-bold disabled:opacity-50 [--shade:var(--color-saffron)]">
                Izinkan akses
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 p-6" role="status" aria-live="polite">
            {lines.map((line, i) => (
              <p key={line} className={i < phase.line ? "text-nocturnal" : i === phase.line ? "font-semibold" : "text-nocturnal/40"}>
                {i < phase.line ? "✔ " : i === phase.line ? "▶ " : "· "}
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepProfile({ headingRef, form, set }: { headingRef: HeadingRef; form: FormState; set: Setter }) {
  const toggleVoice = (v: string) =>
    set("voice", form.voice.includes(v) ? form.voice.filter((x) => x !== v) : form.voice.length < 3 ? [...form.voice, v] : form.voice);

  return (
    <>
      <StepHeading headingRef={headingRef} eyebrow="Langkah 3 dari 4" title="Profil brand">
        AI memakai profil ini di setiap rekomendasi dan naskah. Bisa diubah kapan saja di Brand Hub.
      </StepHeading>
      <div className="mt-8 space-y-8">
        <Field label="Audiens utama (satu orang, spesifik)" htmlFor="audience">
          <textarea id="audience" rows={3} value={form.audience} onChange={(e) => set("audience", e.target.value)} maxLength={300} placeholder="Contoh: Rina, 27 tahun, karyawan di Jakarta, beli kopi 3× seminggu dan peduli harga." className={inputCls} />
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold">Suara brand (pilih sampai 3)</legend>
          <div className="mt-4 flex flex-wrap gap-4">
            {VOICES.map((v) => {
              const on = form.voice.includes(v);
              return (
                <button key={v} type="button" aria-pressed={on} onClick={() => toggleVoice(v)} className={"px-btn px-4 py-2 text-sm font-semibold " + (on ? "bg-forsythia" : "bg-arctic [--shade:var(--color-mint)]")}>
                  {v}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Kata yang dilarang" htmlFor="forbidden" hint="Pisahkan dengan koma. AI akan memperingatkan kalau kata ini muncul.">
          <input id="forbidden" value={form.forbidden} onChange={(e) => set("forbidden", e.target.value)} placeholder="Contoh: termurah, terbaik, dijamin" className={inputCls} />
        </Field>

        <div className="grid gap-7 sm:grid-cols-3">
          <Field label={`Target ritme: ${form.postsPerWeek} post / minggu`} htmlFor="ppw">
            <input id="ppw" type="range" min={1} max={14} value={form.postsPerWeek} onChange={(e) => set("postsPerWeek", Number(e.target.value))} className="w-full accent-nocturnal" />
          </Field>
          <Field label="Target rata-rata tonton (%)" htmlFor="watch">
            <input id="watch" type="number" min={10} max={90} value={form.watchTarget} onChange={(e) => set("watchTarget", Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Yang menyetujui konten" htmlFor="approver">
            <input id="approver" type="email" value={form.approver} onChange={(e) => set("approver", e.target.value)} className={inputCls} />
          </Field>
        </div>
      </div>
    </>
  );
}

function StepSync({ headingRef, accounts, input, onBack }: { headingRef: HeadingRef; accounts: Connected[]; input: Parameters<typeof createProject>[0]; onBack: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [line, setLine] = useState(-1);

  const lines = [
    ...accounts.map((a) => `Mengambil 30 post terakhir dari @${a.handle} (${PLATFORMS[a.platform].name})`),
    "Membaca insight: views, rata-rata tonton, saves, shares, reach non-follower",
    "Mengambil dan menyortir komentar",
    "Menghitung median akun dan mencari outlier",
    "Menyusun temuan dan rekomendasi pertama",
  ];
  const done = line >= lines.length;

  useEffect(() => {
    if (line < 0 || done) return;
    const t = setTimeout(() => setLine((l) => l + 1), 650);
    return () => clearTimeout(t);
  }, [line, done]);

  const start = () =>
    startTransition(async () => {
      setError(undefined);
      const res = await createProject(input);
      if (res.error) setError(res.error);
      else setLine(0);
    });

  if (line >= 0) {
    return (
      <div>
        <div className="flex items-center gap-5">
          <Sprite grid={MASCOT} colors={MASCOT_COLORS} scale={5} className={done ? "" : "anim-bob"} title="Mindy" />
          <div>
            <p className="text-sm font-semibold text-nocturnal">Langkah 4 dari 4</p>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
              {done ? "Project siap!" : "Menyinkronkan data…"}
            </h1>
          </div>
        </div>
        <ol className="mt-8 space-y-3" role="status" aria-live="polite">
          {lines.map((text, i) => (
            <li key={text} className={i < line ? "text-nocturnal" : i === line ? "font-semibold" : "text-nocturnal/40"}>
              {i < line ? "✔ " : i === line ? "▶ " : "· "}
              {text}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex gap-1 bg-noir p-1" role="img" aria-label={`Sinkronisasi ${Math.round((Math.min(line, lines.length) / lines.length) * 100)} persen`}>
          {lines.map((text, i) => (
            <span key={text} className={"h-4 flex-1 " + (i < line ? "bg-forsythia" : "bg-nocturnal")} />
          ))}
        </div>

        {done && (
          <div className="mt-10 border-t-4 border-mint pt-8">
            <p className="text-lg">
              Temuan pertama dari <strong>{accounts.length * 30} post</strong> sudah siap. Mau mulai dari mana?
            </p>
            {/* Plain links on purpose: a full load drops router cache entries made
                before the project existed (they still hold the redirect to onboarding). */}
            <div className="mt-6 flex flex-wrap gap-6">
              <a href="/dashboard/analisis" className="px-btn bg-forsythia px-5 py-3 font-bold [--shade:var(--color-saffron)]">
                <Sprite grid={ICONS.search} colors={{ k: C.current }} scale={2} />
                Lihat analisis
              </a>
              <a href="/dashboard/konten/baru" className="px-btn bg-arctic px-5 py-3 font-bold [--shade:var(--color-mint)]">
                <Sprite grid={ICONS.plus} colors={{ k: C.current }} scale={2} />
                Langsung buat konten
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <StepHeading headingRef={headingRef} eyebrow="Langkah 4 dari 4" title="Cek lalu mulai sinkronisasi">
        mindbase akan mengambil 30 post terakhir per akun beserta insight dan komentarnya. Tidak ada yang diposting.
      </StepHeading>
      <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
        <Summary label="Project">
          {input.name} · prefix {input.prefix}
        </Summary>
        <Summary label="Kategori">
          {input.category} · {input.timezone} · {input.language}
        </Summary>
        <Summary label="Akun">{accounts.map((a) => `@${a.handle} (${PLATFORMS[a.platform].short})`).join(", ")}</Summary>
        <Summary label="Suara brand">{input.voice.join(", ")}</Summary>
        <Summary label="Target">
          {input.postsPerWeek} post/minggu · tonton ≥ {input.watchTarget}%
        </Summary>
        <Summary label="Approver">{input.approver}</Summary>
      </dl>
      {error && (
        <p role="alert" className="mt-6 px-flat mx-1 bg-saffron/20 px-4 py-3 text-sm font-medium [--line:var(--color-saffron)]">
          {error}
        </p>
      )}
      <div className="mt-10 flex items-center justify-between border-t-4 border-mint pt-6">
        <button type="button" onClick={onBack} className="font-semibold text-nocturnal hover:text-noir">
          ← Kembali
        </button>
        <button type="button" onClick={start} disabled={pending} className="px-btn bg-forsythia px-6 py-3 font-bold disabled:opacity-60 [--shade:var(--color-saffron)]">
          {pending ? "Menyimpan…" : "Mulai sinkronisasi"}
        </button>
      </div>
    </>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-mint px-3 py-2">
      <dt className="text-nocturnal">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}
