# Dunia Qinaraya

*Where Life, Adventure, and Faith Grow Together.*

Game simulasi kehidupan fantasi 3D (third-person) untuk anak dan keluarga.
Acuan desain utama: `QINARAYA_MASTER_GDD.md`.

**Status:** Phase 2 (Life simulation core) selesai: Game Clock, interaksi, inventory, farming, NPC dan dialog, quest tutorial, serta save/load lokal. Belum ada sistem Islami, event musiman, atau multiplayer.

## Teknologi

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS 4.

## Menjalankan

Butuh Node.js 20 atau lebih baru (Node 22.18+ untuk menjalankan test).

```bash
npm install
npm run dev        # server pengembangan
npm run typecheck  # pemeriksaan TypeScript
npm test           # 100+ test: logic murni, layout desa, dan integrasi store (tanpa browser)
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
| Interaksi | E atau Enter untuk aksi utama, angka 1 sampai 4 untuk pilihan lain. Di layar sentuh, ketuk tombol aksi di kanan bawah |
| Tas | Tombol tas di kanan atas atau tombol I |
| Semua | Tombol pengaturan di kanan atas atau tombol Escape: sensitivitas kamera, kontrol sentuh, FPS, kecepatan waktu (uji), game baru |

Gerakan selalu relatif terhadap arah kamera. Kontrol sentuh tampil otomatis di perangkat layar sentuh;
di desktop bisa dipaksa muncul lewat pengaturan (berguna untuk uji dengan device mode browser).

## Cara bermain (Phase 2)

1. Dari titik awal, jalan ke barat daya menuju kebun dan temui **Pak Hasan** (dekat gubuk). Tekan E atau ketuk tombol Bicara.
2. Terima misi **Kebun Pertama**. Kamu mendapat cangkul, penyiram, dan benih.
3. Berdiri di atas petak kebun: **Cangkul**, **Tanam** (pilih wortel, tomat, atau kentang), **Siram**.
4. Tunggu tanaman tumbuh. Tanaman hanya tumbuh saat tanah basah; tanah kering menjeda, tidak mematikan.
5. **Panen** saat siap, lalu serahkan misi ke Pak Hasan. Kemajuan tersimpan otomatis.

Untuk menguji lebih cepat, naikkan kecepatan waktu (4x atau 16x) di pengaturan.
Nara berada di dekat plaza dan memberi petunjuk tempat-tempat di desa.

## Struktur folder

```text
src/
├── app/                    # Komponen root
├── components/
│   ├── game/               # 3D: Canvas, PlayerRig, GameLoop, CharacterModel, FpsMeter
│   └── ui/                 # HUD, tombol aksi, dialog, tas, pengaturan, joystick, toast
├── config/gameConfig.ts    # Semua angka penyeimbang
├── data/                   # Data murni: items, crops, npcs, quests, dialogues
├── hooks/                  # useKeyboardInput
├── stores/                 # Zustand + orkestrasi aksi (gameActions, dialogueActions, persistence)
├── systems/                # Logic murni tanpa DOM/Three.js (dites di Node)
│   ├── time/               # GameClock, siang-malam, waktu hari
│   ├── inventory/  farming/  quest/  dialogue/  interaction/
│   ├── movement/  camera/  input/  player/
│   └── save/               # Format save, validasi, migrasi versi
└── worlds/qinaraya-village/
    ├── villageLayout.ts    # Data tata letak + collider (sumber tunggal)
    ├── interactables.ts    # Petak dan NPC yang bisa diinteraksi
    └── *.tsx               # Ground, Buildings, Vegetation, FarmPlots, Npcs, TargetMarker, DayNightLighting
tests/                      # node --test: logic, layout, dan integrasi store
```

Prinsip: `systems/` tidak mengimpor React atau Three.js. Aturan game ada di `systems/`,
data di `data/`, store hanya menyimpan state, komponen hanya menggambar.

## Game Clock

`src/systems/time/gameClock.ts` adalah satu-satunya sumber waktu simulasi. Default: 60 detik nyata = 1 jam game
(1 hari = 24 menit). Waktu hanya maju saat game berjalan: dijeda saat panel terbuka atau tab disembunyikan,
dan tidak berjalan saat game ditutup (jadi tanaman tidak pernah dirugikan karena pemain absen).
Modul lain memakai `gameClock.subscribe()` atau `onCrossing("hours" | "days" | "months" | "years", ...)`
dan tidak boleh membuat timer sendiri. Kalender di sini generik (30 hari x 12 bulan); pemetaan ke Hijriah dibuat
pada Phase 3 di atas Game Clock yang sama.

## Menambah konten

- **Item baru:** tambah di `data/items.ts`.
- **Tanaman baru:** tambah item benih dan hasil panen, lalu entri di `data/crops.ts`. Tanpa perubahan kode lain.
- **NPC atau dialog baru:** `data/npcs.ts` dan `data/dialogues.ts`. Dialog boleh memakai `{timeOfDay}`.
- **Quest baru:** `data/quests.ts`; jenis objektif: till, plant, water, harvest.

## Save

Disimpan di `localStorage` (kunci `qinaraya.save.v1`), berisi posisi, waktu dunia, tas, kebun, quest, dan pengaturan.
Autosave tiap 20 detik, setelah perubahan penting, dan saat tab disembunyikan. Data divalidasi ketat saat dimuat.
Save rusak dicadangkan ke `qinaraya.save.backup` sebelum game baru dimulai; save dari versi lebih baru tidak ditimpa.
Mengubah struktur save: naikkan `SAVE_VERSION` dan tambah migrasi di `systems/save/saveSystem.ts`.

## Penyeimbangan

Ubah di `src/config/gameConfig.ts`: kecepatan jalan/lari, kamera, kecepatan waktu game, ukuran tas, lama satu kali siram,
jangkauan interaksi, dan interval autosave. Waktu tumbuh tanaman ada di `data/crops.ts`.
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

## Daftar uji manual tambahan (Phase 2)

- [ ] Prompt aksi muncul saat berdiri di petak atau dekat NPC, dan menghilang saat menjauh.
- [ ] Tanpa alat atau benih, aksi tampil redup dan menampilkan alasan saat ditekan.
- [ ] Loop lengkap: bicara, terima misi, cangkul, tanam, siram, tunggu, panen, serahkan misi.
- [ ] Tanah berubah gelap saat basah; tanaman membesar bertahap dan berbuah saat siap.
- [ ] Jam HUD berjalan; membuka tas, dialog, atau pengaturan menjeda waktu.
- [ ] Siang menjadi sore lalu malam yang redup tetapi tetap terbaca di layar kecil.
- [ ] Muat ulang halaman: posisi, tas, kebun, quest, dan waktu kembali seperti terakhir.
- [ ] Layar kecil (sekitar 320 px): tombol aksi, HUD, tas, dan dialog tidak saling menutupi.

## Keterbatasan saat ini

- Semua model dan ikon adalah placeholder (bentuk dasar dan emoji). Aset final menyusul pada fase aset.
- Kamera belum menghindari dinding, dan belum ada bayangan dinamis.
- Belum ada pembuatan karakter, hewan ternak, memasak, jual-beli, dan Qina Coin (di luar ruang lingkup Phase 2).
- Dialog NPC statis dan belum berisi konten keagamaan. Konten Islami (Phase 3) wajib ditinjau pihak kompeten sebelum rilis.
- Save hanya di perangkat ini (belum ada akun atau cloud). Data dapat hilang bila pemain menghapus data browser.
- Siang-malam hanya mengubah cahaya dan langit; NPC belum punya jadwal harian.
- Dialog dan tas belum bisa dioperasikan dengan gamepad.
