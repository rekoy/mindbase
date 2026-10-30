// Deterministic demo data standing in for the social APIs. Everything is seeded
// from the handle and anchored to project.syncedAt, so every page agrees.
import { PLATFORMS, VIDEO_FORMATS } from "@/lib/platforms";
import type { Account, PlatformId, Project } from "@/lib/types";

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 seeded from a string */
export function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalizeHandle(text: string) {
  return text
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 30);
}

export function suggestPrefix(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!letters) return "";
  const consonants = letters[0] + letters.slice(1).replace(/[AEIOU]/g, "");
  return (consonants.length >= 3 ? consonants : letters).slice(0, 3);
}

export function accountStats(platform: PlatformId, handle: string) {
  const r = rng(`${platform}:${handle}`);
  return {
    followers: Math.round((1800 + r() * 38000) / 10) * 10,
    posts: Math.round(80 + r() * 420),
  };
}

/* ---------- formatting ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function fmtNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")} rb`;
  return String(Math.round(n));
}

export function fmtRatio(n: number) {
  return `${n.toFixed(1).replace(".", ",")}×`;
}

/** "2026-11-06" → "Kam 6 Nov 2026" (dates are plain calendar days, no time zone) */
export function fmtDate(isoDay: string, withDay = false) {
  const [y, m, d] = isoDay.slice(0, 10).split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${withDay ? DAYS.at(day) + " " : ""}${d} ${MONTHS.at(m - 1)} ${y}`;
}

export function addDays(isoDay: string, days: number) {
  const [y, m, d] = isoDay.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/* ---------- posts ---------- */

const TOPICS: Record<string, string[]> = {
  Kuliner: ["resep sambal matah rumahan", "cara seduh kopi V60", "menu sarapan 10 menit", "jajanan pasar kekinian", "bekal kantor hemat", "street food malam", "takaran gula yang pas", "dapur kecil yang rapi"],
  Fashion: ["padu padan kemeja putih", "outfit kerja 5 hari", "warna untuk kulit sawo matang", "merawat sneakers", "capsule wardrobe pemula", "batik untuk anak muda", "ukuran celana yang pas", "thrifting tanpa zonk"],
  Edukasi: ["teknik belajar pomodoro", "mencatat yang efektif", "persiapan UTBK", "bahasa Inggris 15 menit sehari", "beasiswa luar negeri", "membaca cepat", "matematika dasar tanpa takut", "manajemen waktu mahasiswa"],
  Teknologi: ["shortcut Excel paling berguna", "keamanan akun media sosial", "aplikasi produktivitas gratis", "setup meja kerja", "pakai AI untuk kerja", "baterai HP awet", "Wi-Fi rumah lebih cepat", "backup foto otomatis"],
  Kecantikan: ["skincare pagi kulit berminyak", "urutan pakai serum", "makeup 5 menit", "pakai sunscreen yang benar", "rambut lepek", "parfum tahan lama", "jerawat hormonal", "bibir kering"],
  Lainnya: ["usaha rumahan", "foto produk pakai HP", "keuangan bulanan", "behind the scene tim kami", "pertanyaan yang sering ditanya", "cerita pelanggan", "proses produksi kami", "hemat belanja bulanan"],
};

export const CATEGORIES = Object.keys(TOPICS);

export type Post = {
  id: string;
  platform: PlatformId;
  format: string;
  topic: string;
  date: string;
  hour: number;
  views: number;
  /** Average watch % (videos only). */
  avgWatch: number | null;
  saves: number;
  shares: number;
  comments: number;
  nonFollower: number;
  outlier: boolean;
};

const HOURS = [8, 12, 17, 19, 20, 21];

export function postsFor(account: Account, category: string, syncedAt: string): Post[] {
  const r = rng(`posts:${account.platform}:${account.handle}`);
  const topics = TOPICS[category] ?? TOPICS.Lainnya;
  const formats = PLATFORMS[account.platform].formats;
  const outliers = new Set([2 + Math.floor(r() * 5), 10 + Math.floor(r() * 8), 20 + Math.floor(r() * 8)]);
  const posts: Post[] = [];
  let day = syncedAt.slice(0, 10);

  for (let i = 0; i < 30; i++) {
    day = addDays(day, -(2 + Math.floor(r() * 2)));
    const pick = r();
    const format = formats.length === 1 ? formats[0] : pick < 0.55 ? formats[0] : pick < 0.9 ? formats[1] : formats[2];
    const hour = HOURS[Math.floor(r() * HOURS.length)];
    const outlier = outliers.has(i);
    const evening = hour >= 19 ? 1.35 : 1;
    const views = Math.round(account.followers * (0.08 + r() * 0.14) * evening * (outlier ? 2.6 + r() * 1.4 : 1));
    const video = VIDEO_FORMATS.has(format);
    posts.push({
      id: `${PLATFORMS[account.platform].short}-${day.slice(2).replaceAll("-", "")}`,
      platform: account.platform,
      format,
      topic: topics[Math.floor(r() * topics.length)],
      date: day,
      hour,
      views,
      avgWatch: video ? Math.round(18 + r() * 34 + (outlier ? 10 : 0)) : null,
      saves: Math.round(views * (format === "Carousel" ? 0.03 + r() * 0.03 : 0.004 + r() * 0.008)),
      shares: Math.round(views * (video ? 0.01 + r() * 0.02 : 0.004 + r() * 0.006)),
      comments: Math.round(views * (0.004 + r() * 0.008)),
      nonFollower: Math.round(25 + r() * 35 + (outlier ? 15 : 0)),
      outlier,
    });
  }
  return posts;
}

/* ---------- analysis ---------- */

export type Finding = { text: string; source: string };

export type Recommendation = {
  id: string;
  platform: PlatformId;
  title: string;
  evidence: string;
  metric: string;
  confidence: "Tinggi" | "Sedang" | "Rendah";
  effort: "S" | "M" | "L";
  risk: string;
  format: string | null;
  angle: string | null;
};

export type PlatformAnalysis = {
  account: Account;
  posts: Post[];
  medianViews: number;
  totalViews: number;
  avgWatch: number | null;
  videoCount: number;
  belowThirty: number;
  postsPerWeek: number;
  nonFollower: number;
  avgCarouselSaves: number | null;
  comments: { questions: number; complaints: number; corrections: number; praise: number };
  findings: Finding[];
  unknowns: string[];
  recommendations: Recommendation[];
};

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function analyzeAccount(project: Project, account: Account): PlatformAnalysis {
  const posts = postsFor(account, project.category, project.syncedAt);
  const range = `${posts.length} post ${PLATFORMS[account.platform].short}, ${fmtDate(posts.at(-1)!.date)}–${fmtDate(posts[0].date)}`;
  const medianViews = median(posts.map((p) => p.views));
  const videos = posts.filter((p) => p.avgWatch !== null);
  const avgWatch = videos.length ? Math.round(avg(videos.map((p) => p.avgWatch!))) : null;
  const belowThirty = videos.filter((p) => p.avgWatch! < 30).length;
  const spanDays = (Date.parse(posts[0].date) - Date.parse(posts.at(-1)!.date)) / 864e5 || 1;
  const postsPerWeek = Math.round((posts.length / spanDays) * 7 * 10) / 10;
  const nonFollower = Math.round(avg(posts.map((p) => p.nonFollower)));
  const outliers = posts.filter((p) => p.views >= medianViews * 2).sort((a, b) => b.views - a.views);
  const carousels = posts.filter((p) => p.format === "Carousel");
  const reels = posts.filter((p) => p.format === "Reel");
  const avgCarouselSaves = carousels.length ? Math.round(avg(carousels.map((p) => p.saves))) : null;
  const evening = posts.filter((p) => p.hour >= 19);
  const daytime = posts.filter((p) => p.hour < 19);
  const eveningLift = avg(evening.map((p) => p.views)) / (avg(daytime.map((p) => p.views)) || 1);
  const totalComments = posts.reduce((a, p) => a + p.comments, 0);
  const comments = {
    questions: Math.round(totalComments * 0.31),
    complaints: Math.round(totalComments * 0.06),
    corrections: Math.round(totalComments * 0.03),
    praise: Math.round(totalComments * 0.42),
  };

  const findings: Finding[] = [];
  if (avgWatch !== null) {
    findings.push({
      text: `Rata-rata tonton video ${avgWatch}% (target ≥ ${project.watchTarget}%); ${belowThirty} dari ${videos.length} video di bawah 30%.`,
      source: range,
    });
  }
  if (outliers.length) {
    findings.push({
      text: `${outliers.length} post melewati 2× median views (${fmtNum(medianViews)}). Tertinggi: "${cap(outliers[0].topic)}" ${fmtNum(outliers[0].views)} views (${fmtRatio(outliers[0].views / medianViews)}).`,
      source: outliers.map((p) => p.id).join(", "),
    });
  }
  if (avgCarouselSaves !== null && reels.length) {
    const ratio = avgCarouselSaves / (avg(reels.map((p) => p.saves)) || 1);
    findings.push({
      text: `Carousel rata-rata ${avgCarouselSaves} saves, ${fmtRatio(ratio)} dibanding Reel.`,
      source: `${carousels.length} carousel dan ${reels.length} Reel`,
    });
  }
  findings.push({
    text: `Ritme ${String(postsPerWeek).replace(".", ",")} post per minggu, target ${project.postsPerWeek}.`,
    source: range,
  });
  findings.push({
    text: `Post jam 19.00–21.00 rata-rata ${fmtRatio(eveningLift)} views post di jam lain.`,
    source: `${evening.length} post malam vs ${daytime.length} post siang`,
  });
  findings.push({
    text: `${comments.questions} komentar berupa pertanyaan, ${comments.complaints} keluhan, ${comments.corrections} koreksi.`,
    source: `${totalComments} komentar dari ${posts.length} post`,
  });

  const unknowns = [
    "Retensi per detik belum tersedia dari API; dicek manual di aplikasi.",
    "Data demografi audiens butuh minimal 100 follower aktif per segmen.",
  ];

  const recommendations: Recommendation[] = [];
  const key = account.platform;
  if (outliers.length) {
    const top = outliers[0];
    const sameFormat = outliers.filter((p) => p.format === top.format).length;
    recommendations.push({
      id: `${key}-series`,
      platform: key,
      title: `Buat seri lanjutan "${cap(top.topic)}"`,
      evidence: `${top.id} dapat ${fmtNum(top.views)} views (${fmtRatio(top.views / medianViews)} median)`,
      metric: "Views dan reach non-follower",
      confidence: sameFormat >= 2 ? "Tinggi" : "Sedang",
      effort: "M",
      risk: "Topik bisa jenuh setelah 3 episode",
      format: top.format,
      angle: `${cap(top.topic)}, bagian 2`,
    });
  }
  if (avgWatch !== null && avgWatch < project.watchTarget) {
    const topic = (outliers[1] ?? posts[0]).topic;
    recommendations.push({
      id: `${key}-hook`,
      platform: key,
      title: "Perkuat 3 detik pertama di setiap video",
      evidence: `Rata-rata tonton ${avgWatch}% vs target ${project.watchTarget}%; ${belowThirty} video di bawah 30%`,
      metric: "Rata-rata tonton",
      confidence: "Tinggi",
      effort: "S",
      risk: "Hook yang terlalu clickbait menurunkan kepercayaan",
      format: PLATFORMS[key].formats[0],
      angle: cap(topic),
    });
  }
  if (avgCarouselSaves !== null) {
    recommendations.push({
      id: `${key}-carousel`,
      platform: key,
      title: "Ubah tips jadi carousel yang layak disimpan",
      evidence: `Carousel rata-rata ${avgCarouselSaves} saves per post`,
      metric: "Saves",
      confidence: carousels.length >= 5 ? "Tinggi" : "Sedang",
      effort: "S",
      risk: "Butuh desain yang konsisten dengan brand kit",
      format: "Carousel",
      angle: `${cap((carousels[0] ?? posts[0]).topic)}: panduan singkat`,
    });
  }
  if (comments.questions > 20) {
    recommendations.push({
      id: `${key}-faq`,
      platform: key,
      title: "Jawab pertanyaan terbanyak dalam satu konten FAQ",
      evidence: `${comments.questions} komentar berupa pertanyaan dari ${posts.length} post`,
      metric: "Shares dan komentar",
      confidence: "Sedang",
      effort: "M",
      risk: "Jawaban harus dicek ke sumber resmi brand",
      format: PLATFORMS[key].formats[0],
      angle: "Pertanyaan yang paling sering kalian tanyakan",
    });
  }
  if (eveningLift > 1.15) {
    recommendations.push({
      id: `${key}-slot`,
      platform: key,
      title: "Pindahkan jam posting ke 19.00–21.00",
      evidence: `Post malam rata-rata ${fmtRatio(eveningLift)} views post siang (n = ${evening.length})`,
      metric: "Views",
      confidence: "Sedang",
      effort: "S",
      risk: "Jam terbaik bisa bergeser; jalankan sebagai eksperimen 2 minggu",
      format: null,
      angle: null,
    });
  }

  return {
    account,
    posts,
    medianViews,
    totalViews: posts.reduce((a, p) => a + p.views, 0),
    avgWatch,
    videoCount: videos.length,
    belowThirty,
    postsPerWeek,
    nonFollower,
    avgCarouselSaves,
    comments,
    findings,
    unknowns,
    recommendations,
  };
}

export function analyzeProject(project: Project) {
  return project.accounts.map((account) => analyzeAccount(project, account));
}

/* ---------- content helpers ---------- */

export function hooksFor(angle: string, recommendedFirst: boolean) {
  const t = angle.trim().replace(/[.!?]+$/, "");
  const topic = t.charAt(0).toLowerCase() + t.slice(1);
  const hooks = [
    { text: `Kesalahan paling umum soal ${topic}, dan cara benerinnya.`, pattern: "Koreksi kesalahan" },
    { text: `3 hal soal ${topic} yang jarang dibahas.`, pattern: "Daftar angka" },
    { text: `Berhenti scroll kalau kamu masih bingung soal ${topic}.`, pattern: "Panggilan langsung" },
  ];
  const recommended = recommendedFirst ? 0 : 1;
  return hooks.map((h, i) => ({ ...h, recommended: i === recommended }));
}

/** Best posting slot suggestion: two days after the sync, at 19.00. */
export function suggestedSlot(project: Project) {
  return { day: addDays(project.syncedAt, 2), time: "19:00" };
}
