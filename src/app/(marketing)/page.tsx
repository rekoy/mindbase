import Link from "next/link";
import { Logo } from "@/components/logo";
import { Sprite } from "@/components/sprite";
import { C, CLOUD, COIN, HEART, ICONS, MASCOT, MASCOT_COLORS, STAR } from "@/components/sprites";

const STAGES = [
  {
    level: "LV.1",
    name: "Analisis",
    body: "Baca insight akun, audit profil, dan bedah konten kompetitor. Keluar 5–10 temuan, masing-masing dengan angka dan sumbernya.",
  },
  {
    level: "LV.2",
    name: "Rekomendasi",
    body: "4–7 peluang berperingkat lengkap dengan bukti, tingkat keyakinan, effort, dan risiko. Kamu yang memilih.",
  },
  {
    level: "LV.3",
    name: "Konsep",
    body: "Satu brief per konten: platform, slot, tiga pilihan hook, urutan beat, dan angka sukses yang akan dicek.",
  },
  {
    level: "LV.4",
    name: "Produksi",
    body: "Naskah, carousel, dan edit video dari brand kit kamu, lalu preflight otomatis: rasio, codec, zona aman, caption.",
  },
  {
    level: "LV.5",
    name: "Jadwal",
    body: "Slot dari jam terbaik akunmu, aturan ritme posting, dan publish lewat API resmi atau paket manual + kalender.",
  },
  {
    level: "LV.6",
    name: "Ukur",
    body: "Setiap post dibandingkan dengan target di brief-nya. Hasilnya jadi bahan siklus berikutnya.",
  },
];

const GATES = [
  { id: "G1", label: "Temuan benar?" },
  { id: "G2", label: "Pilih peluang" },
  { id: "G3", label: "Setujui konsep" },
  { id: "G4", label: "Ship it?" },
  { id: "G5", label: "Setujui jadwal" },
];

const PLANS = [
  {
    name: "Free",
    price: "Rp0",
    note: "selamanya",
    perks: ["1 brand · 1 seat", "50 kredit AI / bulan", "Strategi + naskah", "Jadwal manual (.ics)"],
  },
  {
    name: "Starter",
    price: "Rp199rb",
    note: "/ bulan",
    perks: ["1 brand · 2 seat", "500 kredit AI / bulan", "Insight IG & TikTok", "Desain + preflight", "Publish via API"],
  },
  {
    name: "Pro",
    price: "Rp599rb",
    note: "/ bulan",
    featured: true,
    perks: ["3 brand · 5 seat", "2.000 kredit AI / bulan", "Riset kompetitor", "Video studio", "Link approval klien"],
  },
  {
    name: "Agency",
    price: "Rp1,99jt",
    note: "/ bulan",
    perks: ["15 brand · 15 seat", "8.000 kredit AI / bulan", "Client portal", "Laporan white-label"],
  },
];

const STARS = [
  { top: "12%", left: "6%", delay: "0s" },
  { top: "5%", left: "38%", delay: "0.6s" },
  { top: "8%", left: "70%", delay: "1.2s" },
  { top: "34%", left: "92%", delay: "0.3s" },
  { top: "58%", left: "3%", delay: "1.8s" },
  { top: "4%", left: "58%", delay: "0.9s" },
  { top: "16%", left: "84%", delay: "1.5s" },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Levels />
        <Checkpoints />
        <Pricing />
        <PressStart />
      </main>
      <SiteFooter />
    </>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-noir bg-noir">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" aria-label="mindbase, beranda">
          <Logo pixel light />
        </Link>
        <ul className="hidden items-center gap-8 text-sm font-medium text-mint md:flex">
          <li>
            <a href="#level" className="hover:text-forsythia">Fitur</a>
          </li>
          <li>
            <a href="#checkpoint" className="hover:text-forsythia">Cara kerja</a>
          </li>
          <li>
            <a href="#harga" className="hover:text-forsythia">Harga</a>
          </li>
        </ul>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm font-semibold text-arctic hover:text-forsythia">
            Masuk
          </Link>
          <Link
            href="/login"
            className="px-btn bg-forsythia px-4 py-2 font-pixel text-[10px] text-noir [--line:var(--color-noir)] [--shade:var(--color-saffron)]"
          >
            Mulai
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-noir text-arctic">
      {STARS.map((s) => (
        <span key={s.left} className="anim-twinkle absolute" style={{ top: s.top, left: s.left, animationDelay: s.delay }}>
          <Sprite grid={STAR} colors={{ y: C.forsythia }} scale={3} />
        </span>
      ))}
      <span className="anim-drift absolute top-[18%] left-0 opacity-90">
        <Sprite grid={CLOUD} colors={{ w: C.arctic, m: C.mint }} scale={5} />
      </span>
      <span className="anim-drift absolute top-[46%] left-0 opacity-60" style={{ animationDelay: "-30s" }}>
        <Sprite grid={CLOUD} colors={{ w: C.mint, m: C.nocturnal }} scale={3} />
      </span>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-32 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div>
          <p className="font-pixel text-[10px] leading-relaxed text-forsythia">▶ AI SOCIAL MEDIA STUDIO</p>
          <h1 className="mt-6 font-pixel text-[22px] leading-[1.6] sm:text-[30px] lg:text-[34px]">
            Level up konten sosial mediamu.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mint">
            mindbase menjalankan satu siklus konten penuh, dari data akun, ide, naskah, desain, sampai jadwal posting.
            AI yang bekerja, kamu yang memutuskan di setiap checkpoint.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/login"
              className="px-btn bg-forsythia px-6 py-4 font-pixel text-xs text-noir [--line:var(--color-arctic)] [--shade:var(--color-saffron)]"
            >
              <Sprite grid={ICONS.play} colors={{ k: C.current }} scale={1.5} />
              Mulai gratis
            </Link>
            <a href="#checkpoint" className="font-semibold text-arctic underline decoration-forsythia decoration-4 underline-offset-8 hover:text-forsythia">
              Lihat cara kerjanya
            </a>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-mint">
            <li>Instagram</li>
            <li aria-hidden>·</li>
            <li>TikTok</li>
            <li aria-hidden>·</li>
            <li>YouTube Shorts</li>
            <li aria-hidden>·</li>
            <li>Facebook</li>
          </ul>
        </div>
        <QuestWindow />
      </div>
      <Ground />
    </section>
  );
}

function QuestWindow() {
  return (
    <div className="px-box mx-1 bg-nocturnal [--line:var(--color-arctic)] [--shade:var(--color-forsythia)]">
      <div className="flex items-center justify-between border-b-4 border-arctic bg-arctic px-4 py-3 text-noir">
        <span className="font-pixel text-[10px]">QUEST LOG</span>
        <span className="flex gap-1" aria-label="3 nyawa">
          <Sprite grid={HEART} colors={{ k: C.noir, s: C.saffron }} scale={2} />
          <Sprite grid={HEART} colors={{ k: C.noir, s: C.saffron }} scale={2} />
          <Sprite grid={HEART} colors={{ k: C.noir, s: C.saffron }} scale={2} />
        </span>
      </div>
      <div className="space-y-6 p-6">
        <div className="flex items-start gap-5">
          <span className="anim-bob shrink-0">
            <Sprite grid={MASCOT} colors={MASCOT_COLORS} scale={5} title="Mindy, maskot mindbase" />
          </span>
          <p className="px-flat relative bg-arctic p-4 text-[15px] leading-relaxed text-noir">
            Halo! Aku menemukan <strong>3 peluang konten</strong> dari 30 post terakhirmu. Siap dipilih?
            <span className="anim-blink absolute right-3 bottom-1 text-xs" aria-hidden>
              ▼
            </span>
          </p>
        </div>
        <ul className="space-y-3 text-[15px]">
          <QuestItem done>Analisis 30 post terakhir</QuestItem>
          <QuestItem done>4 rekomendasi berbukti</QuestItem>
          <QuestItem>Setujui 3 naskah (G3)</QuestItem>
          <QuestItem>Jadwalkan 4 konten minggu ini</QuestItem>
        </ul>
        <div>
          <div className="mb-2 flex justify-between font-pixel text-[9px] text-forsythia">
            <span>XP SIKLUS</span>
            <span>680 / 1000</span>
          </div>
          <div className="px-flat flex gap-1 bg-noir p-1 [--line:var(--color-arctic)]" role="img" aria-label="Progres siklus 68 persen">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={"h-4 flex-1 " + (i < 7 ? "bg-forsythia" : "bg-nocturnal")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestItem({ done = false, children }: { done?: boolean; children: React.ReactNode }) {
  return (
    <li className={"flex items-center gap-3 " + (done ? "text-mint" : "text-arctic")}>
      <span className={"flex h-5 w-5 items-center justify-center border-2 " + (done ? "border-forsythia bg-forsythia text-noir" : "border-mint")}>
        {done && <Sprite grid={ICONS.check} colors={{ k: C.current }} scale={1.5} />}
      </span>
      <span className={done ? "line-through decoration-2" : ""}>{children}</span>
    </li>
  );
}

function Ground() {
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0">
      <div className="h-2 bg-[repeating-linear-gradient(90deg,var(--color-forsythia)_0_16px,var(--color-saffron)_16px_32px)]" />
      <div className="h-14 bg-[repeating-linear-gradient(90deg,var(--color-nocturnal)_0_32px,var(--color-noir)_32px_64px)]" />
    </div>
  );
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={"font-pixel text-[10px] " + (light ? "text-forsythia" : "text-nocturnal")}>{eyebrow}</p>
      <h2 className={"mt-5 font-pixel text-lg leading-[1.7] sm:text-2xl " + (light ? "text-arctic" : "text-noir")}>{title}</h2>
    </div>
  );
}

function Levels() {
  return (
    <section id="level" className="scroll-mt-20 bg-mint py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="▶ FITUR" title="Enam level, satu siklus konten." />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nocturnal">
          Setiap level punya input, output, dan bukti yang jelas. Tidak ada lagi ide yang muncul dari tebakan.
        </p>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => (
            <li key={stage.name} className="px-box m-1 bg-arctic p-6">
              <span className="inline-block bg-saffron px-2 py-1 font-pixel text-[9px] text-noir">{stage.level}</span>
              <h3 className="mt-5 text-xl font-bold">{stage.name}</h3>
              <p className="mt-3 leading-relaxed text-nocturnal">{stage.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Checkpoints() {
  return (
    <section id="checkpoint" className="scroll-mt-20 bg-nocturnal py-24 text-arctic">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle light eyebrow="▶ CARA KERJA" title="Checkpoint, bukan autopilot." />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mint">
          Ada lima checkpoint di setiap siklus. AI berhenti dan menunggu jawabanmu di tiap checkpoint, dan tidak ada
          satu pun konten yang terbit tanpa persetujuan pemilik brand.
        </p>

        <ol className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-5 sm:gap-4">
          <span
            aria-hidden
            className="absolute top-8 right-[10%] left-[10%] hidden border-t-4 border-dashed border-forsythia sm:block"
          />
          {GATES.map((gate) => (
            <li key={gate.id} className="relative flex items-center gap-5 sm:flex-col sm:text-center">
              <span className="px-box flex h-16 w-16 shrink-0 items-center justify-center bg-forsythia font-pixel text-sm text-noir [--shade:var(--color-noir)]">
                {gate.id}
              </span>
              <span className="font-semibold">{gate.label}</span>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid gap-10 md:grid-cols-3">
          <Rule title="Setiap klaim ada sumbernya">
            Temuan dan rekomendasi selalu menyebut angka, ID post, atau tanggal. Angka perkiraan diberi tanda ±.
          </Rule>
          <Rule title="Persetujuan tercatat">
            Siapa yang menyetujui, kapan, versi file, dan caption mana. Ubah jam atau caption berarti persetujuan baru.
          </Rule>
          <Rule title="Hasil kembali ke awal">
            Setiap post diukur terhadap target di brief-nya, jadi siklus berikutnya belajar dari data yang nyata.
          </Rule>
        </div>
      </div>
    </section>
  );
}

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-3 text-lg font-bold">
        <span aria-hidden className="h-3 w-3 shrink-0 bg-forsythia" />
        {title}
      </h3>
      <p className="mt-2 leading-relaxed text-mint">{children}</p>
    </div>
  );
}

function Pricing() {
  return (
    <section id="harga" className="scroll-mt-20 bg-arctic py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="▶ HARGA" title="Pilih paket, mulai main." />
          <p className="flex items-center gap-3 text-nocturnal">
            <Sprite grid={COIN} colors={{ k: C.noir, y: C.forsythia, s: C.saffron, w: C.arctic }} scale={3} />
            Bayar pakai QRIS, VA, atau e-wallet.
          </p>
        </div>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={"px-box m-1 flex flex-col p-6 " + (plan.featured ? "bg-forsythia" : "bg-mint")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-xs">{plan.name}</h3>
                {plan.featured && <span className="bg-noir px-2 py-1 font-pixel text-[8px] text-forsythia">TOP</span>}
              </div>
              <p className="mt-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-nocturnal">{plan.note}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-[15px]">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span aria-hidden className="text-saffron">■</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={
                  "px-btn mt-8 px-4 py-3 font-pixel text-[10px] " +
                  (plan.featured
                    ? "bg-noir text-forsythia [--shade:var(--color-saffron)]"
                    : "bg-arctic text-noir [--shade:var(--color-nocturnal)]")
                }
              >
                Pilih {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PressStart() {
  return (
    <section className="bg-saffron py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center">
        <Sprite grid={MASCOT} colors={MASCOT_COLORS} scale={6} className="anim-bob" />
        <h2 className="font-pixel text-lg leading-[1.7] sm:text-2xl">Siklus pertamamu menunggu.</h2>
        <p className="max-w-xl text-lg text-noir">
          Hubungkan satu akun, isi profil brand, dan dapatkan rekomendasi pertama dalam hitungan menit.
        </p>
        <Link
          href="/login"
          className="px-btn bg-noir px-8 py-5 font-pixel text-xs text-forsythia [--shade:var(--color-nocturnal)]"
        >
          PRESS START<span className="anim-blink" aria-hidden>_</span>
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-noir py-10 text-mint">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 text-sm">
        <Logo pixel light />
        <p>© 2026 mindbase. Dibuat untuk social media manager Indonesia.</p>
      </div>
    </footer>
  );
}
