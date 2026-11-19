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

### Mengenal Waktu Salat (`prayer-times`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: waktu-salat, tingkat usia: middle
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: WAJIB ditinjau ahli. Periksa penjelasan waktu salat dan penegasan bahwa jadwal game hanyalah simulasi.

1. Umat Islam melaksanakan salat lima waktu: Subuh, Zuhur, Asar, Magrib, dan Isya.
2. Di dunia nyata, waktu salat bergantung pada posisi matahari di tempatmu, jadi jadwalnya berbeda di tiap daerah dan tiap hari.
3. Jam di Qinaraya adalah jadwal simulasi yang dibuat untuk permainan. Untuk waktu salat yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu.
4. Di Qinaraya tidak ada hukuman jika kamu sedang sibuk bermain. Pengingat hanya untuk membantumu mengenal waktu.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Mengenal Wudu (`wudu-intro`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: wudu, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Wudhu adalah bersuci menggunakan air pada anggota tubuh tertentu dengan tata cara yang telah ditentukan syariat. Wudhu merupakan salah satu syarat untuk melaksanakan salat.
2. Persiapan sebelum berwudu:
• Gunakan air yang suci dan menyucikan.
• Pastikan tidak ada penghalang air pada anggota wudhu, seperti cat atau bahan kedap air.
• Hilangkan najis yang ada pada tubuh jika ada.
• Menghadap kiblat dan membaca basmalah merupakan amalan yang baik, tetapi bukan rukun wudhu.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Rukun Wudu (`wudu-rukun`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: wudu, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Dalam mazhab Syafi'i, rukun wudhu ada enam:

1. Niat ketika mulai membasuh wajah.
2. Membasuh seluruh wajah.
3. Membasuh kedua tangan sampai siku.
4. Mengusap sebagian kepala.
5. Membasuh kedua kaki sampai mata kaki.
6. Tertib, yaitu melakukan rukun-rukun tersebut secara berurutan.
2. Penting: Berkumur, membersihkan hidung, membasuh anggota tiga kali, mengusap telinga, membaca basmalah, dan membaca doa setelah wudhu termasuk sunah, bukan rukun menurut mazhab Syafi'i.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Hal yang Membatalkan Wudu (`wudu-pembatal`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: wudu, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Menurut mazhab Syafi'i, hal-hal yang membatalkan wudhu antara lain:

• Keluar sesuatu dari qubul atau dubur, selain mani.
• Hilang akal karena tidur, pingsan, mabuk, atau sebab lain, dengan pengecualian tidur dalam posisi duduk yang mantap sesuai ketentuan fikih.
• Bersentuhan kulit antara laki-laki dan perempuan yang bukan mahram dan telah mencapai batas ketentuan fikih, tanpa penghalang.
• Menyentuh kemaluan manusia atau lingkaran dubur dengan bagian dalam telapak tangan atau jari, tanpa penghalang.
2. Untuk kasus khusus, ikuti penjelasan guru agama atau ulama yang tepercaya.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Persiapan Sebelum Salat (`salat-persiapan`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: salat, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Sebelum salat, pastikan:

1. Beragama Islam dan berakal.
2. Suci dari hadas kecil dan besar.
3. Badan, pakaian, serta tempat salat suci dari najis.
4. Menutup aurat.
5. Telah masuk waktu salat.
6. Menghadap kiblat.
7. Mengetahui salat yang akan dikerjakan dan menghadirkan niat di dalam hati.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Salat Lima Waktu dan Jumlah Rakaat (`salat-rakaat`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: salat, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Subuh: 2 rakaat. Tasyahud akhir pada rakaat kedua
Zuhur: 4 rakaat. Tasyahud awal setelah rakaat kedua
Asar: 4 rakaat. Tasyahud awal setelah rakaat kedua
Magrib: 3 rakaat. Tasyahud awal setelah rakaat kedua
Isya: 4 rakaat. Tasyahud awal setelah rakaat kedua

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Rukun Salat (`salat-rukun`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: salat, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Rukun salat yang umum dirangkum berjumlah 13:

1. Niat.
2. Berdiri bagi yang mampu dalam salat fardu.
3. Takbiratul ihram.
4. Membaca Surah Al-Fatihah.
5. Rukuk dengan tumakninah.
6. Iktidal dengan tumakninah.
7. Sujud dua kali dengan tumakninah.
8. Duduk di antara dua sujud dengan tumakninah.
9. Duduk tasyahud akhir.
10. Membaca tasyahud akhir.
11. Membaca selawat kepada Nabi pada tasyahud akhir.
12. Salam pertama.
13. Tertib, yaitu melaksanakan rukun sesuai urutannya.
2. Tumakninah berarti berhenti sejenak dengan tenang pada gerakan rukuk, iktidal, sujud, dan duduk di antara dua sujud. Jangan melakukan gerakan salat secara terburu-buru.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Sunah dan Hal yang Perlu Diperhatikan (`salat-sunah`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: salat, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. • Doa iftitah adalah sunah, bukan rukun.
• Membaca surah setelah Al-Fatihah pada dua rakaat pertama adalah sunah.
• Bacaan tasbih rukuk dan sujud adalah sunah; bacaan minimal yang sah dalam rukun-rukun tertentu perlu mengikuti ketentuan mazhab.
• Tasyahud awal dan duduk tasyahud awal termasuk sunah ab'ad dalam mazhab Syafi'i.
• Qunut Subuh termasuk sunah ab'ad menurut mazhab Syafi'i.
• Tumakninah merupakan bagian dari rukun salat.
• Orang yang tidak mampu berdiri dapat salat dengan posisi yang mampu dilakukan sesuai ketentuan fikih.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

### Sumber Panduan (`ibadah-sumber`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Kategori: sumber, tingkat usia: family
- Berkas: `src/data/unreviewed/learning.ts`
- Catatan untuk peninjau: Seluruh isi halaman diambil dari panduan sumber (docs/source). Periksa kecocokan dan kelengkapan; tidak ada kalimat karangan.

1. Al-Qur'an
1. QS. Al-Ma'idah [5]: 6 — Perintah wudhu dan anggota tubuh yang dibasuh atau diusap.
- https://quran.com/5/6
2. QS. Al-Baqarah [2]: 43 — Perintah mendirikan salat.
- https://quran.com/2/43
3. QS. Al-Mu'minun [23]: 1–2 — Ciri orang beriman yang khusyuk dalam salat.
- https://quran.com/23/1-2
2. Hadis
1. Sahih al-Bukhari No. 631 — Perintah Nabi Muhammad ﷺ: “Salatlah kalian sebagaimana kalian melihat aku salat.”
- https://sunnah.com/bukhari:631
2. Sahih al-Bukhari No. 159 dan Sahih Muslim No. 226 — Riwayat tata cara wudhu Utsman bin Affan r.a. yang memperlihatkan wudhu Nabi ﷺ.
- https://sunnah.com/bukhari:159
- https://sunnah.com/muslim:226
3. Sahih Muslim No. 234 — Keutamaan menyempurnakan wudhu.
- https://sunnah.com/muslim:234
3. Rujukan pembelajaran Indonesia
• Kementerian Agama Republik Indonesia — Buku Fikih Madrasah (materi bersuci dan salat).
• https://cendikia.kemenag.go.id/
• NU Online — Artikel fikih wudhu dan salat berdasarkan mazhab Syafi'i.
• https://islam.nu.or.id/

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

## Panduan wudu dan salat (sumber dari pemilik proyek)

Sumber: `docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md` (SHA-256 aa4dfee8dc48...).
Seluruh kalimat petunjuk, bacaan Arab, transliterasi, dan arti diekstrak otomatis (`npm run guide:import`), tidak diketik ulang.
Test membandingkan setiap baris Arab dengan sumber secara persis. Teks tambahan dari pengembang dibatasi pada judul, label, dan catatan penghubung yang daftarnya ada di `tests/worship-guide.test.ts`.

Berkas data: `src/data/unreviewed/ibadahGuide.ts` (pemetaan), `ibadahGuide.generated.ts` (hasil ekstraksi), `ibadahLearning.ts` (materi baca).

### Langkah wudu dalam game

1. Niat (rukun) - animasi `wudu-niat`
2. Membaca basmalah (sunah) - animasi `wudu-basmalah`
3. Membasuh kedua telapak tangan (sunah) - animasi `wudu-hands`
4. Berkumur-kumur (sunah) - animasi `wudu-mouth`
5. Membersihkan hidung (sunah) - animasi `wudu-nose`
6. Membasuh wajah (rukun) - animasi `wudu-face`
7. Membasuh kedua tangan sampai siku (rukun) - animasi `wudu-arms`
8. Mengusap sebagian kepala (rukun) - animasi `wudu-head`
9. Mengusap kedua telinga (sunah) - animasi `wudu-ears`
10. Membasuh kedua kaki sampai mata kaki (rukun) - animasi `wudu-feet`
11. Membaca doa setelah wudu (sunah) - animasi `wudu-dua`

### Urutan salat dalam game

- Subuh: 2 rakaat, 22 langkah
- Zuhur: 4 rakaat, 37 langkah
- Asar: 4 rakaat, 37 langkah
- Magrib: 3 rakaat, 30 langkah
- Isya: 4 rakaat, 37 langkah

### Keputusan implementasi yang perlu dikonfirmasi peninjau

Hal-hal berikut tidak disebut tegas di panduan sumber, sehingga implementasinya mengambil bentuk paling sederhana atau netral:

1. **Label sunah untuk 'membasuh telapak tangan'.** Panduan tidak memasukkannya ke enam rukun, tetapi juga tidak menyebutnya sunah. Ditampilkan sebagai sunah.
2. **Label sunah untuk taawuz.** Tidak termasuk rukun salat; panduan tidak menyebutnya sunah secara eksplisit.
3. **Bacaan tasyahud awal.** Panduan hanya merinci bacaan tasyahud pada tasyahud akhir. Pada tasyahud awal ditampilkan tasyahud tanpa selawat, disertai catatan bahwa panduan tidak merincinya.
4. **Posisi duduk tasyahud awal.** Panduan tidak menyebutnya. Digambarkan iftirasy (seperti duduk di antara dua sujud).
5. **Posisi tangan setelah iktidal.** Panduan tidak menyebutnya. Digambarkan diturunkan di sisi tubuh.
6. **Salam kedua** diberi label netral (bukan rukun, bukan sunah), karena panduan hanya menyebut salam pertama sebagai rukun.
7. **Niat salat selain Subuh.** Panduan hanya memberi lafal contoh untuk Subuh. Salat lain tidak diberi lafal; ditampilkan catatan bahwa niat di dalam hati yang wajib.
8. **Al-Fatihah dan surah pendek.** Teks Arabnya tidak ada di panduan, jadi tidak ditampilkan; pemain diarahkan ke mushaf atau guru.
9. **Qunut Subuh** tidak dimasukkan karena tidak ada di panduan.
10. **Jari telunjuk saat tasyahud, posisi telapak tangan, dan arah pandangan.** Tidak dirinci panduan; animasi tidak menggambarkannya secara spesifik.
11. **Tawarruk.** Karena kerangka karakter belum punya gerak menyamping pada pinggul, kaki kiri digambarkan terselip ke belakang di bawah paha, bukan melintas di bawah betis kanan.
12. **Qibla.** Di dunia Qinaraya qibla ditetapkan ke arah utara sesuai desain masjid (pintu menghadap selatan). Ini pengaturan dunia fiktif.
13. **Jumlah basuhan.** Animasi mengulang tiga kali sesuai yang disunahkan di panduan; satu kali basuhan merata sudah memenuhi rukun.

### Aktivitas dalam game

#### Berwudu (`wudu-practice`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Lokasi: wudu, ketersediaan: kapan saja
- Catatan untuk peninjau: WAJIB ditinjau ahli. Isi dan urutan 11 langkah berasal dari panduan sumber. Periksa pelabelan rukun dan sunah (langkah 'membasuh telapak tangan' diberi label sunah karena tidak termasuk enam rukun yang disebut panduan, namun panduan tidak menyebutnya sunah secara eksplisit) dan animasi 3D untuk tiap langkah.
- Penutup (tambahan pengembang): Latihan berwudu selesai. Kamu boleh mengulangnya kapan saja.

- [ ] Disetujui  [ ] Perlu revisi  | Peninjau: ____________  Tanggal: ____________
- Catatan peninjau: 

#### Salat (`salat-moment`)

- Status saat ini: **Menunggu tinjauan** (`needs-review`)
- Lokasi: masjid, ketersediaan: salat sesungguhnya hanya saat waktu salat berlangsung; di luar itu tersedia sebagai latihan
- Catatan untuk peninjau: WAJIB ditinjau ahli. Urutan salat 2, 3, dan 4 rakaat berasal dari panduan sumber. Perlu dikonfirmasi: (1) bacaan tasyahud awal (panduan tidak merinci terpisah; ditampilkan tasyahud tanpa selawat), (2) posisi duduk tasyahud awal (iftirasy; panduan tidak menyebutnya), (3) posisi tangan setelah iktidal (diturunkan di sisi tubuh; panduan tidak menyebutnya), (4) label salam kedua (tanpa label rukun atau sunah), (5) teks Al-Fatihah dan surah pendek yang tidak ada di panduan, (6) semua animasi gerakan 3D.
- Penutup (tambahan pengembang): Terima kasih sudah berhenti sejenak. Tidak ada nilai atau hadiah untuk ini, dan tidak apa-apa jika kamu memilih bermain dulu.
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
- Tempat wudu: Tempat bersuci di dekat masjid (materi: wudu-intro, wudu-rukun, wudu-pembatal)

