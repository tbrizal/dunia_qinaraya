# Dunia Qinaraya

*Where Life, Adventure, and Faith Grow Together.*

Game simulasi kehidupan fantasi 3D (third-person) untuk anak dan keluarga.
Acuan desain utama: `QINARAYA_MASTER_GDD.md`.

**Status:** Phase 3 (Islamic lifestyle foundation) selesai: kalender Hijriah simulasi, jadwal salat simulasi, pengingat lembut, masjid dan tempat wudu yang bisa dikunjungi, aktivitas berwudu dan salat terpandu, materi edukasi, dan tiga quest pembelajaran. **Semua materi agama berstatus belum ditinjau dan tidak tampil di build produksi** (lihat bagian Kebijakan konten). Belum ada event musiman (Phase 4) atau multiplayer.

## Teknologi

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Tailwind CSS 4.

## Menjalankan

Butuh Node.js 20 atau lebih baru (Node 22.18+ untuk menjalankan test).

```bash
npm install
npm run dev        # server pengembangan
npm run typecheck  # pemeriksaan TypeScript
npm test           # 160+ test: logic, layout, integrasi store, dan isi bundle build (tanpa browser)
npm run content:review  # membuat docs/CONTENT_REVIEW.md untuk peninjau konten
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
| Kalender dan jadwal salat | Ketuk panel jam di kiri atas atau tombol T |
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

## Phase 3: gaya hidup Islami (simulasi)

- **Panel jam (kiri atas)** menampilkan jam game, tanggal Hijriah simulasi, dan waktu salat berikutnya. Ketuk untuk melihat kalender dan jadwal lima waktu.
- **Pengingat lembut** muncul tepat sekali saat waktu salat simulasi tiba. Tidak ada hukuman, skor, atau kewajiban; bisa dimatikan di pengaturan. Bunyi denting (buatan kode, bukan azan) default mati.
- **Lokasi:** Masjid Qinaraya (utara desa) dan Tempat wudu (di sebelah kiri masjid). Berdiri di depannya lalu tekan E atau ketuk tombol aksi.
- **Berwudu:** di tempat wudu, kapan saja. Latihan terpandu enam langkah (bersiap, niat, wajah, kedua tangan, kepala, kedua kaki) dengan catatan bahwa rincian bisa berbeda dan perlu mengikuti guru.
- **Salat:** di masjid, **hanya saat waktu salat sedang berlangsung** (jendelanya diatur di konfigurasi; contoh Dzuhur 12.00 sampai 15.00). Tombolnya berbunyi "Salat Dzuhur" dan di luar waktu tampil redup dengan penjelasan "Belum waktu salat. Berikutnya ...". Panel jam menandai "Waktu Dzuhur sekarang".
- **Ustadz Harun** berdiri di depan masjid dan memberi tiga quest pembelajaran: berkenalan dengan masjid, bersih dan bersuci (termasuk latihan wudu), dan berbagi hasil kebun (butuh quest kebun selesai). Hadiahnya hanya dekorasi.

Aktivitas wudu dan salat **opsional, tanpa skor, tanpa hadiah, tanpa pencatatan "sudah salat", dan tanpa penalti**; bisa ditutup kapan saja. Aktivitas salat sengaja berupa jeda terpandu berbentuk teks dan **bukan simulasi tata cara salat**: tidak ada animasi gerakan wudu atau salat, karena detail gerakan ibadah wajib ditinjau pihak yang kompeten lebih dulu. Hanya latihan wudu yang dihitung sebagai objektif quest belajar; salat tidak pernah menjadi objektif atau progres apa pun.

**Kalender dan jadwal adalah simulasi buatan game.** Tidak memakai GPS, lokasi, atau API dunia nyata, dan bukan penetapan tanggal ibadah.
Konfigurasi ada di `src/config/lifestyleConfig.ts`: tanggal awal, jumlah hari per bulan, kecepatan kalender, serta jam dan lama jendela (`windowMinutes`) tiap waktu salat. Jendela tidak boleh melewati waktu salat berikutnya (divalidasi oleh `validateSchedule`).

### Kebijakan konten (penting)

Semua materi agama yang ditulis pengembang berstatus `draft` atau `needs-review`. Aturannya:

- Konten non-`approved` **tidak ikut terkirim** pada build produksi. Teksnya dipisah ke `src/data/unreviewed/` dan hanya dimuat lewat dynamic import saat build mengizinkan. `npm test` membangun aplikasi sungguhan dan memeriksa bahwa teksnya tidak ada di bundle produksi.
- Tanpa konten itu, game tetap utuh: masjid tetap bisa dikunjungi dan halamannya dibersihkan, Ustadz Harun berdialog cadangan non-agama, quest kebun berjalan normal.
- Build mengizinkan konten belum ditinjau hanya di: development (`npm run dev`), atau build uji dengan `VITE_SHOW_UNREVIEWED_CONTENT=true`.
  **Di Vercel, atur variabel ini hanya untuk environment Preview, jangan Production.** Pada Production (`VERCEL_ENV=production`) saklar ini otomatis diabaikan.
- Panel materi dan aktivitas menampilkan label "Mode uji: belum ditinjau" setiap kali konten draf tampil.
- Tidak ada kutipan ayat atau hadis. Materi wudu dan waktu salat berstatus `needs-review` dan merujuk perbedaan rincian ke orang tua atau guru.
- Untuk menyetujui materi, ikuti `docs/CONTENT_REVIEW.md` (dibuat otomatis, berisi seluruh teks dan kolom persetujuan). Status `approved` tanpa `reviewedBy` dan `reviewedAt` ditolak oleh test.

### Panel debug (hanya development)

Tombol "DEV waktu" di bawah layar saat `npm run dev`: lompat waktu (misalnya ke dalam jendela Dzuhur untuk menguji aktivitas salat), lompat ke tanggal Hijriah (misalnya 1 Ramadan), maju sampai satu menit sebelum waktu salat berikutnya (untuk menguji pengingat), dan reset quest atau materi. Panel ini tidak ada di build produksi.

## Struktur folder

```text
src/
├── app/                    # Komponen root
├── components/
│   ├── game/               # 3D: Canvas, PlayerRig, GameLoop, CharacterModel, FpsMeter
│   └── ui/                 # HUD, tombol aksi, dialog, tas, pengaturan, joystick, toast
├── config/gameConfig.ts    # Semua angka penyeimbang
├── data/                   # Data murni: items, crops, npcs, places, quests, dialogues, learning
│   └── unreviewed/         # Konten agama BELUM ditinjau (tidak ikut build produksi)
├── hooks/                  # useKeyboardInput
├── stores/                 # Zustand + orkestrasi aksi (gameActions, dialogueActions, persistence)
├── systems/                # Logic murni tanpa DOM/Three.js (dites di Node)
│   ├── time/               # GameClock, siang-malam, waktu hari
│   ├── calendar/  prayer/  content/  audio/   # Hijriah simulasi, jadwal salat, gerbang review, denting
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

Disimpan di `localStorage` (kunci `qinaraya.save`; kunci Phase 2 `qinaraya.save.v1` tetap dibaca dan dimigrasikan), berisi posisi, waktu dunia, tas, kebun, quest, dan pengaturan.
Autosave tiap 20 detik, setelah perubahan penting, dan saat tab disembunyikan. Data divalidasi ketat saat dimuat.
Save rusak dicadangkan ke `qinaraya.save.backup` sebelum game baru dimulai; save dari versi lebih baru tidak ditimpa.
Format saat ini versi 2 (migrasi v1 ke v2 sudah ada dan teruji). Mengubah struktur save: naikkan `SAVE_VERSION` dan tambah migrasi di `systems/save/saveSystem.ts`.

## Penyeimbangan

Ubah di `src/config/gameConfig.ts`: kecepatan jalan/lari, kamera, kecepatan waktu game, ukuran tas, lama satu kali siram,
jangkauan interaksi, dan interval autosave. Waktu tumbuh tanaman ada di `data/crops.ts`, jadwal salat dan kalender di `config/lifestyleConfig.ts`.
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

## Daftar uji manual tambahan (Phase 3)

- [ ] Panel jam menampilkan jam, tanggal Hijriah, dan waktu salat berikutnya; ketuk membuka kalender dan jadwal.
- [ ] Tanggal berganti tepat tengah malam game. Gunakan panel DEV untuk lompat ke 1 Ramadan.
- [ ] Pengingat salat muncul sekali, tidak berulang, dan hilang sendiri. Uji dengan tombol "Maju ke ... - 1 menit".
- [ ] Mematikan pengingat di pengaturan benar-benar menghentikannya; bunyi denting hanya bila dinyalakan.
- [ ] Masjid dan tempat wudu: prompt muncul saat berdiri di depannya; Ustadz Harun mudah dijangkau.
- [ ] Berwudu bisa dibuka kapan saja dan ditutup di tengah jalan; Salat hanya aktif di dalam jendela waktu salat, dan redup dengan penjelasan di luar itu.
- [ ] Pengingat salat di build uji menyertakan saran "berwudu dan salat di masjid, atau lanjut bermain"; tidak ada yang berubah bila diabaikan.
- [ ] Materi terbaca per halaman (tombol Kembali, Lanjut, Selesai) dan terbaca baik di layar kecil.
- [ ] Tiga quest berjalan sampai selesai dan hadiah dekorasi masuk tas.
- [ ] Build produksi (`npm run build && npm run preview`): tidak ada materi agama, masjid tetap bisa dibersihkan, dialog Ustadz cadangan.
- [ ] Muat ulang halaman: progres materi dan quest kembali; save Phase 2 lama tetap terbuka.
- [ ] Teks materi dan dialog telah dibaca peninjau yang kompeten sebelum dipublikasikan.

## Keterbatasan saat ini

- Semua model dan ikon adalah placeholder (bentuk dasar dan emoji). Aset final menyusul pada fase aset.
- Kamera belum menghindari dinding, dan belum ada bayangan dinamis.
- Belum ada pembuatan karakter, hewan ternak, memasak, jual-beli, dan Qina Coin.
- **Tidak ada animasi gerakan wudu atau salat di 3D.** Aktivitasnya hanya terpandu lewat teks. Animasi baru boleh dibuat bila peninjau memberi dan menyetujui urutan gerakannya.
- **Belum ada peninjau konten.** Seluruh materi agama masih draf. Hingga ditinjau, build produksi tidak memuatnya.
- Event Islami (Ramadan, Idulfitri, Iduladha, dan lain-lain) belum ada; itu Phase 4. Bila `calendarDaysPerGameDay` lebih dari 1, pencocokan event pada hari tertentu perlu memperhitungkan hari kalender yang terlewati.
- Kalender memakai 30 hari per bulan agar sederhana; bulan Hijriah sebenarnya 29 atau 30 hari.
- Denting pengingat dibuat dengan WebAudio dan belum teruji di perangkat. Peramban dapat menunda audio sampai ada interaksi pemain.
- Save hanya di perangkat ini (tanpa akun atau cloud). Siang-malam hanya mengubah cahaya; NPC belum punya jadwal harian.
- Dialog, tas, dan materi belum bisa dioperasikan dengan gamepad.
