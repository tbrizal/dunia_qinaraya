# Daftar Konten untuk Peninjauan

Dokumen ini dibuat otomatis oleh `npm run content:review`. Jangan diedit manual; ubah data lalu jalankan ulang.

Semua konten di bawah berstatus **belum ditinjau** dan **tidak tampil di build produksi**.
Konten ditulis tanpa kutipan ayat atau hadis. Kolom persetujuan diisi oleh peninjau yang kompeten, bukan oleh pengembang.

## Cara menyetujui

1. Peninjau membaca setiap materi dan memberi catatan atau koreksi.
2. Pengembang menerapkan koreksi pada berkas data yang disebut di bawah.
3. Setelah disetujui, pindahkan entri dari `src/data/unreviewed/` ke berkas data utama di `src/data/`,
   ubah `reviewStatus` menjadi `approved`, dan isi `reviewedBy` serta `reviewedAt`.
4. Jalankan `npm test` lalu `npm run content:review`. Test menolak status `approved` tanpa peninjau.

## Teks sistem di luar daftar materi (bukan materi agama, tetap mohon diperiksa)

- Panel jam: "Kalender dan jadwal ini adalah simulasi buatan game, bukan penetapan tanggal atau waktu ibadah yang sebenarnya. Untuk waktu salat yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu. Tidak ada hukuman jika kamu tidak mengikuti pengingat." (`src/components/ui/TimePanel.tsx`)
- Pengingat: "Waktu [nama waktu] telah tiba di Qinaraya" dan "Jadwal simulasi. Santai saja, tidak perlu terburu-buru." (`PrayerNotice.tsx`, `persistence.ts`)
- Pengaturan: "Pengingat hanya membantu mengenal waktu. Tidak ada hukuman bila diabaikan." (`SettingsPanel.tsx`)
- Jadwal simulasi lima waktu dan nama bulan Hijriah: `src/config/lifestyleConfig.ts`, `src/systems/calendar/hijriCalendar.ts`. Jam salat adalah keputusan desain game, bukan perhitungan astronomis.

## Materi edukasi

### Mengenal Masjid (`masjid-intro`)

- Status saat ini: **Draf** (`draft`)
- Kategori: masjid, tingkat usia: early
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Periksa kesesuaian istilah dan gambaran umum masjid. Tidak ada kutipan teks agama.

1. Masjid adalah tempat ibadah umat Islam. Di Qinaraya, Masjid Qinaraya juga menjadi tempat warga berkumpul dan saling membantu.
2. Di masjid ada ruang utama untuk beribadah, tempat berwudu, dan menara. Bentuk masjid bisa berbeda-beda di setiap tempat.
3. Karena dipakai bersama, masjid dijaga bersih dan nyaman oleh banyak orang. Kamu juga bisa ikut menjaganya.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Adab di Masjid (`masjid-adab`)

- Status saat ini: **Draf** (`draft`)
- Kategori: adab, tingkat usia: early
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Periksa daftar adab dan kalimat terakhir (doa tidak dikutip, hanya dirujuk ke orang tua atau guru).

1. Adab artinya kebiasaan baik. Saat berada di masjid, kita berusaha bersikap tenang dan sopan.
2. Contoh adab di masjid: datang dalam keadaan bersih, tidak berlari atau berteriak, dan menghormati orang yang sedang beribadah.
3. Alas kaki diletakkan dengan rapi di tempat yang disediakan, dan sampah dibuang ke tempatnya.
4. Doa atau bacaan khusus saat masuk masjid bisa kamu tanyakan kepada orang tua atau gurumu.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Mengenal Musala (`musala-intro`)

- Status saat ini: **Draf** (`draft`)
- Kategori: masjid, tingkat usia: early
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Sengaja tidak membahas perbedaan hukum masjid dan musala. Periksa apakah gambaran umum sudah tepat.

1. Musala adalah tempat salat yang biasanya lebih kecil daripada masjid. Warga bisa memakainya untuk salat bersama atau belajar bersama.
2. Ukuran dan kegunaan musala bisa berbeda-beda. Seperti masjid, musala dijaga agar bersih, tenang, dan nyaman.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Mengenal Wudu (`wudu-intro`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: wudu, tingkat usia: middle
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: WAJIB ditinjau ahli. Periksa kalimat tentang anggota wudu secara umum dan catatan perbedaan rincian antar pendapat ulama. Tidak ada urutan langkah rinci dan tidak ada bacaan.

1. Wudu adalah cara bersuci dengan air sebelum melaksanakan salat.
2. Secara umum, wudu dilakukan dengan membasuh wajah, membasuh kedua tangan, mengusap kepala, dan membasuh kedua kaki.
3. Rincian urutan dan bagian yang dianjurkan bisa sedikit berbeda menurut penjelasan para ulama. Karena itu, belajarlah cara berwudu langsung dari orang tua atau gurumu.
4. Gunakan air secukupnya, tidak berlebihan. Di Qinaraya kamu hanya mengenal wudu lewat cerita singkat; ini bukan pengganti belajar langsung.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Mengenal Waktu Salat (`prayer-times`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: waktu-salat, tingkat usia: middle
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: WAJIB ditinjau ahli. Periksa penjelasan waktu salat dan penegasan bahwa jadwal game hanyalah simulasi.

1. Umat Islam melaksanakan salat lima waktu: Subuh, Dzuhur, Ashar, Magrib, dan Isya.
2. Di dunia nyata, waktu salat bergantung pada posisi matahari di tempatmu, jadi jadwalnya berbeda di tiap daerah dan tiap hari.
3. Jam di Qinaraya adalah jadwal simulasi yang dibuat untuk permainan. Untuk waktu salat yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu.
4. Di Qinaraya tidak ada hukuman jika kamu sedang sibuk bermain. Pengingat hanya untuk membantumu mengenal waktu.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

## Quest pembelajaran

### Berkenalan dengan Masjid (`learn_masjid`)

- Status: **Draf**, berkas: `src/data/unreviewed/quests.ts`
- Ringkasan: Jelajahi masjid dan musala bersama Ustadz Harun, lalu pelajari kebiasaan baik di sana.
- Prasyarat: tidak ada
- Tujuan:
  - Pelajari tentang masjid (di depan masjid) (1x)
  - Pelajari adab di masjid (di depan masjid) (1x)
  - Kunjungi musala di timur laut desa (1x)
- Hadiah (kosmetik): lantern x1

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________

### Bersih dan Bersuci (`learn_wudu`)

- Status: **Draf**, berkas: `src/data/unreviewed/quests.ts`
- Ringkasan: Mengenal wudu, menjaga kebersihan masjid, dan mengenal waktu salat di Qinaraya.
- Prasyarat: learn_masjid
- Tujuan:
  - Pelajari wudu di tempat wudu (1x)
  - Bersihkan halaman masjid (3x)
  - Buka panel jam di kiri atas dan pelajari waktu salat (1x)
- Hadiah (kosmetik): flower_pot x1

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________

### Berbagi Hasil Kebun (`share_harvest`)

- Status: **Draf**, berkas: `src/data/unreviewed/quests.ts`
- Ringkasan: Bagikan sebagian hasil panenmu untuk dapur warga yang dikelola Ustadz Harun.
- Prasyarat: tutorial_farming, learn_masjid
- Tujuan:
  - Bagikan 2 hasil panen untuk dapur warga (2x)
- Hadiah (kosmetik): wooden_bench x1

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________

## Dialog Ustadz Harun

Berkas: `src/data/unreviewed/ustadzDialogue.ts`. Dialog cadangan (non-agama) ada di `src/data/dialogues.ts` dan selalu tampil.

- **unavailable**: Selamat {timeOfDay}. Aku sedang menyiapkan bahan cerita untuk warga. Datanglah lagi nanti ya.
- **intro**: Selamat {timeOfDay}, Nak. Aku Ustadz Harun. Aku senang menemani warga belajar kebiasaan baik di desa ini.
- **offer_a**: Maukah kamu berkenalan dengan masjid dan musala? Kamu bisa berjalan-jalan dan membaca cerita singkat di sana. Tidak ada batas waktu.
  - Pilihan: "Mau, Ustadz"
  - Pilihan: "Nanti saja"
- **started_a**: Terima kasih. Mulailah dari depan masjid ini, lalu kunjungi musala di timur laut desa. Pelan-pelan saja.
- **reminder_a**: Silakan lanjutkan jalan-jalanmu. Cerita tentang masjid ada di depan masjid, dan cerita tentang musala ada di musala. Tidak perlu terburu-buru.
- **turnin_a**: Kamu sudah berkenalan dengan masjid dan musala. Semoga kamu merasa nyaman berada di sana. Ini lentera sebagai kenang-kenangan.
  - Pilihan: "Terima hadiah"
- **done_a**: Datanglah lagi kapan saja kalau ingin belajar hal lain.
- **offer_b**: Selamat {timeOfDay}. Bagaimana kalau sekarang kita belajar tentang kebersihan dan mengenal wudu? Kamu juga bisa membantu membersihkan halaman masjid.
  - Pilihan: "Mau, Ustadz"
  - Pilihan: "Nanti saja"
- **started_b**: Cerita tentang wudu ada di tempat wudu, di sebelah kiri masjid. Halaman masjid bisa dibersihkan dari depan masjid. Cerita tentang waktu salat ada di panel jam di kiri atas layarmu.
- **reminder_b**: Tempat wudu ada di sebelah kiri masjid. Halaman bisa dibersihkan dari depan masjid. Panel jam di kiri atas layar berisi cerita tentang waktu salat.
- **turnin_b**: Terima kasih sudah ikut menjaga kebersihan dan mau belajar. Ini pot bunga untuk menghiasi rumahmu.
  - Pilihan: "Terima hadiah"
- **done_b**: Lingkungan yang bersih membuat semua orang nyaman. Terima kasih ya.
- **need_farm**: Selamat {timeOfDay}. Kalau kebunmu sudah menghasilkan panen, datanglah lagi. Ada kegiatan berbagi untuk dapur warga yang ingin kuajak kamu ikut serta.
- **offer_c**: Kebunmu sudah berbuah. Dapur warga sedang menyiapkan makanan untuk tetangga. Maukah kamu membagikan sebagian hasil panenmu?
  - Pilihan: "Mau, Ustadz"
  - Pilihan: "Nanti saja"
- **share_active**: Hasil panen apa pun boleh. Berbagi tidak harus banyak, yang penting dilakukan dengan senang hati. Siap membagikan 2 hasil panen?
  - Pilihan: "Bagikan 2 hasil panen"
  - Pilihan: "Nanti saja"
- **shared**: Terima kasih banyak! Tetangga kita pasti senang menerimanya. Datanglah lagi untuk menerima hadiah kecil.
- **turnin_c**: Kamu sudah berbagi dengan warga. Semoga kebaikan kecil seperti ini terus tumbuh. Ini bangku kayu untuk halaman rumahmu.
  - Pilihan: "Terima hadiah"
- **done_c**: Terima kasih sudah menjadi tetangga yang baik.
- **all_done**: Selamat {timeOfDay}, Nak. Semua cerita yang kusiapkan sudah kamu jelajahi. Kapan pun ingin mampir ke masjid, pintunya selalu terbuka.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________

## Lokasi

- Masjid Qinaraya: Tempat ibadah dan berkumpul warga (materi: masjid-intro, masjid-adab)
- Musala Qinaraya: Tempat salat yang kecil dan tenang (materi: musala-intro)
- Tempat wudu: Tempat bersuci di dekat masjid (materi: wudu-intro)

