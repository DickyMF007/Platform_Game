export type PowerUnit = "million" | "billion";

export function toAbsolutePower(amount: number, unit: PowerUnit): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;

  const multiplier = unit === "billion" ? 1_000_000_000 : 1_000_000;
  return Math.round(amount * multiplier);
}

export function formatPowerCompact(power: number): string {
  if (!Number.isFinite(power) || power <= 0) return "0";

  if (power >= 1_000_000_000) {
    const value = power / 1_000_000_000;
    return `${trimTrailingZeros(value)}B`;
  }

  if (power >= 1_000_000) {
    const value = power / 1_000_000;
    return `${trimTrailingZeros(value)}M`;
  }

  return power.toLocaleString("en-US");
}

function trimTrailingZeros(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}
