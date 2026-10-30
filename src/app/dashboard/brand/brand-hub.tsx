"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { saveProject, type ProjectEdit } from "@/app/actions/brand";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";
import { COLOR_ROLES, FONTS, MAX_ASSETS, MAX_COLORS, brandOf, colorFor, contrast, googleFontsHref, isHex } from "@/lib/brand";
import { CATEGORIES, fmtDate, fmtNum } from "@/lib/mock";
import { PLATFORMS } from "@/lib/platforms";
import type { Brand, Project } from "@/lib/types";

const VOICES = ["Santai", "Profesional", "Lucu", "Edukatif", "Hangat", "Berani", "Premium"];
const inputCls = "px-input block w-full px-4 py-3 text-base outline-none";
const assetUrl = (id: string) => `/api/assets/${id}`;

/** Keeps the "saved" message alive while the editor remounts with fresh data. */
export function BrandHub({ project, version }: { project: Project; version: string }) {
  const [flash, setFlash] = useState<string>();
  return <Editor key={version} project={project} flash={flash} onSaved={setFlash} />;
}

function toEdit(project: Project): ProjectEdit {
  return {
    name: project.name,
    description: project.description,
    category: project.category,
    timezone: project.timezone,
    language: project.language,
    audience: project.audience,
    voice: project.voice,
    forbidden: project.forbidden,
    postsPerWeek: project.postsPerWeek,
    watchTarget: project.watchTarget,
    approver: project.approver,
    brand: brandOf(project),
    note: "",
  };
}

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/assets", { method: "POST", body });
  const data = (await res.json()) as { id?: string; error?: string };
  if (!res.ok || !data.id) throw new Error(data.error ?? "Upload gagal.");
  return data.id;
}

function Editor({ project, flash, onSaved }: { project: Project; flash?: string; onSaved: (msg: string) => void }) {
  const [initial] = useState(() => toEdit(project));
  const [edit, setEdit] = useState(initial);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(edit) !== JSON.stringify(initial);

  const set = <K extends keyof ProjectEdit>(key: K, value: ProjectEdit[K]) => setEdit((e) => ({ ...e, [key]: value }));
  const setBrand = <K extends keyof Brand>(key: K, value: Brand[K]) => setEdit((e) => ({ ...e, brand: { ...e.brand, [key]: value } }));

  const save = () =>
    startTransition(async () => {
      setError(undefined);
      const res = await saveProject(edit);
      if (res.error) setError(res.error);
      else onSaved(res.logged ? `Tersimpan. ${res.logged} perubahan dicatat di log keputusan.` : "Tersimpan.");
    });

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 lg:py-10">
      <link rel="stylesheet" href={googleFontsHref([edit.brand.headingFont, edit.brand.bodyFont])} precedence="default" />

      <ProjectHeader project={project} edit={edit} />

      {flash && !dirty && (
        <p role="status" className="px-flat mt-8 bg-forsythia px-5 py-4 font-semibold">
          ✔ {flash}
        </p>
      )}

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <LogoAndAssets brand={edit.brand} setBrand={setBrand} name={edit.name} />
          <Palette brand={edit.brand} setBrand={setBrand} />
          <Typography brand={edit.brand} setBrand={setBrand} />
          <Identity edit={edit} set={set} setBrand={setBrand} />
          <VoiceRules edit={edit} set={set} setBrand={setBrand} />
          <AudienceTargets edit={edit} set={set} />
          <Accounts project={project} />
          <DecisionLog project={project} note={edit.note} setNote={(v) => set("note", v)} />
        </div>
        <aside className="lg:sticky lg:top-8">
          <Preview edit={edit} handle={project.accounts[0]?.handle ?? ""} />
        </aside>
      </div>

      {(dirty || error) && (
        <div className="sticky bottom-4 z-20 mt-10">
          <div className="px-box flex flex-wrap items-center justify-between gap-4 bg-noir px-5 py-4 text-arctic [--line:var(--color-noir)]">
            <p className="font-semibold" role={error ? "alert" : undefined}>
              {error ? <span className="bg-saffron px-2 py-1 text-noir">{error}</span> : "Ada perubahan yang belum disimpan."}
            </p>
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => { setEdit(initial); setError(undefined); }} className="font-semibold text-mint hover:text-arctic">
                Batalkan
              </button>
              <button type="button" onClick={save} disabled={pending} className="px-btn bg-forsythia px-5 py-2.5 font-bold text-noir disabled:opacity-60 [--line:var(--color-arctic)] [--shade:var(--color-saffron)]">
                {pending ? "Menyimpan…" : "Simpan perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

type Set = <K extends keyof ProjectEdit>(key: K, value: ProjectEdit[K]) => void;
type SetBrand = <K extends keyof Brand>(key: K, value: Brand[K]) => void;

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="px-box m-1 bg-arctic p-6" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      {hint && <p className="mt-1 text-sm text-nocturnal">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
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

function LogoMark({ brand, name, size }: { brand: Brand; name: string; size: number }) {
  if (brand.logo) {
    return <Image src={assetUrl(brand.logo)} alt={`Logo ${name}`} width={size} height={size} unoptimized className="object-contain" style={{ width: size, height: size }} />;
  }
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: colorFor(brand, "Aksen", "#ffc801"), color: colorFor(brand, "Primer", "#172b36") }}
    >
      {initials}
    </span>
  );
}

function ProjectHeader({ project, edit }: { project: Project; edit: ProjectEdit }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="px-flat bg-arctic p-2">
        <LogoMark brand={edit.brand} name={edit.name} size={72} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-nocturnal">Brand Hub · prefix {project.prefix} · dibuat {fmtDate(project.createdAt)}</p>
        <h1 className="mt-1 truncate text-3xl font-bold">{edit.name || "Tanpa nama"}</h1>
        <p className="mt-1 text-nocturnal">{edit.description || "Belum ada deskripsi."}</p>
      </div>
      <ul className="flex flex-wrap gap-3">
        {project.accounts.map((a) => (
          <li key={a.platform} className="flex items-center gap-2 bg-noir px-3 py-2 text-sm text-arctic">
            <Sprite grid={ICONS[a.platform]} colors={{ k: C.forsythia }} scale={1.5} />@{a.handle}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LogoAndAssets({ brand, setBrand, name }: { brand: Brand; setBrand: SetBrand; name: string }) {
  const logoInput = useRef<HTMLInputElement>(null);
  const assetInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"logo" | "asset" | null>(null);
  const [error, setError] = useState<string>();
  const [dragOver, setDragOver] = useState(false);

  const handle = async (files: FileList | null, kind: "logo" | "asset") => {
    if (!files?.length) return;
    setError(undefined);
    setBusy(kind);
    try {
      if (kind === "logo") {
        setBrand("logo", await uploadFile(files[0]));
      } else {
        const room = MAX_ASSETS - brand.assets.length;
        const added = [];
        for (const file of Array.from(files).slice(0, room)) {
          added.push({ id: await uploadFile(file), label: file.name.replace(/\.[^.]+$/, "").slice(0, 40) });
        }
        setBrand("assets", [...brand.assets, ...added]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(null);
    }
  };

  const accept = "image/png,image/jpeg,image/webp,image/svg+xml";

  return (
    <Section id="logo-title" title="Logo dan aset" hint="PNG, JPG, WebP, atau SVG, maksimal 2 MB per file. Dipakai di desain carousel, thumbnail, dan video.">
      <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
        <div>
          <p className="text-sm font-semibold">Logo utama</p>
          <button
            type="button"
            onClick={() => logoInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files, "logo"); }}
            className={"mt-3 flex aspect-square w-full flex-col items-center justify-center gap-2 border-4 border-dashed p-4 text-center text-sm " + (dragOver ? "border-saffron bg-forsythia/20" : "border-nocturnal/40 bg-mint hover:bg-mint/70")}
            aria-label={brand.logo ? "Ganti logo" : "Upload logo"}
          >
            {busy === "logo" ? (
              <span className="font-semibold">Mengupload…</span>
            ) : brand.logo ? (
              <LogoMark brand={brand} name={name} size={120} />
            ) : (
              <>
                <Sprite grid={ICONS.plus} colors={{ k: C.nocturnal }} scale={3} />
                <span className="font-semibold">Klik atau tarik file ke sini</span>
              </>
            )}
          </button>
          <input ref={logoInput} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => { handle(e.target.files, "logo"); e.target.value = ""; }} />
          {brand.logo && (
            <div className="mt-3 flex gap-4 text-sm font-semibold">
              <button type="button" onClick={() => logoInput.current?.click()} className="underline underline-offset-4 hover:text-nocturnal">
                Ganti
              </button>
              <button type="button" onClick={() => setBrand("logo", null)} className="underline underline-offset-4 hover:text-saffron">
                Hapus
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Aset tambahan ({brand.assets.length}/{MAX_ASSETS})
            </p>
            <button
              type="button"
              disabled={brand.assets.length >= MAX_ASSETS || busy !== null}
              onClick={() => assetInput.current?.click()}
              className="px-btn bg-forsythia px-3 py-1.5 text-sm font-bold disabled:opacity-50 [--shade:var(--color-saffron)]"
            >
              {busy === "asset" ? "Mengupload…" : "Tambah aset"}
            </button>
            <input ref={assetInput} type="file" accept={accept} multiple className="sr-only" tabIndex={-1} onChange={(e) => { handle(e.target.files, "asset"); e.target.value = ""; }} />
          </div>
          {brand.assets.length === 0 ? (
            <p className="mt-4 bg-mint p-4 text-sm text-nocturnal">Logo versi lain, foto produk, maskot, atau foto talent yang sering muncul.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {brand.assets.map((a, i) => (
                <li key={a.id} className="bg-mint p-2">
                  <div className="relative aspect-square bg-[repeating-conic-gradient(var(--color-arctic)_0_25%,var(--color-mint)_0_50%)] bg-[length:16px_16px]">
                    <Image src={assetUrl(a.id)} alt={a.label || "Aset brand"} fill unoptimized className="object-contain p-2" sizes="160px" />
                  </div>
                  <label className="sr-only" htmlFor={`asset-${i}`}>
                    Nama aset
                  </label>
                  <input
                    id={`asset-${i}`}
                    value={a.label}
                    maxLength={40}
                    onChange={(e) => setBrand("assets", brand.assets.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Nama aset"
                    className="mt-2 w-full bg-arctic px-2 py-1.5 text-sm outline-none focus:outline-2 focus:outline-noir"
                  />
                  <button type="button" onClick={() => setBrand("assets", brand.assets.filter((_, j) => j !== i))} className="mt-1 text-xs font-semibold underline underline-offset-4 hover:text-saffron">
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-5 px-flat mx-1 bg-saffron/20 px-4 py-3 text-sm font-medium [--line:var(--color-saffron)]">
          {error}
        </p>
      )}
    </Section>
  );
}

function ContrastRow({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const ratio = contrast(fg, bg);
  const verdict = ratio >= 4.5 ? { text: "AA", cls: "bg-nocturnal text-arctic" } : ratio >= 3 ? { text: "Teks besar saja", cls: "bg-forsythia" } : { text: "Gagal", cls: "bg-saffron" };
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-12 shrink-0 items-center justify-center font-bold" style={{ background: bg, color: fg }} aria-hidden>
        Aa
      </span>
      <span className="flex-1">{label}</span>
      <span className="tabular-nums">{ratio.toFixed(1).replace(".", ",")}:1</span>
      <span className={"px-2 py-0.5 text-xs font-bold " + verdict.cls}>{verdict.text}</span>
    </li>
  );
}

function Palette({ brand, setBrand }: { brand: Brand; setBrand: SetBrand }) {
  const update = (i: number, patch: Partial<Brand["colors"][number]>) => setBrand("colors", brand.colors.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const valid = brand.colors.filter((c) => isHex(c.hex));
  const pick = (role: string, fallback: string) => {
    const hex = colorFor({ ...brand, colors: valid }, role, fallback);
    return isHex(hex) ? hex : fallback;
  };

  return (
    <Section id="palette-title" title="Palet warna" hint="Beri peran pada setiap warna. AI dan template desain memakai peran ini, bukan urutan.">
      <ul className="space-y-3">
        {brand.colors.map((c, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor={`color-${i}`}>
              Pilih warna {c.role}
            </label>
            <input id={`color-${i}`} type="color" value={isHex(c.hex) ? c.hex : "#000000"} onChange={(e) => update(i, { hex: e.target.value })} className="h-12 w-14 cursor-pointer border-4 border-noir bg-arctic p-0.5" />
            <label className="sr-only" htmlFor={`hex-${i}`}>
              Kode hex {c.role}
            </label>
            <input
              id={`hex-${i}`}
              value={c.hex}
              onChange={(e) => update(i, { hex: e.target.value.trim() })}
              aria-invalid={!isHex(c.hex)}
              className={"px-input w-32 px-3 py-2.5 font-mono text-sm uppercase outline-none " + (isHex(c.hex) ? "" : "bg-saffron/20")}
            />
            <label className="sr-only" htmlFor={`role-${i}`}>
              Peran warna
            </label>
            <input id={`role-${i}`} list="color-roles" value={c.role} maxLength={20} onChange={(e) => update(i, { role: e.target.value })} className="px-input min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" />
            <button type="button" onClick={() => setBrand("colors", brand.colors.filter((_, j) => j !== i))} disabled={brand.colors.length <= 1} className="text-sm font-semibold underline underline-offset-4 hover:text-saffron disabled:opacity-40">
              Hapus
            </button>
          </li>
        ))}
      </ul>
      <datalist id="color-roles">
        {COLOR_ROLES.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <button
        type="button"
        disabled={brand.colors.length >= MAX_COLORS}
        onClick={() => setBrand("colors", [...brand.colors, { role: "Aksen 2", hex: "#ff9932" }])}
        className="px-btn mt-5 bg-arctic px-3 py-1.5 text-sm font-bold disabled:opacity-50 [--shade:var(--color-mint)]"
      >
        Tambah warna ({brand.colors.length}/{MAX_COLORS})
      </button>

      <div className="mt-8 border-t-4 border-mint pt-5">
        <h3 className="text-sm font-bold">Cek kontras (WCAG)</h3>
        <ul className="mt-3 space-y-2">
          <ContrastRow label="Teks di atas Latar" fg={pick("Teks", "#172b36")} bg={pick("Latar", "#f1f6f4")} />
          <ContrastRow label="Latar di atas Primer (judul slide)" fg={pick("Latar", "#f1f6f4")} bg={pick("Primer", "#172b36")} />
          <ContrastRow label="Primer di atas Aksen (tombol CTA)" fg={pick("Primer", "#172b36")} bg={pick("Aksen", "#ffc801")} />
        </ul>
      </div>
    </Section>
  );
}

function Typography({ brand, setBrand }: { brand: Brand; setBrand: SetBrand }) {
  return (
    <Section id="type-title" title="Tipografi" hint="Font dari Google Fonts. Judul untuk hook dan teks layar, isi untuk caption dan slide.">
      <div className="grid gap-6 sm:grid-cols-2">
        {(["headingFont", "bodyFont"] as const).map((key) => (
          <Field key={key} label={key === "headingFont" ? "Font judul" : "Font isi"} htmlFor={key}>
            <select id={key} value={brand[key]} onChange={(e) => setBrand(key, e.target.value)} className={inputCls}>
              {FONTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <p className="bg-mint px-4 py-3" style={{ fontFamily: `'${brand[key]}', sans-serif`, fontSize: key === "headingFont" ? 24 : 16 }}>
              {key === "headingFont" ? "Hook yang bikin berhenti scroll" : "Caption yang mudah dibaca di layar kecil."}
            </p>
          </Field>
        ))}
      </div>
    </Section>
  );
}

function Identity({ edit, set, setBrand }: { edit: ProjectEdit; set: Set; setBrand: SetBrand }) {
  return (
    <Section id="identity-title" title="Identitas">
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nama brand" htmlFor="b-name">
            <input id="b-name" value={edit.name} maxLength={60} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kategori" htmlFor="b-category">
            <select id="b-category" value={edit.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Deskripsi satu kalimat" htmlFor="b-desc">
          <input id="b-desc" value={edit.description} maxLength={140} onChange={(e) => set("description", e.target.value)} className={inputCls} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Zona waktu" htmlFor="b-tz">
            <select id="b-tz" value={edit.timezone} onChange={(e) => set("timezone", e.target.value as ProjectEdit["timezone"])} className={inputCls}>
              <option>WIB</option>
              <option>WITA</option>
              <option>WIT</option>
            </select>
          </Field>
          <Field label="Bahasa konten" htmlFor="b-lang">
            <select id="b-lang" value={edit.language} onChange={(e) => set("language", e.target.value)} className={inputCls}>
              <option>Bahasa Indonesia</option>
              <option>English</option>
              <option>Campuran</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Link polos" htmlFor="b-link" hint="Ditulis di caption sebagai “link in bio”.">
            <input id="b-link" type="url" value={edit.brand.linkPlain} onChange={(e) => setBrand("linkPlain", e.target.value)} placeholder="https://kopipagi.id" className={inputCls} />
          </Field>
          <Field label="Link ber-tracking" htmlFor="b-track" hint="Hanya di tempat yang bisa diklik: bio, stiker Story, iklan.">
            <input id="b-track" type="url" value={edit.brand.linkTracking} onChange={(e) => setBrand("linkTracking", e.target.value)} placeholder="https://kopipagi.id/?utm_source=ig" className={inputCls} />
          </Field>
        </div>
      </div>
    </Section>
  );
}

function VoiceRules({ edit, set, setBrand }: { edit: ProjectEdit; set: Set; setBrand: SetBrand }) {
  const toggle = (v: string) => set("voice", edit.voice.includes(v) ? edit.voice.filter((x) => x !== v) : edit.voice.length < 3 ? [...edit.voice, v] : edit.voice);
  return (
    <Section id="voice-title" title="Suara dan aturan">
      <fieldset>
        <legend className="text-sm font-semibold">Suara brand (sampai 3)</legend>
        <div className="mt-4 flex flex-wrap gap-4">
          {VOICES.map((v) => {
            const on = edit.voice.includes(v);
            return (
              <button key={v} type="button" aria-pressed={on} onClick={() => toggle(v)} className={"px-btn px-4 py-2 text-sm font-semibold " + (on ? "bg-forsythia" : "bg-arctic [--shade:var(--color-mint)]")}>
                {v}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field label="Kata yang dipakai" htmlFor="b-used" hint="Istilah khas brand, pisahkan dengan koma.">
          <input id="b-used" value={edit.brand.wordsUsed} onChange={(e) => setBrand("wordsUsed", e.target.value)} placeholder="Contoh: kopi susu, gula aren" className={inputCls} />
        </Field>
        <Field label="Kata yang dilarang" htmlFor="b-forbidden" hint="Konten yang memakai kata ini tidak bisa dikirim ke G3.">
          <input id="b-forbidden" value={edit.forbidden} onChange={(e) => set("forbidden", e.target.value)} placeholder="Contoh: termurah, dijamin" className={inputCls} />
        </Field>
      </div>
      <div className="mt-6">
        <Field label="Aturan klaim dan sumber kebenaran" htmlFor="b-claims">
          <textarea id="b-claims" rows={3} value={edit.brand.claimRules} maxLength={500} onChange={(e) => setBrand("claimRules", e.target.value)} placeholder="Contoh: harga selalu dari menu resmi; tidak membandingkan dengan merek lain." className={inputCls} />
        </Field>
      </div>
    </Section>
  );
}

function AudienceTargets({ edit, set }: { edit: ProjectEdit; set: Set }) {
  return (
    <Section id="audience-title" title="Audiens dan target">
      <Field label="Audiens utama (satu orang, spesifik)" htmlFor="b-aud">
        <textarea id="b-aud" rows={3} value={edit.audience} maxLength={300} onChange={(e) => set("audience", e.target.value)} className={inputCls} />
      </Field>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <Field label={`Ritme: ${edit.postsPerWeek} post / minggu`} htmlFor="b-ppw">
          <input id="b-ppw" type="range" min={1} max={14} value={edit.postsPerWeek} onChange={(e) => set("postsPerWeek", Number(e.target.value))} className="w-full accent-nocturnal" />
        </Field>
        <Field label="Target rata-rata tonton (%)" htmlFor="b-watch">
          <input id="b-watch" type="number" min={10} max={90} value={edit.watchTarget} onChange={(e) => set("watchTarget", Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Approver" htmlFor="b-appr">
          <input id="b-appr" type="email" value={edit.approver} onChange={(e) => set("approver", e.target.value)} className={inputCls} />
        </Field>
      </div>
    </Section>
  );
}

function Accounts({ project }: { project: Project }) {
  return (
    <Section id="accounts-title" title="Akun terhubung" hint="Data dibaca lewat API resmi. Token tersimpan terenkripsi.">
      <ul className="divide-y-2 divide-mint">
        {project.accounts.map((a) => (
          <li key={a.platform} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
            <span className="flex h-10 w-10 items-center justify-center bg-noir text-forsythia">
              <Sprite grid={ICONS[a.platform]} colors={{ k: C.current }} scale={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                @{a.handle} · {PLATFORMS[a.platform].name}
              </p>
              <p className="text-sm text-nocturnal">
                {fmtNum(a.followers)} follower · {a.posts} post · terhubung {fmtDate(a.connectedAt)}
              </p>
            </div>
            <span className="bg-nocturnal px-2 py-1 text-xs font-bold text-arctic">Aktif</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function DecisionLog({ project, note, setNote }: { project: Project; note: string; setNote: (v: string) => void }) {
  const entries = project.decisions ?? [];
  return (
    <Section id="log-title" title="Log keputusan" hint="Perubahan brand dicatat otomatis saat disimpan. Tambahkan catatan untuk keputusan lain.">
      <Field label="Catatan baru (ikut tersimpan)" htmlFor="b-note">
        <input id="b-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: talent AI tidak dipakai sampai ada label resmi." className={inputCls} />
      </Field>
      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-nocturnal">Belum ada keputusan yang dicatat.</p>
      ) : (
        <ol className="mt-6 space-y-3">
          {entries.slice(0, 12).map((d, i) => (
            <li key={`${d.at}-${i}`} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
              <span className="text-nocturnal">{fmtDate(d.at)}</span>
              <span>{d.text}</span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function Preview({ edit, handle }: { edit: ProjectEdit; handle: string }) {
  const b = edit.brand;
  const valid = { ...b, colors: b.colors.filter((c) => isHex(c.hex)) };
  const primary = colorFor(valid, "Primer", "#172b36");
  const background = colorFor(valid, "Latar", "#f1f6f4");
  const text = colorFor(valid, "Teks", "#172b36");
  const accent = colorFor(valid, "Aksen", "#ffc801");
  const heading = `'${b.headingFont}', sans-serif`;
  const body = `'${b.bodyFont}', sans-serif`;

  return (
    <div className="px-box m-1 bg-arctic p-5">
      <h2 className="text-lg font-bold">Preview konten</h2>
      <p className="mt-1 text-sm text-nocturnal">Berubah langsung saat kamu mengedit.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <figure>
          <div className="relative flex aspect-[4/5] flex-col justify-between p-4" style={{ background: primary, color: background }}>
            <div className="flex items-center gap-2">
              <LogoMark brand={b} name={edit.name} size={28} />
              <span className="truncate text-[10px] font-semibold" style={{ fontFamily: body }}>
                {edit.name}
              </span>
            </div>
            <div>
              <span className="block h-1.5 w-8" style={{ background: accent }} />
              <p className="mt-2 text-[15px] leading-tight font-bold" style={{ fontFamily: heading }}>
                3 hal yang jarang dibahas
              </p>
            </div>
            <p className="text-[9px] opacity-80" style={{ fontFamily: body }}>
              @{handle} · geser →
            </p>
          </div>
          <figcaption className="mt-1.5 text-xs text-nocturnal">Slide 1 (hook)</figcaption>
        </figure>
        <figure>
          <div className="flex aspect-[4/5] flex-col justify-between p-4" style={{ background, color: text }}>
            <p className="text-[11px] leading-snug" style={{ fontFamily: body }}>
              {edit.description || "Deskripsi brand muncul di sini."}
            </p>
            <span className="self-start px-2.5 py-1.5 text-[10px] font-bold" style={{ background: accent, color: primary, fontFamily: body }}>
              Simpan post ini
            </span>
          </div>
          <figcaption className="mt-1.5 text-xs text-nocturnal">Slide terakhir (CTA)</figcaption>
        </figure>
      </div>
      <div className="mt-5 flex gap-1" aria-label="Palet warna">
        {valid.colors.map((c, i) => (
          <span key={i} className="h-6 flex-1" style={{ background: c.hex }} title={`${c.role} ${c.hex}`} />
        ))}
      </div>
    </div>
  );
}
