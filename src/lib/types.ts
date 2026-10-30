export type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook";

export type Account = {
  platform: PlatformId;
  handle: string;
  followers: number;
  posts: number;
  connectedAt: string;
};

export type Project = {
  name: string;
  description: string;
  /** Content ID prefix, e.g. "KPG" → KPG-261102-01 */
  prefix: string;
  category: string;
  timezone: "WIB" | "WITA" | "WIT";
  language: string;
  audience: string;
  voice: string[];
  /** Comma-separated words the brand never uses. */
  forbidden: string;
  postsPerWeek: number;
  /** Target average watch percentage for videos. */
  watchTarget: number;
  approver: string;
  accounts: Account[];
  createdAt: string;
  /** When the first insight import ran; all mock analysis is anchored to it. */
  syncedAt: string;
  /** Visual brand kit; older projects have none, see brandOf(). */
  brand?: Brand;
  /** Decision log, newest first. */
  decisions?: Decision[];
};

export type BrandColor = { role: string; hex: string };
export type BrandAsset = { id: string; label: string };

export type Brand = {
  colors: BrandColor[];
  headingFont: string;
  bodyFont: string;
  /** Asset id of the logo, served from /api/assets/[id]. */
  logo: string | null;
  assets: BrandAsset[];
  wordsUsed: string;
  claimRules: string;
  linkPlain: string;
  linkTracking: string;
};

export type Decision = { at: string; text: string };

export type ProjectInput = Omit<Project, "createdAt" | "syncedAt" | "accounts" | "brand" | "decisions"> & {
  accounts: { platform: PlatformId; handle: string }[];
};

export type DraftStatus = "concept" | "approved" | "revise";

export type Draft = {
  id: string;
  angle: string;
  platform: PlatformId;
  format: string;
  hook: string;
  hooks: string[];
  /** Recommendation evidence, or null when it is the owner's own idea. */
  evidence: string | null;
  metric: string;
  successTarget: string;
  slot: string;
  checkDate: string;
  claims: string;
  status: DraftStatus;
  createdAt: string;
};

export type DraftInput = Omit<Draft, "id" | "status" | "createdAt">;
