/* ═══════════════════════════════════════════
   Projects & templates — edit the list here.
   - kind "project"  → a delivered client work
   - kind "template" → a ready-to-launch template (shows a price badge + "Preview" cursor)
   - image: drop the screenshot in /public/projects/<slug>.webp. If the file is missing,
     the generated cover (3 colours + outlined word) is used, so nothing looks broken.
   The ORDER matters: the bento layout repeats every 7 cards
   (1 wide, 1 big + 2 small, 2 small + 1 big).
   ═══════════════════════════════════════════ */

export const CATS = ["Branding", "Digital", "Labs", "Boost"] as const;
export type Cat = (typeof CATS)[number];
export type Kind = "project" | "template";

export interface Project {
  slug: string;
  title: string;
  cat: Cat;
  kind: Kind;
  year: number;
  price?: number; // templates only
  hue: [string, string, string]; // gradient start, end, glow
  glyph: string; // outlined word on the generated cover
  href?: string; // defaults to /projects/<slug>
}

export const PROJECTS: Project[] = [
  { slug: "vog-coffee", title: "Vog Coffee", cat: "Digital", kind: "project", year: 2024, hue: ["#1f3a2e", "#5d7f68", "#d6c7a3"], glyph: "Vog" },
  { slug: "adorama", title: "Adorama", cat: "Digital", kind: "project", year: 2024, hue: ["#c9a98d", "#f2ebe0", "#ffe3b8"], glyph: "Lens" },
  { slug: "delta", title: "Delta", cat: "Digital", kind: "project", year: 2024, hue: ["#2d4a5f", "#8fbad4", "#96c8e6"], glyph: "Delta" },
  { slug: "dental-clinic", title: "Dental Clinic", cat: "Branding", kind: "project", year: 2024, hue: ["#86a9c4", "#e3ecf2", "#ffffff"], glyph: "Smile" },
  { slug: "caffinity", title: "Caffinity", cat: "Digital", kind: "project", year: 2024, hue: ["#a6864a", "#ece3cf", "#fff1d6"], glyph: "Cafe" },
  { slug: "huracan", title: "Huracan", cat: "Labs", kind: "project", year: 2024, hue: ["#1d272e", "#4a6a80", "#96c8e6"], glyph: "Hura" },
  { slug: "characlow", title: "CharaFlow", cat: "Labs", kind: "project", year: 2024, hue: ["#8a6a86", "#e3d3e0", "#ffd9ec"], glyph: "Flow" },
  { slug: "visionary-optics", title: "Visionary Optics", cat: "Digital", kind: "project", year: 2024, hue: ["#5f88a8", "#dfe8ee", "#ffffff"], glyph: "Vision" },
  { slug: "to-way", title: "To Way", cat: "Branding", kind: "project", year: 2024, hue: ["#2a2118", "#7a5a38", "#e0a24a"], glyph: "Way" },
  { slug: "flower-hub", title: "Flower Hub", cat: "Boost", kind: "project", year: 2024, hue: ["#d8a7b1", "#f6e9ea", "#ffffff"], glyph: "Bloom" },
  { slug: "sky-jets", title: "Sky Jets", cat: "Labs", kind: "project", year: 2025, hue: ["#3f6580", "#a9c6dc", "#ffe3b8"], glyph: "Jets" },
  { slug: "aurora-store", title: "Aurora Store", cat: "Digital", kind: "template", year: 2026, price: 79, hue: ["#7fa6c4", "#dbe6ee", "#fff1d6"], glyph: "Aurora" },
  { slug: "nordic-nest", title: "Nordic Nest", cat: "Digital", kind: "template", year: 2026, price: 69, hue: ["#d6c7a3", "#e9eef2", "#a6864a"], glyph: "Nest" },
  { slug: "halo-studio", title: "Halo Studio", cat: "Branding", kind: "template", year: 2026, price: 59, hue: ["#c9a98d", "#f2f0ec", "#fff1d6"], glyph: "Halo" },
  { slug: "orbit-labs", title: "Orbit Labs", cat: "Labs", kind: "template", year: 2026, price: 89, hue: ["#2d4a5f", "#8fbad4", "#d6baa0"], glyph: "Orbit" },
  { slug: "bloom-boost", title: "Bloom Boost", cat: "Boost", kind: "template", year: 2026, price: 49, hue: ["#5f88a8", "#dfe8ee", "#ffd9ec"], glyph: "Boost" },
];