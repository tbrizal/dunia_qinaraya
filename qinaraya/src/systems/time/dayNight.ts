/**
 * Suasana pencahayaan berdasarkan jam game. Sengaja lembut: malam tetap cukup terang
 * agar dunia terbaca di layar kecil dan perangkat redup.
 */

export interface Atmosphere {
  skyColor: number;
  hemiIntensity: number;
  dirIntensity: number;
  dirColor: number;
}

interface Keyframe extends Atmosphere {
  hour: number;
}

const NIGHT: Omit<Keyframe, "hour"> = { skyColor: 0x26364a, hemiIntensity: 0.5, dirIntensity: 0.3, dirColor: 0x9fb2e0 };

const KEYFRAMES: readonly Keyframe[] = [
  { hour: 0, ...NIGHT },
  { hour: 5, skyColor: 0x3b4a60, hemiIntensity: 0.55, dirIntensity: 0.4, dirColor: 0xc9a98a },
  { hour: 6.5, skyColor: 0xe8c9a6, hemiIntensity: 0.8, dirIntensity: 0.9, dirColor: 0xffc98f },
  { hour: 9, skyColor: 0xc6dcd6, hemiIntensity: 0.95, dirIntensity: 1.15, dirColor: 0xffe6bd },
  { hour: 16, skyColor: 0xc6dcd6, hemiIntensity: 0.95, dirIntensity: 1.15, dirColor: 0xffe6bd },
  { hour: 18, skyColor: 0xe7b98f, hemiIntensity: 0.8, dirIntensity: 0.85, dirColor: 0xffb070 },
  { hour: 19.5, skyColor: 0x4a4a68, hemiIntensity: 0.6, dirIntensity: 0.45, dirColor: 0xa089b5 },
  { hour: 21, ...NIGHT },
  { hour: 24, ...NIGHT },
];

export function lerpHex(a: number, b: number, t: number): number {
  const channel = (shift: number) => {
    const ca = (a >> shift) & 0xff;
    const cb = (b >> shift) & 0xff;
    return Math.round(ca + (cb - ca) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

/** `hourFloat` adalah jam desimal, misalnya 13.5 untuk 13.30. */
export function getAtmosphere(hourFloat: number): Atmosphere {
  const h = ((hourFloat % 24) + 24) % 24;
  let i = 0;
  while (i < KEYFRAMES.length - 2 && h >= KEYFRAMES[i + 1]!.hour) i++;
  const a = KEYFRAMES[i]!;
  const b = KEYFRAMES[i + 1]!;
  const t = (h - a.hour) / (b.hour - a.hour);
  return {
    skyColor: lerpHex(a.skyColor, b.skyColor, t),
    hemiIntensity: a.hemiIntensity + (b.hemiIntensity - a.hemiIntensity) * t,
    dirIntensity: a.dirIntensity + (b.dirIntensity - a.dirIntensity) * t,
    dirColor: lerpHex(a.dirColor, b.dirColor, t),
  };
}
