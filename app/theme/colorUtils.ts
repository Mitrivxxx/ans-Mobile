/** Operacje na kolorach w formacie `#RRGGBB`. */

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Nieobsługiwany kolor: ${hex}`);
  }
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function toHex(channel: number): string {
  return Math.round(Math.min(255, Math.max(0, channel)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

/** Przyciemnia kolor o `amount` (0–1), zachowując odcień. */
export function darkenHex(hex: string, amount: number): string {
  const factor = 1 - amount;
  const [r, g, b] = parseHex(hex);
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
}

/** Kolor z kanałem alfa (`#RRGGBBAA`), `opacity` 0–1. */
export function withAlpha(hex: string, opacity: number): string {
  parseHex(hex);
  return `${hex.slice(0, 7)}${toHex(opacity * 255)}`;
}

function channelLuminance(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminancja względna wg WCAG 2.x. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** Współczynnik kontrastu WCAG (1–21). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}
