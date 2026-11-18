export const HERO_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 75,
  size: 3 + (i % 4) * 2,
  delay: -((i % 7) * 1.7),
  dur: 9 + (i % 5) * 2,
}));
