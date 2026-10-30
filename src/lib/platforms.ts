import type { PlatformId } from "@/lib/types";

export type PlatformMeta = {
  name: string;
  short: string;
  api: string;
  login: string;
  requirement: string;
  scopes: { id: string; label: string }[];
  formats: string[];
  available: boolean;
  release?: string;
  note?: string;
};

// Connectors follow the PRD: official APIs only; IG + TikTok in MVP, the rest in V1.
export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  instagram: {
    name: "Instagram",
    short: "IG",
    api: "Instagram Graph API",
    login: "Facebook Login for Business",
    requirement: "Akun Instagram Business atau Creator yang terhubung ke Facebook Page.",
    scopes: [
      { id: "instagram_basic", label: "Membaca profil dan daftar post" },
      { id: "instagram_manage_insights", label: "Membaca insight: reach, views, saves, shares" },
      { id: "instagram_manage_comments", label: "Membaca komentar untuk disortir" },
      { id: "instagram_content_publish", label: "Memposting konten yang sudah kamu setujui" },
    ],
    formats: ["Reel", "Carousel", "Gambar tunggal"],
    available: true,
    note: "API Instagram tidak bisa menjadwalkan, jadi mindbase menjalankan publish tepat di jam slot.",
  },
  tiktok: {
    name: "TikTok",
    short: "TT",
    api: "TikTok Login Kit + Content Posting API",
    login: "Login with TikTok",
    requirement: "Akun TikTok; akun Business disarankan agar insight lengkap.",
    scopes: [
      { id: "user.info.basic", label: "Membaca profil" },
      { id: "user.info.stats", label: "Membaca jumlah follower dan likes" },
      { id: "video.list", label: "Membaca daftar video dan performanya" },
      { id: "video.publish", label: "Memposting video yang sudah kamu setujui" },
    ],
    formats: ["Video"],
    available: true,
    note: "Publish langsung ke TikTok aktif setelah review aplikasi; sebelum itu tersedia paket posting manual.",
  },
  youtube: {
    name: "YouTube Shorts",
    short: "YT",
    api: "YouTube Data API v3",
    login: "Google",
    requirement: "Channel YouTube.",
    scopes: [],
    formats: ["Shorts"],
    available: false,
    release: "V1",
  },
  facebook: {
    name: "Facebook",
    short: "FB",
    api: "Facebook Pages API",
    login: "Facebook Login for Business",
    requirement: "Facebook Page yang kamu kelola.",
    scopes: [],
    formats: ["Video", "Gambar"],
    available: false,
    release: "V1",
  },
};

export const PLATFORM_ORDER: PlatformId[] = ["instagram", "tiktok", "youtube", "facebook"];

export const VIDEO_FORMATS = new Set(["Reel", "Video", "Shorts"]);
