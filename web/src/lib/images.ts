/** Surah artwork, imported so astro:assets can resize and re-encode it. */
import type { ImageMetadata } from "astro"

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/surahs/*.png", {
  eager: true,
})

export function surahImage(file: string): ImageMetadata {
  const image = files[`../assets/surahs/${file}`]?.default
  if (!image) throw new Error(`Missing surah image ${file}`)
  return image
}
