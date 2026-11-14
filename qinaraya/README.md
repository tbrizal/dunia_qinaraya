# Dunia Qinaraya

*Where Life, Adventure, and Faith Grow Together.*

Game simulasi kehidupan fantasi 3D (third-person) untuk anak dan keluarga.
Acuan desain utama: `QINARAYA_MASTER_GDD.md`.

**Status:** Phase 1 (Third-person village prototype) selesai. Belum ada farming, inventory, NPC, atau multiplayer.

## Teknologi

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS 4.

## Menjalankan

Butuh Node.js 20 atau lebih baru (Node 22.18+ untuk menjalankan test).

```bash
npm install
npm run dev        # server pengembangan
npm run typecheck  # pemeriksaan TypeScript
npm test           # unit test logic (movement, collision, kamera, input, layout desa)
npm run build      # type-check + build produksi ke dist/
npm run preview    # menjalankan hasil build secara lokal
```

Mencoba dari HP di jaringan yang sama: `npm run dev -- --host`, lalu buka alamat jaringan yang tampil.

## Kontrol

| Perangkat | Aksi |
| --- | --- |
| Keyboard | WASD atau tombol panah untuk berjalan, Shift untuk berlari |
| Mouse | Seret (klik kiri atau kanan) untuk memutar kamera, roda untuk zoom |
| Layar sentuh | Joystick kiri untuk berjalan, tombol Lari ditahan untuk berlari, geser layar untuk memutar kamera, cubit untuk zoom |
| Semua | Tombol pengaturan di kanan atas atau tombol Escape: sensitivitas kamera, kontrol sentuh, FPS |

Gerakan selalu relatif terhadap arah kamera. Kontrol sentuh tampil otomatis di perangkat layar sentuh;
di desktop bisa dipaksa muncul lewat pengaturan (berguna untuk uji dengan device mode browser).

## Struktur folder

```text
src/
├── app/                    # Komponen root
├── components/
│   ├── game/               # Komponen 3D: Canvas, PlayerRig, CharacterModel, FpsMeter
│   └── ui/                 # UI 2D: joystick, tombol, pengaturan, petunjuk, loading
├── config/gameConfig.ts    # Semua angka penyeimbang (kecepatan, kamera, batas)
├── hooks/                  # useKeyboardInput
├── stores/                 # Zustand: status aplikasi, pengaturan
├── systems/                # Logic murni tanpa DOM/Three.js (bisa dites di Node)
│   ├── movement/           # Matematika gerak, collision, stepPlayer
│   ├── camera/             # Kamera orbit third-person
│   ├── input/              # State input bersama
│   └── player/             # State pemain tunggal
└── worlds/qinaraya-village/
    ├── villageLayout.ts    # Data tata letak + collider (sumber tunggal)
    └── *.tsx               # Ground, Buildings, Vegetation, Backdrop, VillageScene
tests/                      # Unit test (node --test)
```

Prinsip: `systems/` tidak mengimpor React atau Three.js. Komponen hanya membaca state dan menggambar.
Collider dibuat dari data yang sama dengan yang menggambar bangunan, sehingga tidak bisa tidak sinkron.

## Penyeimbangan

Ubah di `src/config/gameConfig.ts`: kecepatan jalan/lari, akselerasi, jarak dan sudut kamera,
kecepatan rotasi, zona mati joystick, dan ukuran area bermain.
Tata letak desa diubah di `villageLayout.ts` (posisi bangunan, jalan, kebun, jumlah pohon).

## Deploy frontend ke Vercel

1. Push repository ke GitHub.
2. Di Vercel pilih **Add New Project** dan impor repository.
3. Framework terdeteksi sebagai Vite. Build command `npm run build`, output directory `dist`.
4. Tidak ada environment variable yang dibutuhkan.

## Daftar uji manual (wajib di perangkat nyata)

Unit test memverifikasi logic, tetapi rasa kontrol dan tampilan harus diuji di perangkat:

- [ ] Karakter berjalan lancar dengan WASD dan panah; Shift membuatnya berlari.
- [ ] Setelah kamera diputar, "maju" tetap menuju arah yang dilihat kamera.
- [ ] Karakter menghadap arah geraknya dan tidak berputar aneh saat belok tajam.
- [ ] Menabrak rumah, masjid, kios, sumur, dan pohon: karakter tertahan dan meluncur di sisinya, tidak tembus.
- [ ] Tidak bisa keluar dari area desa; dinding hutan terlihat di tepi.
- [ ] HP (portrait dan landscape): joystick mudah dipakai, jari lain bisa memutar kamera bersamaan.
- [ ] Layar kecil (sekitar 320 px lebar): tombol tidak menutupi karakter atau jalan di depannya.
- [ ] Cubit untuk zoom bekerja; halaman tidak ikut ter-zoom atau ter-scroll.
- [ ] Pengaturan: slider sensitivitas terasa mengubah kecepatan putar kamera.
- [ ] Aktifkan FPS di pengaturan dan catat angkanya di perangkat menengah.

## Keterbatasan Phase 1

- Semua model adalah placeholder dari bentuk dasar. Aset final menyusul pada fase aset.
- Kamera belum menghindari dinding: bila kamera diputar ke arah bangunan, kamera bisa menembusnya.
- Tidak ada bayangan dinamis (hanya bayangan bulat di bawah karakter) demi performa mobile.
- Pengaturan belum tersimpan permanen; penyimpanan datang bersama Save System.
- Belum ada label nama tempat. Bangunan dikenali dari bentuknya (masjid berkubah dan bermenara, kios bergaris, kebun tanah cokelat di barat daya).
- Konten keagamaan belum ada; bangunan masjid hanya berfungsi sebagai landmark.
