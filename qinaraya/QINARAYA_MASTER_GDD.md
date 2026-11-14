# DUNIA QINARAYA

## Master Game Design Document (GDD) & Claude Implementation Prompts

**Versi dokumen:** 2.0\
**Status:** Acuan utama pengembangan\
**Genre:** Hybrid Fantasy Life Simulation, Farming, Crafting,
Exploration, Fantasy Adventure\
**Kamera:** Third-person 3D\
**Mode:** Single-player terlebih dahulu, kemudian private co-op
multiplayer\
**Target:** Browser desktop dan mobile\
**Identitas:** *A Journey of Life, Adventure & Faith*\
**Tagline:** *Where Life, Adventure, and Faith Grow Together.*

------------------------------------------------------------------------

# CARA MENGGUNAKAN DOKUMEN INI

Dokumen ini adalah **single source of truth** untuk pengembangan Dunia
Qinaraya menggunakan Claude.

1.  Simpan dokumen ini di root repository dengan nama
    `QINARAYA_MASTER_GDD.md`.
2.  Berikan dokumen ini kepada Claude sebagai konteks utama proyek.
3.  Jalankan prompt fase secara berurutan. Jangan meminta Claude
    mengerjakan semua fase sekaligus.
4.  Setelah satu fase selesai, jalankan aplikasi, uji acceptance
    criteria, perbaiki bug, lalu commit ke GitHub.
5.  Jika ada keputusan baru, perbarui bagian GDD yang relevan terlebih
    dahulu. Jangan membiarkan implementasi dan dokumen berbeda.
6.  Minta Claude membaca struktur project dan file yang ada sebelum
    mengubah kode. Jangan mengasumsikan project masih kosong.
7.  Prioritaskan mekanik yang berfungsi dan performa stabil dibanding
    banyak fitur atau aset sementara.

**Aturan penting untuk Claude:** GDD ini menjadi acuan utama. Jika ada
instruksi prompt fase yang bertentangan dengan GDD, GDD yang berlaku
kecuali pengguna secara eksplisit mengubah keputusan.

------------------------------------------------------------------------

# BAGIAN A --- MASTER GAME DESIGN DOCUMENT

# 1. VISI PRODUK

## 1.1 Ringkasan

Dunia Qinaraya adalah game simulasi kehidupan fantasi 3D. Pemain memulai
kehidupan baru di sebuah desa bernama Qinaraya Village. Pemain dapat
membangun rumah, bertani, merawat hewan, memancing, memasak, membuat
barang, berdagang, membantu penduduk, dan menjelajahi wilayah fantasi.

Keunikan Qinaraya adalah nilai dan pembelajaran Islam yang hadir secara
alami melalui aktivitas sehari-hari, NPC, cerita, kalender Hijriah
simulasi, kegiatan Ramadan, Idulfitri, dan Iduladha.

Game ditujukan sebagai pengalaman menyenangkan untuk anak dan keluarga.
Unsur Islam tidak boleh dibuat sebagai sistem hukuman, kompetisi
kesalehan, atau penilaian iman.

## 1.2 Pilar desain

1.  **Life Simulation:** kehidupan sehari-hari, pertanian, rumah, hewan,
    dan aktivitas sosial.
2.  **Fantasy Adventure:** eksplorasi hutan, pantai, gunung, gua, dan
    wilayah fantasi.
3.  **Cooperative Play:** bermain bersama keluarga atau teman melalui
    private co-op.
4.  **Islamic Lifestyle:** pengenalan ibadah, kalender Hijriah simulasi,
    Ramadan, dan hari raya.
5.  **Learning Through Gameplay:** pembelajaran melalui quest, cerita,
    dialog, dan aktivitas.
6.  **Family-friendly & Safe:** desain aman, tanpa public chat, PvP,
    atau monetisasi manipulatif.

## 1.3 Prinsip pengalaman

-   Fun first: game harus menyenangkan meskipun pemain tidak sedang
    mengerjakan quest.
-   Tidak ada hukuman karena melewatkan aktivitas ibadah.
-   Tidak ada skor pahala, skor kesalehan, atau pengukuran tingkat
    keimanan.
-   Tidak ada tekanan untuk login setiap hari.
-   Tidak ada sistem gacha, loot box berbayar, atau pembelian yang
    menekan anak.
-   Pemain dapat bermain dengan ritme sendiri.
-   Kontrol dan UI dirancang mobile-first.
-   Konten agama harus disampaikan dengan hormat dan ditinjau oleh orang
    yang kompeten.

# 2. CERITA DAN DUNIA

## 2.1 Lore

Dunia Qinaraya dahulu merupakan dunia yang subur dan damai. Kehidupan
berbagai wilayah terhubung dengan Great Qinaraya Tree, pohon agung yang
menjadi simbol kehidupan, keseimbangan, dan harapan.

Seiring waktu, beberapa wilayah kehilangan energi kehidupannya. Hutan
diselimuti kabut, sumber air mengering, dan penduduk mulai meninggalkan
tempat tinggal mereka.

Pemain datang sebagai penduduk baru yang membantu membangun kembali desa
dan memulihkan wilayah Qinaraya melalui kerja sama, kreativitas,
pengetahuan, kepedulian, dan petualangan.

Lore bersifat fantasi. Jangan menggambarkan unsur fantasi sebagai bagian
dari ajaran agama.

## 2.2 Wilayah

  -----------------------------------------------------------------------
  Wilayah                 Ciri                    Aktivitas
  ----------------------- ----------------------- -----------------------
  Qinaraya Village        Desa utama dan titik    Rumah, kebun, pasar,
                          awal                    masjid, NPC

  Crystal Forest          Hutan kristal           Eksplorasi, material,
                                                  rahasia

  Sunny Coast             Pantai tropis           Memancing, kerang,
                                                  eksplorasi

  Misty Mountain          Pegunungan berkabut     Mining, gua, tantangan

  Sky Kingdom             Wilayah di atas awan    Quest lanjutan dan
                                                  material langka
  -----------------------------------------------------------------------

MVP hanya membangun Qinaraya Village. Wilayah lain ditunda sampai
fondasi dan gameplay inti stabil.

# 3. KARAKTER DAN NPC

## 3.1 Karakter pemain

Pemain dapat: - Memilih nama dan tampilan karakter. - Memilih karakter
laki-laki atau perempuan. - Menyesuaikan rambut, pakaian, warna, dan
aksesori. - Memiliki rumah dan inventory. - Menggunakan alat pertanian
dan crafting. - Mengembangkan skill melalui aktivitas.

Gunakan karakter stylized 3D yang ramah anak, bukan fotorealistis.

## 3.2 NPC awal

  NPC            Peran              Fungsi
  -------------- ------------------ ---------------------------------
  Pak Hasan      Petani senior      Tutorial pertanian dan quest
  Ustadz Harun   Pembimbing desa    Materi Islam dan nilai kebaikan
  Bu Aisyah      Pengelola dapur    Memasak, makanan, berbagi
  Nara           Petualang muda     Eksplorasi dan cerita
  Kakek Rayan    Penjaga sejarah    Lore dan sejarah Qinaraya
  Laila          Pengrajin          Crafting dan dekorasi
  Pak Yusuf      Pengelola masjid   Aktivitas komunitas dan edukasi

NPC awal boleh menggunakan dialog statis. Sistem jadwal dan relasi
kompleks ditambahkan bertahap.

# 4. CORE GAMEPLAY

## 4.1 Aktivitas inti

-   Bertani dan berkebun.
-   Memelihara hewan.
-   Memancing.
-   Mengumpulkan material.
-   Memasak.
-   Crafting.
-   Membangun dan mendekorasi rumah.
-   Berdagang.
-   Membantu NPC.
-   Menjelajahi area.
-   Menyelesaikan quest.

## 4.2 Pertanian

Siklus dasar: 1. Mengolah tanah. 2. Memilih dan menanam benih. 3.
Menyiram. 4. Menunggu tanaman tumbuh sesuai waktu game. 5. Memanen. 6.
Menyimpan, memasak, membagikan, atau menjual hasil.

Tanaman awal: wortel, tomat, kentang, gandum, jagung, stroberi, melon,
dan kurma.

Tanaman tidak boleh mati hanya karena pemain tidak login. Hindari
mekanik yang menciptakan tekanan atau kehilangan progres ketika pemain
absen.

## 4.3 Peternakan

Hewan potensial: ayam, sapi, kambing, domba, kelinci, dan kuda.

Aktivitas: memberi makan, membersihkan kandang, merawat, dan
mengumpulkan hasil ternak. Mulai dari satu atau dua jenis hewan pada
fase ekspansi.

## 4.4 Ekonomi

Mata uang game: **Qina Coin**.

Sumber: menjual hasil pertanian, crafting, berdagang, dan reward quest
umum.

Qina Coin tidak boleh menjadi alat untuk membeli pahala atau nilai
ibadah. Reward quest Islami sebaiknya berupa item kosmetik, dekorasi,
koleksi, atau friendship point. Jika Qina Coin diberikan untuk quest
umum, pastikan tidak dikaitkan dengan nilai ibadah.

## 4.5 Skill

Skill potensial: - Farming - Fishing - Crafting - Cooking -
Exploration - Animal Care - Social

Skill meningkat dari aktivitas, bukan dari penilaian moral atau agama.

# 5. SISTEM ISLAMI --- KEPUTUSAN FINAL

## 5.1 Tiga keputusan utama

  Area           Keputusan
  -------------- -----------------------------------------
  Waktu salat    Jadwal simulasi di dalam game
  Kalender       Kalender Hijriah simulasi di dalam game
  Pembelajaran   Terintegrasi dengan gameplay dan quest

Tidak menggunakan lokasi GPS, API jadwal salat dunia nyata, atau
kalender Hijriah real-time untuk mekanik inti.

Kalender dan waktu Qinaraya adalah sistem fiktif untuk gameplay. Jangan
menyatakannya sebagai jadwal ibadah atau penetapan tanggal keagamaan
dunia nyata.

## 5.2 Game Clock sebagai sumber waktu utama

Game Clock adalah satu-satunya sumber waktu simulasi. Sistem kalender,
jadwal salat, jadwal NPC, perubahan suasana, dan event membaca waktu
dari Game Clock.

Contoh konfigurasi awal untuk pengujian: - Satu hari game = 24 menit
dunia nyata. - 1 jam game = 1 menit dunia nyata. - Kecepatan waktu harus
configurable. - Pause dan resume mengikuti aturan single-player atau
server multiplayer.

Nilai di atas adalah default prototipe, bukan keputusan final yang tidak
boleh diubah. Buat konfigurasi terpusat agar mudah diseimbangkan.

## 5.3 Lima waktu salat

-   Subuh
-   Dzuhur
-   Ashar
-   Magrib
-   Isya

Jadwal awal adalah konfigurasi desain game yang dapat diubah melalui
file konfigurasi. UI dapat menampilkan waktu berikutnya dan notifikasi
yang lembut. Lingkungan dan aktivitas NPC dapat berubah mengikuti waktu.

Aktivitas edukasi dapat mencakup: - Mengenal waktu salat. - Mengenal
masjid dan musala. - Pengenalan wudu. - Pengenalan adab di masjid. -
Pengenalan salat dan salat sunah melalui konten edukasi yang telah
ditinjau.

Salat sunah yang dapat dikenalkan sebagai materi: rawatib, dhuha,
tahajud, witir, dan tahiyatul masjid.

**Batasan wajib:** - Tidak ada penalti, pengurangan koin, kerusakan
tanaman, kehilangan item, atau penurunan level jika pemain tidak
mengikuti aktivitas salat. - Tidak ada karakter yang mempermalukan atau
menghakimi pemain. - Tidak ada klaim bahwa animasi atau aktivitas dalam
game menggantikan ibadah sebenarnya. - Detail gerakan dan materi ibadah
harus ditinjau pihak yang kompeten. Hindari menyajikan perbedaan fikih
sebagai satu-satunya pendapat tanpa konteks.

## 5.4 Kalender Hijriah simulasi

Gunakan 12 bulan: 1. Muharam 2. Safar 3. Rabiulawal 4. Rabiulakhir 5.
Jumadilawal 6. Jumadilakhir 7. Rajab 8. Syakban 9. Ramadan 10. Syawal
11. Zulkaidah 12. Zulhijah

Untuk prototype, setiap bulan dapat memiliki 30 hari agar implementasi
sederhana. Tandai jelas sebagai kalender simulasi. Jangan mengklaim
sebagai kalender Hijriah astronomis atau kalender penetapan hari raya
dunia nyata.

Tanggal event awal: - 1 Muharam: Tahun Baru Hijriah / pengenalan
pergantian tahun. - 12 Rabiulawal: materi sirah Nabi Muhammad SAW dengan
bahasa hormat; jangan menyatakan perayaan khusus sebagai kewajiban. - 1
Ramadan: awal event Ramadan simulasi. - 17 Ramadan: konten edukasi
Nuzulul Quran. - 1 Syawal: event Idulfitri simulasi. - 10 Zulhijah:
event Iduladha simulasi.

## 5.5 Ramadan

Aktivitas: - Dekorasi desa. - Menyiapkan sahur sebagai aktivitas
memasak. - Membuat dan membagikan takjil. - Membersihkan masjid. -
Membantu dapur komunitas. - Quest berbagi. - Cerita edukasi tentang
Ramadan. - Aktivitas edukasi Tarawih.

Untuk pemain anak, simulasi puasa bersifat opsional dan edukatif. Jangan
mewajibkan puasa penuh untuk menyelesaikan quest atau memperoleh
progres.

## 5.6 Idulfitri

Aktivitas: - Dekorasi hari raya. - Takbir sebagai suasana event dengan
representasi audio yang sesuai. - Aktivitas edukasi salat Id. -
Mengunjungi rumah NPC. - Silaturahmi dan saling memaafkan. - Berbagi
makanan. - Hadiah virtual dari NPC. - Kunjungan ke rumah pemain lain
dalam private multiplayer.

## 5.7 Iduladha

Aktivitas: - Mengenal kisah Nabi Ibrahim AS. - Mengenal makna kurban. -
Menyiapkan dan membagikan makanan. - Membantu warga. - Quest kepedulian
dan berbagi.

Tidak menampilkan penyembelihan grafis. Gunakan pendekatan simbolis dan
edukatif.

## 5.8 Pembelajaran terintegrasi

Pembelajaran hadir melalui: - Dialog NPC. - Quest. - Objek interaktif. -
Cerita singkat. - Event. - Aktivitas sosial. - Eksplorasi lingkungan.

Materi nilai: - Amanah dan tanggung jawab. - Jujur. - Sabar. - Syukur. -
Berbagi. - Silaturahmi. - Kebersihan. - Kasih sayang kepada manusia dan
hewan. - Menjaga lingkungan. - Menuntut ilmu.

Tidak ada skor kesalehan, skor pahala, ranking ibadah, atau penilaian
iman pemain.

## 5.9 Review konten agama

Sediakan data konten yang mudah diedit dan ditinjau. Sebelum materi
agama dipublikasikan, minta peninjauan orang yang kompeten. Jangan
mengarang kutipan ayat atau hadis. Jika sumber belum diverifikasi,
gunakan narasi nilai umum tanpa mengutip teks agama.

# 6. QUEST DESIGN

Kategori: - Main Quest - Side Quest - Farming Quest - Exploration
Quest - Social Quest - Islamic Learning Quest - Seasonal Event Quest -
Cooperative Quest

Contoh:

### The Gift of Kindness

1.  Kumpulkan lima wortel.
2.  Temui Pak Hasan.
3.  Antar hasil panen kepada keluarga yang membutuhkan.
4.  Dengarkan cerita tentang berbagi.

Reward: dekorasi taman, friendship point, dan item kosmetik. Pesan:
membantu sesama.

### The Little Garden

1.  Dapatkan benih.
2.  Olah tanah.
3.  Tanam dan rawat.
4.  Panen.

Pesan: sabar, tanggung jawab, dan syukur.

### Ramadan Together

1.  Bantu Bu Aisyah menyiapkan makanan.
2.  Kumpulkan bahan takjil.
3.  Antar makanan kepada penduduk.
4.  Selesaikan cerita edukasi Ramadan.

Reward: dekorasi dan koleksi Ramadan.

### The Spirit of Sacrifice

1.  Dengarkan kisah Nabi Ibrahim AS.
2.  Bantu menyiapkan bahan makanan.
3.  Kemas makanan.
4.  Bagikan kepada penduduk.

Pesan: kepedulian dan berbagi.

# 7. BANGUNAN

Bangunan awal: - Rumah pemain. - Rumah NPC. - Masjid Qinaraya. -
Musala. - Pasar. - Community Kitchen. - Kebun. - Area peternakan
sederhana.

Bangunan tahap lanjut: - Islamic Library. - Area pembelajaran. -
Workshop. - Fishing dock. - Bangunan wilayah lain.

Gunakan arsitektur fantasi yang sederhana dan menghormati elemen
arsitektur Islam. Hindari ornamen atau teks keagamaan yang ditempatkan
secara tidak pantas.

# 8. MULTIPLAYER

Target jangka menengah: private co-op hingga empat pemain dalam satu
dunia.

-   Satu host atau pemilik dunia.
-   Maksimal empat pemain pada konfigurasi awal.
-   Undangan privat.
-   Tidak ada public server pada MVP.
-   Tidak ada public chat.
-   Gunakan preset emote.
-   Tidak ada PvP.
-   Host/server mengelola state dunia.
-   Waktu, kalender, dan event sama untuk seluruh pemain.
-   Hak akses guest dibatasi.
-   Progres dunia disimpan secara konsisten.

Multiplayer **bukan bagian MVP awal**. Bangun setelah gameplay
single-player dan save/load stabil.

# 9. UI, UX, DAN VISUAL

## 9.1 Arah visual

-   Cozy fantasy.
-   Stylized 3D.
-   Warna natural.
-   Pencahayaan nyaman, tidak terlalu terang.
-   Kontras objek dan lingkungan cukup.
-   UI sederhana dan mudah dibaca.
-   Hindari HUD yang menutupi dunia.

## 9.2 HUD

Elemen potensial: - Jam game. - Tanggal Hijriah simulasi. - Indikator
waktu salat berikutnya. - Inventory. - Quest aktif. - Peta. - Tombol
interaksi. - Status karakter bila memang dibutuhkan.

Informasi ibadah harus tampil dengan tenang dan tidak mengganggu
permainan.

## 9.3 Mobile-first

-   Virtual joystick kiri.
-   Tombol aksi kanan.
-   Tombol cukup besar untuk disentuh.
-   Kamera dapat dikendalikan dengan drag.
-   Teks terbaca.
-   HUD tidak menutupi karakter atau area penting.
-   Sediakan pengaturan sensitivitas kamera.
-   Uji pada ukuran layar kecil sejak awal.
-   Hindari terlalu banyak tombol sekaligus.

# 10. ARSITEKTUR TEKNOLOGI

Rekomendasi stack: - React + TypeScript + Vite - Three.js - React Three
Fiber - Drei - Zustand - Tailwind CSS - Colyseus + Node.js untuk
multiplayer nanti - PostgreSQL/Supabase untuk persistence dan
autentikasi tahap lanjut - GitHub untuk version control - Vercel untuk
frontend deployment - VPS atau layanan Node.js persistent untuk server
multiplayer

Catatan: Vercel dapat digunakan untuk frontend. Server multiplayer
Colyseus memerlukan lingkungan yang mendukung proses server persisten;
jangan mengasumsikan deployment Colyseus sebagai fungsi serverless
biasa.

## 10.1 Prinsip arsitektur

-   Pisahkan UI, rendering 3D, game systems, data, dan services.
-   Gunakan TypeScript types untuk kontrak data.
-   Hindari satu file besar yang berisi semua logika.
-   Data item, tanaman, NPC, quest, dan konten edukasi sebaiknya
    data-driven.
-   Konfigurasi game disimpan terpusat.
-   Jangan menambahkan backend sebelum dibutuhkan fase.
-   Jangan menambahkan dependency tanpa alasan yang jelas.
-   Pastikan setiap fase tetap dapat dijalankan.

## 10.2 Struktur folder target

Struktur boleh berkembang, tetapi pertahankan pemisahan tanggung jawab.

``` text
qinaraya/
├── public/
│   └── assets/
│       ├── characters/
│       ├── environment/
│       ├── buildings/
│       ├── animals/
│       ├── items/
│       ├── audio/
│       └── ui/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── game/
│   │   ├── ui/
│   │   └── hud/
│   ├── worlds/
│   │   └── qinaraya-village/
│   ├── systems/
│   │   ├── character/
│   │   ├── camera/
│   │   ├── interaction/
│   │   ├── farming/
│   │   ├── inventory/
│   │   ├── npc/
│   │   ├── quest/
│   │   ├── game-clock/
│   │   ├── hijri-calendar/
│   │   ├── prayer-schedule/
│   │   ├── islamic-events/
│   │   ├── learning/
│   │   └── multiplayer/
│   ├── data/
│   │   ├── items/
│   │   ├── crops/
│   │   ├── npcs/
│   │   ├── quests/
│   │   └── islamic-content/
│   ├── stores/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── server/                 # Ditambahkan pada fase multiplayer
├── docs/
└── QINARAYA_MASTER_GDD.md
```

# 11. SPESIFIKASI SISTEM

## 11.1 Game Clock

Game Clock mengelola: - Hari. - Bulan. - Tahun. - Jam. - Menit. -
Multiplier waktu. - Status pause.

Contoh kontrak:

``` ts
export interface GameClockState {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  speedMultiplier: number;
  isPaused: boolean;
}
```

Sediakan fungsi terpisah untuk: - Memajukan waktu. - Mengubah hari. -
Mengubah bulan. - Mengubah tahun. - Menghitung waktu berikutnya. -
Subscribe sistem lain terhadap perubahan waktu.

Jangan membuat timer terpisah di setiap modul. Pada multiplayer, server
menjadi sumber waktu otoritatif.

## 11.2 Hijri Calendar Engine

Contoh kontrak:

``` ts
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

export interface HijriCalendarConfig {
  daysPerMonth: number;
  startingDate: HijriDate;
}
```

Untuk prototype, gunakan 30 hari per bulan. Buat konfigurasi agar durasi
dapat diubah tanpa mengubah banyak file.

## 11.3 Prayer Schedule Engine

``` ts
export type PrayerName =
  | "subuh"
  | "dzuhur"
  | "ashar"
  | "maghrib"
  | "isya";

export interface PrayerScheduleEntry {
  prayer: PrayerName;
  hour: number;
  minute: number;
  enabled: boolean;
  notificationEnabled: boolean;
}
```

Sediakan: - Konfigurasi jadwal. - Fungsi mencari waktu salat
berikutnya. - Event ketika waktu salat tiba. - UI notifikasi. -
Preferensi suara/notifikasi. - Penanganan pergantian hari.

Jadwal adalah waktu simulasi yang ditentukan game designer, bukan hasil
perhitungan lokasi dunia nyata.

## 11.4 Islamic Event Engine

``` ts
export interface IslamicEvent {
  id: string;
  name: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
  questIds: string[];
  decorationIds: string[];
  enabled: boolean;
}
```

Event awal: - Tahun Baru Hijriah. - Konten sirah pada Rabiulawal. -
Ramadan. - Nuzulul Quran. - Idulfitri. - Iduladha.

Event engine harus idempotent: perubahan waktu atau reload tidak boleh
memberikan reward event berulang kali.

## 11.5 Learning & Quest Engine

``` ts
export interface LearningContent {
  id: string;
  title: string;
  category: string;
  description: string;
  npcId?: string;
  questId?: string;
  ageLevel: "early" | "middle" | "family";
  reviewStatus: "draft" | "needs-review" | "approved";
}
```

Konten agama berstatus draft sampai ditinjau. Jangan menampilkan materi
berstatus draft atau needs-review kepada pemain pada build produksi.

## 11.6 Save System

Untuk fase awal, gunakan penyimpanan lokal yang sederhana. Simpan: -
Profil karakter. - Posisi pemain yang aman. - Inventory. - Progress
quest. - Data kebun. - Waktu dunia. - Kalender simulasi. - Konfigurasi
dunia.

Gunakan versi schema agar data save dapat dimigrasikan ketika struktur
berubah. Jangan menyimpan secret atau credential di client.

# 12. DATABASE --- TAHAP LANJUTAN

Tabel potensial: - users - player_profiles - worlds - world_members -
game_clock - world_settings - hijri_calendar - prayer_schedules -
islamic_events - learning_contents - quests - quest_progress - items -
inventory - crops - farm_plots - animals - npc - npc_relationships -
player_homes

Tidak perlu membuat seluruh tabel ini pada fase prototype. Tambahkan
hanya ketika kebutuhan fase benar-benar memerlukannya.

# 13. ROADMAP DAN DEFINITION OF DONE

## Phase 0 --- Foundation

-   Audit project.
-   Setup React, TypeScript, Vite.
-   Setup React Three Fiber, Drei, Zustand.
-   Struktur folder.
-   Halaman game dan scene 3D dasar.

**Selesai jika:** project berjalan, scene tampil, struktur jelas, tidak
ada error kritis.

## Phase 1 --- Third-person village prototype

-   Karakter placeholder.
-   Pergerakan keyboard.
-   Kamera third-person.
-   Ground dan terrain sederhana.
-   Bangunan dan pohon placeholder.
-   Collision dasar.
-   Kontrol mobile awal.

**Selesai jika:** pemain dapat menjelajahi desa dengan kontrol yang
stabil pada desktop dan mobile.

## Phase 2 --- Life simulation core

-   Interaksi objek.
-   Inventory.
-   Farming loop.
-   Item dan tanaman data-driven.
-   NPC dasar dan dialog.
-   Game Clock.

**Selesai jika:** pemain dapat menanam, merawat, memanen, menyimpan
item, dan berinteraksi dengan NPC.

## Phase 3 --- Islamic lifestyle system

-   Kalender Hijriah simulasi.
-   Jadwal lima waktu salat simulasi.
-   Notifikasi lembut.
-   Masjid dan musala sebagai lokasi.
-   Aktivitas edukasi wudu dan salat.
-   Learning content dan quest Islami.

**Selesai jika:** sistem memakai satu Game Clock, kalender berjalan
benar, materi dapat diakses lewat gameplay, dan tidak ada penalti
ibadah.

## Phase 4 --- Seasonal events

-   Ramadan.
-   Takjil dan berbagi.
-   Idulfitri.
-   Iduladha.
-   Dekorasi event.
-   Quest event.

**Selesai jika:** event aktif sesuai tanggal simulasi, reward tidak
berulang, dan event dapat diuji dengan mengatur tanggal debug.

## Phase 5 --- Gameplay expansion

-   Fishing.
-   Cooking.
-   Crafting.
-   Animal care dasar.
-   Ekonomi sederhana.
-   Rumah dan dekorasi.
-   Area eksplorasi tambahan.

**Selesai jika:** fitur tambahan tidak merusak save, performa, dan
sistem inti.

## Phase 6 --- Multiplayer

-   Server Colyseus.
-   Private room.
-   Maksimal empat pemain.
-   Sinkronisasi karakter.
-   Sinkronisasi waktu, kalender, event, dan interaksi.
-   Host/guest permissions.

**Selesai jika:** beberapa pemain dapat bergabung dan melihat state
dunia yang konsisten. Uji reconnect dan konflik state.

## Phase 7 --- Persistence, security, optimization

-   Backend dan database.
-   Autentikasi bila diperlukan.
-   Save/load server.
-   Validasi data server.
-   Pengamanan room.
-   Optimasi aset dan performa.
-   Pengujian keluarga.
-   Deployment.

**Selesai jika:** progres dapat dipulihkan, akses dunia aman, dan game
stabil pada perangkat target.

# 14. MVP DAN FITUR YANG DITUNDA

## MVP wajib

1.  Satu area Qinaraya Village.
2.  Karakter third-person.
3.  Kontrol desktop dan mobile.
4.  Rumah, jalan, pohon, dan masjid.
5.  Interaksi objek.
6.  Farming sederhana.
7.  Inventory.
8.  NPC dan dialog.
9.  Game Clock.
10. Kalender Hijriah simulasi.
11. Jadwal salat simulasi.
12. Beberapa quest Islami.
13. Save/load lokal.

## Ditunda

-   Multiplayer online.
-   Dunia terbuka besar.
-   Semua wilayah.
-   Peternakan kompleks.
-   Ekonomi multiplayer.
-   Crafting kompleks.
-   Marketplace.
-   Public server dan public chat.
-   Monetisasi.

# 15. QUALITY GATES

Sebelum fase dinyatakan selesai: - Jalankan build dan type-check. -
Jalankan lint/test jika tersedia. - Uji fitur secara manual. - Periksa
console browser. - Periksa tampilan mobile. - Pastikan fitur fase
sebelumnya tidak rusak. - Periksa tidak ada dependency atau file yang
tidak diperlukan. - Perbarui dokumentasi. - Buat ringkasan perubahan dan
langkah uji.

Jangan menyatakan fase selesai jika aplikasi belum dijalankan atau
kriteria belum diverifikasi. Jelaskan secara jujur jika ada hal yang
belum dapat diuji.

------------------------------------------------------------------------

# BAGIAN B --- PROMPT IMPLEMENTASI UNTUK CLAUDE

## Instruksi umum untuk semua fase

Salin instruksi berikut bersama prompt fase yang sedang dikerjakan:

> Anda adalah Senior Game Developer dan Technical Lead untuk project
> Dunia Qinaraya. Baca `QINARAYA_MASTER_GDD.md` terlebih dahulu dan
> patuhi keputusan desain di dalamnya.
>
> Sebelum coding: 1. Audit struktur repository dan package yang sudah
> ada. 2. Identifikasi implementasi yang sudah tersedia. 3. Jelaskan
> rencana singkat dan file yang akan dibuat/diubah. 4. Jangan menimpa
> pekerjaan yang sudah benar.
>
> Saat coding: 1. Kerjakan hanya ruang lingkup fase yang diminta. 2.
> Gunakan TypeScript dengan tipe yang jelas. 3. Pisahkan logic dari UI
> dan rendering. 4. Hindari file monolitik. 5. Jangan menambahkan
> backend atau dependency yang belum dibutuhkan. 6. Jangan menggunakan
> asset berlisensi tidak jelas. 7. Pertahankan fitur fase sebelumnya. 8.
> Jika ada keputusan penting yang belum jelas, tanyakan satu pertanyaan
> sebelum membuat asumsi besar.
>
> Setelah coding: 1. Jalankan build, type-check, dan test/lint yang
> tersedia. 2. Perbaiki error yang disebabkan perubahan Anda. 3. Berikan
> daftar file yang berubah. 4. Berikan cara menjalankan dan menguji
> fitur. 5. Cocokkan hasil dengan acceptance criteria. 6. Sebutkan
> keterbatasan yang belum terselesaikan. 7. Perbarui dokumentasi teknis
> bila struktur atau perilaku berubah.
>
> Jangan lanjut ke fase berikutnya tanpa instruksi pengguna.

------------------------------------------------------------------------

## PROMPT PHASE 0 --- PROJECT FOUNDATION

``` text
Laksanakan Phase 0 — Foundation berdasarkan QINARAYA_MASTER_GDD.md.

Tujuan:
Membuat fondasi project game 3D yang bersih, modular, dan dapat dijalankan.

Teknologi:
- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS

Tugas:
1. Audit repository dan pertahankan konfigurasi yang masih valid.
2. Siapkan atau rapikan konfigurasi project.
3. Buat struktur folder sesuai GDD, tanpa membuat file kosong berlebihan.
4. Buat entry point aplikasi dan halaman game.
5. Integrasikan React Three Fiber dan Drei.
6. Buat scene 3D sederhana dengan ground, kamera, ambient light, dan directional light.
7. Buat komponen loading/error sederhana untuk scene.
8. Siapkan Zustand store minimal hanya jika memang diperlukan.
9. Buat README berisi instalasi dan perintah menjalankan project.

Batasan:
- Jangan membuat gameplay.
- Jangan membuat backend/database.
- Jangan membuat multiplayer.
- Jangan membuat asset final.
- Gunakan placeholder sederhana.

Acceptance criteria:
- Dependency terpasang dengan benar.
- Project dapat dijalankan.
- Scene 3D tampil.
- Build dan TypeScript check berhasil.
- Struktur folder mudah dipahami.

Selesaikan hanya Phase 0. Laporkan hasil dan tunggu instruksi.
```

## PROMPT PHASE 1 --- THIRD-PERSON VILLAGE PROTOTYPE

``` text
Laksanakan Phase 1 — Third-person village prototype berdasarkan GDD.

Tujuan:
Pemain dapat mengendalikan karakter third-person dan menjelajahi prototype Qinaraya Village.

Tugas:
1. Buat karakter placeholder 3D dengan proporsi stylized.
2. Implementasikan gerakan keyboard: WASD atau arrow keys.
3. Gerakan harus relatif terhadap arah kamera.
4. Implementasikan kamera third-person yang mengikuti karakter.
5. Tambahkan rotasi karakter mengikuti arah gerakan.
6. Buat ground, jalan, rumput, pohon, rumah, dan bangunan placeholder.
7. Tambahkan collision sederhana agar karakter tidak menembus bangunan atau jatuh dari area.
8. Buat batas area permainan.
9. Buat kontrol mobile awal: virtual joystick dan tombol yang diperlukan.
10. Tambahkan pengaturan sensitivitas kamera jika memungkinkan.
11. Pastikan UI tidak menutupi area permainan secara berlebihan.

Desain:
- Cozy fantasy.
- Warna natural.
- Pencahayaan tidak terlalu terang.
- Kontras objek cukup.
- Mobile-first.

Batasan:
- Belum perlu farming, inventory, NPC kompleks, backend, atau multiplayer.
- Jangan membuat seluruh dunia Qinaraya.
- Gunakan placeholder yang ringan.

Acceptance criteria:
- Karakter dapat bergerak lancar.
- Kamera mengikuti karakter dengan baik.
- Gerakan relatif terhadap kamera.
- Collision dasar berfungsi.
- Kontrol mobile dapat digunakan.
- Tidak ada error kritis.
- Performa wajar pada perangkat menengah.

Selesaikan hanya Phase 1 dan jangan melanjutkan ke Phase 2.
```

## PROMPT PHASE 2 --- LIFE SIMULATION CORE

``` text
Laksanakan Phase 2 — Life Simulation Core berdasarkan GDD.

Prasyarat:
Phase 0 dan Phase 1 sudah berjalan. Audit implementasi sebelum mengubah kode.

Tujuan:
Menambahkan loop kehidupan dasar: interaksi, inventory, farming, NPC, dan Game Clock.

Tugas:
1. Buat sistem interaksi objek dengan tombol/action prompt.
2. Buat inventory sederhana dengan item ID, nama, ikon placeholder, kategori, dan jumlah.
3. Buat data item terpisah dari UI.
4. Buat farming plot dengan state: empty, tilled, planted, growing, harvestable.
5. Buat beberapa tanaman awal: wortel, tomat, kentang.
6. Implementasikan aksi mengolah tanah, menanam, menyiram, dan memanen.
7. Pertumbuhan tanaman mengikuti Game Clock, bukan timer independen per tanaman.
8. Buat satu atau dua NPC dengan dialog sederhana.
9. Buat quest sederhana untuk tutorial pertanian.
10. Implementasikan Game Clock terpusat dengan konfigurasi kecepatan waktu.
11. Siapkan event/time subscription agar modul lain dapat mendengarkan perubahan waktu.
12. Tambahkan save/load lokal untuk state dasar jika ruang lingkup dan arsitektur memungkinkan; jika terlalu besar, buat fondasi dan laporkan.

Ketentuan:
- Jangan membuat tanaman mati karena pemain offline.
- Jangan membuat sistem ekonomi kompleks.
- Jangan membuat backend atau multiplayer.
- Jangan membuat sistem Islami penuh pada fase ini; hanya siapkan integrasi dengan Game Clock.

Acceptance criteria:
- Pemain dapat berinteraksi dengan objek.
- Item dapat masuk dan keluar inventory sesuai aksi.
- Farming loop dapat diselesaikan.
- Tanaman tumbuh berdasarkan waktu game.
- NPC dapat diajak bicara.
- Game Clock berjalan dan dapat diuji.
- Build/type-check berhasil.

Selesaikan hanya Phase 2.
```

## PROMPT PHASE 3 --- ISLAMIC LIFESTYLE SYSTEM

``` text
Laksanakan Phase 3 — Islamic Lifestyle System berdasarkan bagian 5 dan 11 dari QINARAYA_MASTER_GDD.md.

Keputusan desain wajib:
- Waktu salat memakai jadwal simulasi dalam game.
- Kalender memakai kalender Hijriah simulasi dalam game.
- Pembelajaran Islam terintegrasi ke gameplay, NPC, dan quest.
- Game Clock adalah satu-satunya sumber waktu.
- Tidak memakai GPS atau API jadwal salat dunia nyata.

Tujuan:
Membangun kalender Hijriah simulasi, jadwal lima waktu salat, notifikasi, dan pembelajaran Islam dasar.

Tugas:
1. Audit Game Clock dan gunakan sebagai sumber waktu utama.
2. Buat Hijri Calendar Engine dengan 12 bulan.
3. Gunakan konfigurasi 30 hari per bulan untuk prototype.
4. Buat konfigurasi tanggal awal dan kecepatan kalender.
5. Buat Prayer Schedule Engine untuk Subuh, Dzuhur, Ashar, Magrib, dan Isya.
6. Jadwal salat harus dapat diubah dari konfigurasi, bukan hardcoded di banyak komponen.
7. Buat fungsi untuk menentukan waktu salat berikutnya.
8. Buat event ketika jadwal salat tiba.
9. Buat notifikasi UI yang lembut dan dapat diatur.
10. Buat HUD yang menampilkan jam game, tanggal Hijriah simulasi, dan waktu salat berikutnya.
11. Buat lokasi Masjid Qinaraya dan Musala sebagai titik interaksi.
12. Buat interaksi edukasi dasar tentang wudu, masjid, waktu salat, dan adab.
13. Buat NPC Ustadz Harun sebagai pemberi materi dan quest.
14. Buat minimal tiga quest pembelajaran yang terintegrasi dengan aktivitas game.
15. Buat data konten terpisah dengan status review: draft, needs-review, approved.
16. Konten yang belum approved tidak boleh muncul pada build produksi.
17. Tambahkan debug panel khusus development untuk mengubah waktu/tanggal simulasi agar event mudah diuji.

Batasan agama dan etika:
- Tidak ada penalti jika pemain tidak mengikuti aktivitas salat.
- Tidak ada pengurangan coin, kehilangan item, tanaman mati, atau penurunan level.
- Tidak ada skor pahala, kesalehan, atau tingkat keimanan.
- Jangan mengklaim aktivitas game menggantikan ibadah nyata.
- Jangan mengarang ayat atau hadis.
- Materi detail ibadah harus ditandai untuk review ahli sebelum rilis.
- Kalender adalah simulasi fiktif, bukan penetapan tanggal keagamaan dunia nyata.

Acceptance criteria:
- Kalender berubah sesuai Game Clock.
- Lima waktu salat tampil sesuai konfigurasi.
- Waktu salat berikutnya dihitung dengan benar termasuk pergantian hari.
- Notifikasi hanya muncul pada waktu yang tepat dan tidak berulang setiap frame.
- Semua sistem membaca sumber waktu yang sama.
- Quest edukasi dapat dimainkan.
- Tidak ada penalti ibadah.
- Build dan type-check berhasil.

Selesaikan hanya Phase 3.
```

## PROMPT PHASE 4 --- RAMADAN, IDULFITRI, IDULADHA

``` text
Laksanakan Phase 4 — Seasonal Islamic Events berdasarkan GDD.

Prasyarat:
Hijri Calendar Engine dan Islamic Lifestyle System sudah berjalan.

Tujuan:
Membuat event Ramadan, Idulfitri, dan Iduladha berbasis kalender Hijriah simulasi.

Tugas:
1. Buat Islamic Event Engine berbasis tanggal Hijriah simulasi.
2. Pastikan event hanya aktif pada rentang tanggal yang dikonfigurasi.
3. Buat event Ramadan dengan dekorasi, aktivitas memasak, takjil, berbagi, dan quest.
4. Buat event Nuzulul Quran sebagai konten edukasi yang telah ditinjau.
5. Buat event Idulfitri dengan dekorasi, kunjungan NPC, silaturahmi, berbagi makanan, dan hadiah virtual.
6. Buat event Iduladha dengan materi kisah Nabi Ibrahim AS, persiapan makanan, dan distribusi makanan.
7. Gunakan representasi kurban yang simbolis dan tidak grafis.
8. Buat quest event yang terhubung dengan Quest System.
9. Buat reward kosmetik/dekorasi/collectible.
10. Pastikan reward event tidak dapat diklaim berulang karena reload atau perubahan scene.
11. Tambahkan debug tools untuk menguji tanggal event.
12. Pastikan event tidak mengubah progres pemain secara merugikan ketika pemain tidak login.

Batasan:
- Puasa dalam game bersifat opsional dan edukatif.
- Tidak ada kewajiban menyelesaikan puasa penuh.
- Tidak ada penalti jika pemain tidak mengikuti event.
- Tidak ada klaim bahwa kalender simulasi menentukan hari raya dunia nyata.
- Jangan mengarang kutipan agama.

Acceptance criteria:
- Event aktif pada tanggal yang benar.
- Dekorasi dan quest event tampil.
- Reward tidak duplikat.
- Event dapat diuji melalui debug date.
- Event tidak merusak save data.
- Build/type-check berhasil.

Selesaikan hanya Phase 4.
```

## PROMPT PHASE 5 --- GAMEPLAY EXPANSION

``` text
Laksanakan Phase 5 — Gameplay Expansion berdasarkan GDD.

Tujuan:
Memperluas gameplay setelah core loop dan sistem Islami stabil.

Sebelum coding, audit performa dan struktur sistem yang sudah ada. Usulkan urutan implementasi kecil di dalam fase ini. Kerjakan dengan urutan yang aman.

Ruang lingkup:
1. Fishing sederhana.
2. Cooking sederhana.
3. Crafting dasar.
4. Animal care untuk satu atau dua jenis hewan.
5. Ekonomi sederhana dengan Qina Coin.
6. Rumah pemain dan dekorasi dasar.
7. Friendship/relationship point dengan NPC.
8. Area eksplorasi kecil di luar pusat desa.

Ketentuan:
- Item dan resep berbasis data.
- Jangan menaruh semua logika dalam satu komponen.
- UI konsisten dan mobile-friendly.
- Tidak ada mekanik monetisasi.
- Tidak ada hubungan antara Qina Coin dengan pahala atau nilai ibadah.
- Jangan membuat seluruh wilayah sekaligus.
- Jaga kompatibilitas save data.

Acceptance criteria:
- Setiap fitur memiliki loop yang dapat dimainkan.
- Data item/resep dapat diperluas.
- Save/load tetap berjalan.
- Tidak ada regresi pada farming, quest, Game Clock, atau sistem Islami.
- Build/type-check berhasil.

Selesaikan ruang lingkup fase ini secara bertahap dan laporkan fitur yang belum selesai.
```

## PROMPT PHASE 6 --- PRIVATE CO-OP MULTIPLAYER

``` text
Laksanakan Phase 6 — Multiplayer berdasarkan GDD.

Penting:
Jangan mulai coding sebelum melakukan audit menyeluruh terhadap arsitektur single-player, Game Clock, save system, quest, inventory, dan event.

Tujuan:
Menambahkan private co-op multiplayer maksimal empat pemain.

Teknologi target:
- Node.js
- Colyseus
- Server authoritative untuk state dunia
- Database belum wajib pada tahap prototipe multiplayer jika persistence lokal/server sederhana cukup.

Tugas:
1. Buat server multiplayer terpisah dari frontend.
2. Implementasikan private room.
3. Satu host/pemilik dunia dan maksimal tiga guest.
4. Sinkronisasi posisi dan rotasi karakter.
5. Sinkronisasi interaksi objek.
6. Sinkronisasi Game Clock dari server.
7. Kalender Hijriah, jadwal salat, dan event harus konsisten untuk semua pemain.
8. Buat hak akses host dan guest.
9. Cegah client mengirim perubahan state yang tidak diizinkan.
10. Buat mekanisme reconnect dasar.
11. Tambahkan indikator pemain yang sedang online.
12. Gunakan preset emote, bukan public chat.
13. Pastikan guest tidak dapat merusak atau menghapus dunia host.
14. Buat dokumentasi menjalankan client dan server.

Batasan:
- Tidak ada public matchmaking.
- Tidak ada public chat.
- Tidak ada PvP.
- Tidak ada transaksi uang nyata.
- Jangan menganggap client sebagai sumber kebenaran state dunia.
- Jangan memindahkan semua fitur ke multiplayer sekaligus jika berisiko; buat vertical slice terlebih dahulu.

Acceptance criteria:
- Dua sampai empat pemain dapat masuk ke private room.
- Posisi karakter tersinkronisasi.
- Waktu dan event konsisten.
- Hak akses guest berfungsi.
- Reconnect tidak merusak state.
- Server memvalidasi perubahan penting.
- Build client dan server berhasil.

Selesaikan hanya Phase 6.
```

## PROMPT PHASE 7 --- PERSISTENCE, SECURITY, OPTIMIZATION & RELEASE

``` text
Laksanakan Phase 7 — Persistence, Security, Optimization & Release berdasarkan GDD.

Tujuan:
Menyiapkan Qinaraya agar lebih stabil untuk dimainkan keluarga pada perangkat target.

Tugas:
1. Audit seluruh alur data dan penyimpanan.
2. Implementasikan database hanya sesuai kebutuhan nyata.
3. Siapkan autentikasi jika diperlukan untuk akun dan private world.
4. Simpan profil, dunia, inventory, quest, kebun, kalender, dan event secara konsisten.
5. Terapkan versioning dan migrasi save schema.
6. Validasi input dan state penting di server.
7. Amankan private room dan izin host/guest.
8. Jangan menaruh secret/API key di frontend.
9. Optimalkan ukuran asset 3D, texture, model, dan audio.
10. Optimalkan render loop dan jumlah objek.
11. Uji performa pada desktop dan mobile.
12. Uji tampilan pada layar kecil.
13. Buat error handling dan logging yang tidak membocorkan data sensitif.
14. Buat panduan deployment frontend dan server.
15. Buat checklist backup dan pemulihan data.
16. Lakukan regression test seluruh fitur.

Acceptance criteria:
- Save/load dapat dipulihkan.
- Tidak ada credential rahasia di client.
- Akses private room tervalidasi.
- Game dapat dijalankan pada target perangkat yang ditentukan.
- UI mobile dapat digunakan.
- Tidak ada bug blocker yang diketahui.
- Dokumentasi deployment tersedia.

Jangan menyatakan siap rilis jika pengujian belum dilakukan. Buat daftar risiko dan pekerjaan tersisa secara jujur.
```

------------------------------------------------------------------------

# BAGIAN C --- PROMPT PEMELIHARAAN DAN DEBUG

## Prompt bug fixing

``` text
Saya menemukan bug pada Dunia Qinaraya.

Sebelum mengubah kode:
1. Reproduksi atau telusuri penyebab bug.
2. Periksa file terkait dan dependensinya.
3. Jelaskan root cause secara singkat.
4. Jangan melakukan refactor luas jika tidak diperlukan.

Setelah itu:
1. Perbaiki penyebab utama.
2. Tambahkan test atau langkah verifikasi jika memungkinkan.
3. Pastikan fitur lain tidak rusak.
4. Jalankan build/type-check/test yang tersedia.
5. Laporkan file yang diubah dan cara menguji perbaikannya.

Bug:
[TULISKAN BUG DI SINI]
```

## Prompt audit sebelum pindah fase

``` text
Lakukan audit project Dunia Qinaraya terhadap fase yang baru selesai.

Periksa:
- Kesesuaian implementasi dengan QINARAYA_MASTER_GDD.md.
- Build dan TypeScript errors.
- Console errors.
- Struktur folder dan kualitas modularitas.
- Performa dasar.
- Responsivitas mobile.
- Regression pada fitur sebelumnya.
- Acceptance criteria fase.

Jangan menambahkan fitur baru.

Berikan laporan:
1. Kriteria yang lulus.
2. Kriteria yang belum lulus.
3. Bug yang ditemukan.
4. Risiko teknis.
5. Perbaikan yang wajib dilakukan sebelum lanjut.

Jangan menyatakan fase lulus jika ada kriteria wajib yang belum diverifikasi.
```

## Prompt update dokumentasi

``` text
Perbarui dokumentasi teknis Dunia Qinaraya berdasarkan implementasi repository saat ini.

Baca QINARAYA_MASTER_GDD.md dan bandingkan dengan kode aktual.

Jangan mengubah keputusan desain GDD secara sepihak.

Buat atau perbarui:
- docs/TECHNICAL_ARCHITECTURE.md
- docs/IMPLEMENTATION_STATUS.md
- README.md

Catat:
- Modul yang sudah dibuat.
- Cara kerja sistem.
- File penting.
- Cara menjalankan project.
- Environment variables yang dibutuhkan (tanpa menuliskan secret).
- Fitur yang belum selesai.
- Known issues.

Pastikan dokumentasi sesuai kode aktual, bukan rencana yang belum diimplementasikan.
```

------------------------------------------------------------------------

# BAGIAN D --- CHECKLIST PENGEMBANGAN

Gunakan checklist ini untuk melacak progres. Tandai hanya setelah
benar-benar diuji.

## Phase 0 --- Foundation

-   [ ] Repository diaudit
-   [ ] React + TypeScript + Vite berjalan
-   [ ] React Three Fiber terpasang
-   [ ] Scene 3D tampil
-   [ ] Build berhasil
-   [ ] README tersedia

## Phase 1 --- 3D Prototype

-   [ ] Karakter placeholder
-   [ ] Gerakan keyboard
-   [ ] Kamera third-person
-   [ ] Collision dasar
-   [ ] Village blockout
-   [ ] Kontrol mobile
-   [ ] Pengujian layar kecil

## Phase 2 --- Life Simulation

-   [ ] Interaksi objek
-   [ ] Inventory
-   [ ] Farming
-   [ ] NPC dialog
-   [ ] Game Clock
-   [ ] Save/load dasar

## Phase 3 --- Islamic Lifestyle

-   [ ] Kalender Hijriah simulasi
-   [ ] Lima waktu salat simulasi
-   [ ] Notifikasi
-   [ ] Masjid dan musala
-   [ ] Konten edukasi
-   [ ] Quest Islami
-   [ ] Review konten
-   [ ] Tidak ada penalti ibadah

## Phase 4 --- Seasonal Events

-   [ ] Ramadan
-   [ ] Nuzulul Quran
-   [ ] Idulfitri
-   [ ] Iduladha
-   [ ] Reward anti-duplikasi
-   [ ] Debug tanggal event

## Phase 5 --- Expansion

-   [ ] Fishing
-   [ ] Cooking
-   [ ] Crafting
-   [ ] Animal care
-   [ ] Economy
-   [ ] Home decoration
-   [ ] Exploration expansion

## Phase 6 --- Multiplayer

-   [ ] Colyseus server
-   [ ] Private room
-   [ ] Host/guest permission
-   [ ] Character sync
-   [ ] Game Clock sync
-   [ ] Calendar/event sync
-   [ ] Reconnect

## Phase 7 --- Release readiness

-   [ ] Persistence
-   [ ] Security review
-   [ ] Performance optimization
-   [ ] Mobile testing
-   [ ] Backup/restore
-   [ ] Deployment documentation
-   [ ] Family playtest

------------------------------------------------------------------------

# CATATAN KEPUTUSAN PROYEK

  Keputusan                                        Status
  ------------------------------------------------ ----------------------------------------
  Nama game Dunia Qinaraya                         Final
  Genre Hybrid Fantasy Life Simulation             Final
  Kamera third-person 3D                           Final
  Multiplayer private co-op, target 4 pemain       Final sebagai target
  Waktu salat simulasi                             Final
  Kalender Hijriah simulasi                        Final
  Pembelajaran Islam terintegrasi gameplay/quest   Final
  Single-player lebih dahulu                       Strategi implementasi
  MVP satu wilayah desa                            Final untuk MVP
  React + TypeScript + React Three Fiber           Rekomendasi teknologi
  Colyseus untuk multiplayer                       Rekomendasi teknologi
  Kalender 30 hari/bulan                           Default prototype
  Satu hari game 24 menit                          Default prototype, dapat diseimbangkan

**Dokumen ini menjadi acuan utama.** Setiap perubahan keputusan harus
dicatat di tabel keputusan dan bagian GDD yang relevan sebelum
implementasi dilakukan.
