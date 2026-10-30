export const C = {
  noir: "var(--color-noir)",
  nocturnal: "var(--color-nocturnal)",
  forsythia: "var(--color-forsythia)",
  saffron: "var(--color-saffron)",
  mint: "var(--color-mint)",
  arctic: "var(--color-arctic)",
  current: "currentColor",
} as const;

/** Mindy, the mindbase mascot: a happy pixel brain. */
export const MASCOT = [
  "...kkkk..kkkk...",
  "..kyyyykkyyyyk..",
  ".kyysyyyyyysyyk.",
  "kyyyyysyyysyyyyk",
  "kysyyyyyyyyyysyk",
  "kyykkyyyyyykkyyk",
  "kyykwyyyyyykwyyk",
  "kyyyyyyyyyyyyyyk",
  "kysyyksyyskyysyk",
  "kyyyyykkkkyyyyyk",
  ".kyysyyyyyysyyk.",
  "..kkyyyyyyyykk..",
  "....kkkkkkkk....",
] as const;

export const MASCOT_COLORS = {
  k: C.noir,
  y: C.forsythia,
  s: C.saffron,
  w: C.arctic,
};

export const STAR = ["..y..", "..y..", "yyyyy", "..y..", "..y.."] as const;

export const CLOUD = [
  "......wwww......",
  "..www.wwwwww....",
  ".wwwwwwwwwwwww..",
  "wwwwwwwwwwwwwwww",
  "mmmmmmmmmmmmmmmm",
  ".mmmmmmmmmmmmmm.",
] as const;

export const COIN = [
  "..kkkk..",
  ".kyyyyk.",
  "kyywyyyk",
  "kyywsyyk",
  "kyyysyyk",
  "kyyysyyk",
  ".kyyyyk.",
  "..kkkk..",
] as const;

export const HEART = [".kk.kk.", "ksskssk", "ksssssk", ".ksssk.", "..ksk..", "...k..."] as const;

/* 8x8 single-color icons, drawn with "k" and rendered in currentColor. */
export const ICONS = {
  home: ["...kk...", "..kkkk..", ".kkkkkk.", "kkkkkkkk", ".k....k.", ".k.kk.k.", ".k.kk.k.", ".kkkkkk."],
  board: ["kk.kk.kk", "kk.kk.kk", "kk.kk.kk", "kk.kk...", "kk.kk...", "kk......", "kk......", "........"],
  calendar: ["..k..k..", "kkkkkkkk", "kkkkkkkk", "k......k", "k.k.k..k", "k......k", "k.k.k..k", "kkkkkkkk"],
  chart: ["......kk", "......kk", "...kk.kk", "...kk.kk", "kk.kk.kk", "kk.kk.kk", "kk.kk.kk", "kkkkkkkk"],
  star: ["...kk...", "...kk...", "kkkkkkkk", ".kkkkkk.", "..kkkk..", ".kkkkkk.", ".kk..kk.", "kk....kk"],
  door: ["kkkkk...", "k...k...", "k...k.k.", "k.k.kkkk", "k...k.k.", "k...k...", "k...k...", "kkkkk..."],
  check: [".......k", "......kk", ".....kk.", "k...kk..", "kk.kk...", ".kkk....", "..k.....", "........"],
  play: ["kk......", "kkkk....", "kkkkkk..", "kkkkkkkk", "kkkkkkkk", "kkkkkk..", "kkkk....", "kk......"],
  plus: ["...kk...", "...kk...", "...kk...", "kkkkkkkk", "kkkkkkkk", "...kk...", "...kk...", "...kk..."],
  search: [".kkkk...", "k....k..", "k....k..", "k....k..", ".kkkk...", ".....k..", "......k.", ".......k"],
  lock: ["..kkkk..", ".k....k.", ".k....k.", "kkkkkkkk", "kkk..kkk", "kkk..kkk", "kkkkkkkk", "kkkkkkkk"],
  instagram: ["..kkkk..", "kkkkkkkk", "kk....kk", "k..kk..k", "k.k..k.k", "k..kk..k", "kk....kk", "kkkkkkkk"],
  tiktok: ["....kkk.", "....kkkk", "....k..k", "....k...", "....k...", ".kkkk...", "kkkkk...", ".kkk...."],
  youtube: ["........", "kkkkkkkk", "kk.kkkkk", "kk..kkkk", "kk...kkk", "kk..kkkk", "kk.kkkkk", "kkkkkkkk"],
  facebook: ["kkkkkkkk", "kkkk..kk", "kkk.kkkk", "kk....kk", "kkk.kkkk", "kkk.kkkk", "kkk.kkkk", "kkk.kkkk"],
} as const;
