/** Lokasi di desa yang bisa diajak berinteraksi (titik berdiri di depan bangunan). */

export interface PlaceDef {
  id: string;
  name: string;
  blurb: string;
  x: number;
  z: number;
  /** Materi yang bisa dipelajari di lokasi ini. */
  contentIds: readonly string[];
  /** Aktivitas non-materi yang tersedia di lokasi ini. */
  activities: readonly "clean"[];
}

export const PLACES: readonly PlaceDef[] = [
  {
    id: "masjid",
    name: "Masjid Qinaraya",
    blurb: "Tempat ibadah dan berkumpul warga",
    x: 0,
    z: -10.5,
    contentIds: ["masjid-intro", "masjid-adab"],
    activities: ["clean"],
  },
  {
    id: "musala",
    name: "Musala Qinaraya",
    blurb: "Tempat salat yang kecil dan tenang",
    x: 16,
    z: -6.8,
    contentIds: ["musala-intro"],
    activities: [],
  },
  {
    id: "wudu",
    name: "Tempat wudu",
    blurb: "Tempat bersuci di dekat masjid",
    x: -7.5,
    z: -9.6,
    contentIds: ["wudu-intro"],
    activities: [],
  },
];

export function getPlaceDef(id: string): PlaceDef | undefined {
  return PLACES.find((p) => p.id === id);
}
