declare const __ALLOW_UNREVIEWED__: boolean | undefined;

/**
 * True hanya pada build development atau build uji yang sengaja mengizinkan konten
 * yang belum ditinjau. Di build produksi nilainya false, sehingga materi draft dan
 * needs-review tidak pernah sampai ke pemain. Diatur di vite.config.ts.
 */
export const ALLOW_UNREVIEWED: boolean = typeof __ALLOW_UNREVIEWED__ !== "undefined" && __ALLOW_UNREVIEWED__ === true;
