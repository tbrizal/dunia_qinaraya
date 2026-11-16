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

## Aktivitas terpandu (wudu dan salat)

Berkas: `src/data/unreviewed/activities.ts`. Aktivitas ini sengaja hanya berupa teks langkah demi langkah:
**tidak ada animasi gerakan wudu atau salat**, tidak ada skor, hadiah, atau pencatatan, dan tidak ada penalti bila tidak dilakukan.
Peninjau juga diminta memutuskan apakah animasi gerakan boleh dibuat, dan bila ya, memberikan urutan yang disetujui.

### Latihan Berwudu (`wudu-practice`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Lokasi: wudu, ketersediaan: kapan saja
- Catatan untuk peninjau: WAJIB ditinjau ahli. Periksa: anggota dan urutan yang disebut, kalimat tentang niat (sengaja tidak memuat lafaz), catatan perbedaan antar pendapat, dan seluruh teks. Tidak ada bacaan dan tidak ada animasi gerakan.

1. **Bersiap**: Pastikan lenganmu bebas dan siapkan air secukupnya. Gunakan air dengan tidak berlebihan.
2. **Niat**: Berwudu dimulai dengan berniat untuk bersuci. Cara meniatkannya bisa kamu tanyakan kepada orang tua atau gurumu.
3. **Wajah**: Basuh wajahmu dengan air.
4. **Kedua tangan**: Basuh kedua tanganmu sampai siku.
5. **Kepala**: Usap kepalamu dengan tangan yang basah.
6. **Kedua kaki**: Basuh kedua kakimu sampai mata kaki.

- Penutup: Latihan selesai. Urutan dan rincian wudu bisa sedikit berbeda menurut penjelasan para ulama, jadi ikuti cara yang diajarkan orang tua atau gurumu. Ini hanya latihan mengenal, bukan pengganti belajar langsung. Kamu boleh mengulangnya kapan saja.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Waktu Salat (`salat-moment`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Lokasi: masjid, ketersediaan: hanya saat waktu salat sedang berlangsung
- Catatan untuk peninjau: WAJIB ditinjau ahli. Aktivitas ini sengaja hanya berupa jeda terpandu, bukan simulasi tata cara salat. Periksa seluruh teks, terutama langkah 'Melaksanakan', dan putuskan apakah animasi gerakan (jika diinginkan) boleh dibuat serta bagaimana urutannya.

1. **Waktunya tiba**: Waktu {prayer} sedang berlangsung di Qinaraya (jadwal simulasi). Kamu bisa berhenti sejenak dari kesibukanmu.
2. **Bersiap**: Pastikan dirimu dan tempatnya bersih. Jika belum berwudu, tempat wudu ada di sebelah kiri masjid.
3. **Tenang**: Atur napasmu, bersikaplah tenang, dan hadapkan dirimu ke arah salat sesuai yang diajarkan orang tua atau gurumu.
4. **Melaksanakan**: Salat dilakukan di dunia nyata sesuai tata cara yang diajarkan kepadamu. Di dalam game kita hanya berhenti sejenak bersama-sama; permainan tidak menggantikan ibadah yang sebenarnya.
5. **Selesai**: Setelah selesai, rapikan tempatmu dan lanjutkan harimu dengan tenang.

- Penutup: Terima kasih sudah berhenti sejenak. Tidak ada nilai atau hadiah untuk ini, dan tidak apa-apa jika kamu memilih bermain dulu.
- Kalimat pada pengingat waktu salat: Kamu bisa berwudu dan salat di masjid, atau lanjut bermain.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

## Quest pembelajaran

### Berkenalan dengan Masjid (`learn_masjid`)

- Status: **Draf**, berkas: `src/data/unreviewed/quests.ts`
- Ringkasan: Berkenalan dengan Masjid Qinaraya bersama Ustadz Harun, lalu pelajari kebiasaan baik di sana.
- Prasyarat: tidak ada
- Tujuan:
  - Pelajari tentang masjid (di depan masjid) (1x)
  - Pelajari adab di masjid (di depan masjid) (1x)
- Hadiah (kosmetik): lantern x1

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________

### Bersih dan Bersuci (`learn_wudu`)

- Status: **Draf**, berkas: `src/data/unreviewed/quests.ts`
- Ringkasan: Mengenal dan berlatih wudu, menjaga kebersihan masjid, dan mengenal waktu salat di Qinaraya.
- Prasyarat: learn_masjid
- Tujuan:
  - Pelajari wudu di tempat wudu (1x)
  - Berlatih berwudu di tempat wudu (latihan mengenal) (1x)
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
- **offer_a**: Maukah kamu berkenalan dengan masjid? Kamu bisa membaca cerita singkat di depan masjid. Tidak ada batas waktu.
  - Pilihan: "Mau, Ustadz"
  - Pilihan: "Nanti saja"
- **started_a**: Terima kasih. Mulailah dari depan masjid ini. Pelan-pelan saja.
- **reminder_a**: Cerita tentang masjid ada di depan masjid. Tidak perlu terburu-buru.
- **turnin_a**: Kamu sudah berkenalan dengan masjid. Semoga kamu merasa nyaman berada di sana. Ini lentera sebagai kenang-kenangan.
  - Pilihan: "Terima hadiah"
- **done_a**: Datanglah lagi kapan saja kalau ingin belajar hal lain.
- **offer_b**: Selamat {timeOfDay}. Bagaimana kalau sekarang kita belajar tentang kebersihan, mengenal wudu, dan berlatih berwudu? Kamu juga bisa membantu membersihkan halaman masjid.
  - Pilihan: "Mau, Ustadz"
  - Pilihan: "Nanti saja"
- **started_b**: Cerita dan latihan wudu ada di tempat wudu, di sebelah kiri masjid. Halaman masjid bisa dibersihkan dari depan masjid. Cerita tentang waktu salat ada di panel jam di kiri atas layarmu.
- **reminder_b**: Cerita dan latihan wudu ada di tempat wudu, di sebelah kiri masjid. Halaman bisa dibersihkan dari depan masjid. Panel jam di kiri atas layar berisi cerita tentang waktu salat.
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
- Tempat wudu: Tempat bersuci di dekat masjid (materi: wudu-intro)

