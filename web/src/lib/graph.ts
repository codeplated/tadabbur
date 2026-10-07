/**
 * The local graph of one page: the page itself, what it links to directly, and the
 * links among those. Laid out here, at build time, so the browser gets a finished SVG
 * and no simulation runs on a phone.
 */
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force"
import { href } from "./format"
import type { Ayah, Name, Personality, Site, Theme } from "./site"

export type NodeKind = "ayah" | "theme" | "name" | "person"

export interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  href: string
  center: boolean
  x: number
  y: number
}

export interface Graph {
  nodes: GraphNode[]
  edges: { from: GraphNode; to: GraphNode }[]
  width: number
  height: number
}

/** Enough to show the shape of a page's links without becoming a hairball. */
const MAX_NODES = 40
const WIDTH = 640
const HEIGHT = 420
const PAD = 40

type Entity =
  | { kind: "ayah"; item: Ayah }
  | { kind: "theme"; item: Theme }
  | { kind: "name"; item: Name }
  | { kind: "person"; item: Personality }

const key = (e: Entity) => `${e.kind}:${e.item.id}`

function describe(e: Entity): Omit<GraphNode, "center" | "x" | "y"> {
  switch (e.kind) {
    case "ayah":
      return { id: key(e), kind: e.kind, label: e.item.id, href: href.ayah(e.item) }
    case "theme":
      return { id: key(e), kind: e.kind, label: e.item.label.en, href: href.theme(e.item.id) }
    case "name":
      return {
        id: key(e),
        kind: e.kind,
        label: e.item.transliteration,
        href: href.name(e.item.id),
      }
    case "person":
      return { id: key(e), kind: e.kind, label: e.item.name.en, href: href.person(e.item.id) }
  }
}

/** Everything an entity links to directly, most specific first. */
function neighbours(site: Site, e: Entity): Entity[] {
  const themes = (ids: { id: string }[]) =>
    ids.map((t) => ({ kind: "theme", item: site.theme(t.id) }) as const)
  switch (e.kind) {
    case "ayah": {
      const { names, personalities } = site.mentions(e.item.id)
      return [
        ...personalities.map((p) => ({ kind: "person", item: p }) as const),
        ...names.map((n) => ({ kind: "name", item: n }) as const),
        ...e.item.related.map((a) => ({ kind: "ayah", item: site.ayah(a.id) }) as const),
        ...themes(e.item.themes),
      ]
    }
    case "name":
      return [
        ...e.item.related.map((n) => ({ kind: "name", item: site.name(n.id) }) as const),
        ...e.item.keyAyaat.map((a) => ({ kind: "ayah", item: site.ayah(a.id) }) as const),
        ...themes(e.item.themes),
      ]
    case "person":
      return [
        ...e.item.connected.map((p) => ({ kind: "person", item: site.person(p.id) }) as const),
        ...e.item.ayaat.map((a) => ({ kind: "ayah", item: site.ayah(a.id) }) as const),
        ...themes(e.item.themes),
      ]
    case "theme":
      return []
  }
}

/** Whether two neighbours are linked to each other as well. */
function linked(a: Entity, b: Entity): boolean {
  const has = (list: { id: string }[], id: string) => list.some((x) => x.id === id)
  if (a.kind === "ayah" && b.kind === "theme") return has(a.item.themes, b.item.id)
  if (a.kind === "name" && b.kind === "theme") return has(a.item.themes, b.item.id)
  if (a.kind === "person" && b.kind === "theme") return has(a.item.themes, b.item.id)
  if (a.kind === "name" && b.kind === "ayah") return has(a.item.keyAyaat, b.item.id)
  if (a.kind === "person" && b.kind === "ayah") return has(a.item.ayaat, b.item.id)
  if (a.kind === "name" && b.kind === "name") return has(a.item.related, b.item.id)
  if (a.kind === "person" && b.kind === "person") return has(a.item.connected, b.item.id)
  return false
}

export function localGraph(site: Site, center: Entity): Graph | undefined {
  const seen = new Set([key(center)])
  const around: Entity[] = []
  for (const n of neighbours(site, center)) {
    if (around.length >= MAX_NODES - 1) break
    if (seen.has(key(n))) continue
    seen.add(key(n))
    around.push(n)
  }
  if (around.length < 2) return undefined

  type SimNode = SimulationNodeDatum & { entity: Entity }
  const simNodes: SimNode[] = [center, ...around].map((entity) => ({ entity }))
  const simLinks: { source: number; target: number }[] = around.map((_, i) => ({
    source: 0,
    target: i + 1,
  }))
  for (let i = 0; i < around.length; i++) {
    for (let j = 0; j < around.length; j++) {
      if (i !== j && linked(around[i]!, around[j]!)) {
        simLinks.push({ source: i + 1, target: j + 1 })
      }
    }
  }

  // d3-force starts from a fixed spiral, so the same data always lays out the same way.
  forceSimulation(simNodes)
    // forceLink swaps the indices for node objects, so it gets copies.
    .force(
      "link",
      forceLink(simLinks.map((l) => ({ ...l })))
        .distance(70)
        .strength(0.6),
    )
    .force("charge", forceManyBody().strength(-220))
    .force("collide", forceCollide(26))
    .force("center", forceCenter(0, 0))
    .stop()
    .tick(300)

  const xs = simNodes.map((n) => n.x ?? 0)
  const ys = simNodes.map((n) => n.y ?? 0)
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  const scale = Math.min(
    (WIDTH - 2 * PAD) / Math.max(maxX - minX, 1),
    (HEIGHT - 2 * PAD) / Math.max(maxY - minY, 1),
    1.6,
  )
  const offsetX = (WIDTH - (maxX - minX) * scale) / 2
  const offsetY = (HEIGHT - (maxY - minY) * scale) / 2

  const nodes: GraphNode[] = simNodes.map((n, i) => ({
    ...describe(n.entity),
    center: i === 0,
    x: Math.round(((n.x ?? 0) - minX) * scale + offsetX),
    y: Math.round(((n.y ?? 0) - minY) * scale + offsetY),
  }))
  return {
    nodes,
    edges: simLinks.map((l) => ({ from: nodes[l.source]!, to: nodes[l.target]! })),
    width: WIDTH,
    height: HEIGHT,
  }
}
