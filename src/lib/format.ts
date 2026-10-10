/** URLs, labels and number formats shared by every page. */
import type { Ayah, Path, Surah } from "./site"

export const href = {
  home: "/",
  surahs: "/surahs/",
  surah: (surah: Pick<Surah, "number"> | string | number) =>
    `/${typeof surah === "object" ? surah.number : surah}/`,
  ayah: (ayah: Pick<Ayah, "id">) => `/${ayah.id.replace(":", "/")}/`,
  /** For an id like "2:255". */
  ayahId: (id: string) => `/${id.replace(":", "/")}/`,
  themes: "/themes/",
  theme: (id: string) => `/themes/${id}/`,
  names: "/names/",
  name: (id: string) => `/names/${id}/`,
  people: "/people/",
  person: (id: string) => `/people/${id}/`,
  path: (path: Path) => `/people/path/${path}/`,
  canvas: (id: string) => `/canvas/${id}/`,
  search: "/search/",
}

/** Recitation by Mishary Alafasy, numbered 1 to 6236 across the Quran. */
export const audioUrl = (ayah: Pick<Ayah, "globalNumber">) =>
  `https://cdn.islamic.app/quran/audio/ar.alafasy/${ayah.globalNumber}.mp3`

const arabicDigits = new Intl.NumberFormat("ar-EG", { useGrouping: false })
/** 255 as ٢٥٥. */
export const toArabicDigits = (n: number) => arabicDigits.format(n)

/** "2:255" style reference, in Latin digits. */
export const ayahRef = (ayah: Pick<Ayah, "id">) => ayah.id

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n.toLocaleString("en")} ${n === 1 ? one : many}`

export const revelationLabel = (revelation: Surah["revelation"]) =>
  revelation === "meccan" ? "Meccan" : "Medinan"

export const pathLabel: Record<Path, string> = {
  straight: "Straight path",
  deviated: "Deviated path",
  mixed: "Mixed path",
}

/**
 * Strips Arabic harakat, Quranic annotation marks and tatweel, and folds alef forms, so
 * a search typed without diacritics finds fully vowelled text.
 */
export function normalizeArabic(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
}
