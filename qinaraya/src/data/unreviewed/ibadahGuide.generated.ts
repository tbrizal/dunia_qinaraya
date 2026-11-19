import type { GuideSection } from "../worship.ts";

/**
 * DIHASILKAN OTOMATIS oleh scripts/import-ibadah-guide.ts dari docs/source/panduan_wudhu_dan_salat_dunia_qinaraya.md.
 * Jangan diedit manual: ubah sumbernya lalu jalankan `npm run guide:import`.
 * Konten ini BELUM DITINJAU dan tidak ikut build produksi.
 */
export const GUIDE_SOURCE_SHA256 = "aa4dfee8dc489b478cbcf0e3a8c0a5f56465d7f6b1b1839a2ebc7540ad2d12b8";

export const GUIDE_SECTIONS: readonly GuideSection[] = [
  {
    "level": 1,
    "title": "Panduan Wudhu dan Salat",
    "blocks": []
  },
  {
    "level": 2,
    "title": "Materi Ibadah untuk Game Dunia Qinaraya",
    "blocks": [
      {
        "type": "note",
        "text": "Standar materi: Panduan ini menggunakan tuntunan fikih mazhab Syafi'i yang umum dipraktikkan di Indonesia. Perbedaan rincian di antara mazhab dapat ditemukan dalam sejumlah gerakan dan bacaan. Materi ini bersifat edukatif; untuk penetapan hukum pada kasus khusus, rujuk guru agama atau ulama yang tepercaya."
      }
    ]
  },
  {
    "level": 1,
    "title": "1. Tata Cara Wudhu",
    "blocks": []
  },
  {
    "level": 2,
    "title": "1.1 Pengertian dan tujuan",
    "blocks": [
      {
        "type": "text",
        "text": "Wudhu adalah bersuci menggunakan air pada anggota tubuh tertentu dengan tata cara yang telah ditentukan syariat. Wudhu merupakan salah satu syarat untuk melaksanakan salat."
      }
    ]
  },
  {
    "level": 2,
    "title": "1.2 Persiapan",
    "blocks": [
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Gunakan air yang suci dan menyucikan.",
          "Pastikan tidak ada penghalang air pada anggota wudhu, seperti cat atau bahan kedap air.",
          "Hilangkan najis yang ada pada tubuh jika ada.",
          "Menghadap kiblat dan membaca basmalah merupakan amalan yang baik, tetapi bukan rukun wudhu."
        ]
      }
    ]
  },
  {
    "level": 2,
    "title": "1.3 Urutan wudhu",
    "blocks": []
  },
  {
    "level": 3,
    "title": "1. Niat",
    "blocks": [
      {
        "type": "text",
        "text": "Berniat di dalam hati untuk berwudhu agar diperbolehkan melaksanakan ibadah yang mensyaratkan wudhu. Niat dilakukan ketika mulai membasuh wajah."
      },
      {
        "type": "text",
        "text": "Lafal niat yang lazim diajarkan:"
      },
      {
        "type": "recitation",
        "arab": "نَوَيْتُ الْوُضُوْءَ لِرَفْعِ الْحَدَثِ الْأَصْغَرِ فَرْضًا لِلّٰهِ تَعَالَى",
        "translit": "Nawaitul wudhu'a li raf'il hadatsil ashghari fardhan lillaahi ta'aalaa.",
        "arti": "Aku berniat berwudhu untuk menghilangkan hadas kecil, fardu karena Allah Ta'ala."
      },
      {
        "type": "text",
        "text": "Catatan: Yang wajib adalah niat di dalam hati. Melafalkannya bukan syarat sah wudhu."
      }
    ]
  },
  {
    "level": 3,
    "title": "2. Membaca basmalah",
    "blocks": [
      {
        "type": "recitation",
        "arab": "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
        "translit": "Bismillaahir-rahmaanir-rahiim.",
        "arti": "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."
      }
    ]
  },
  {
    "level": 3,
    "title": "3. Membasuh kedua telapak tangan",
    "blocks": [
      {
        "type": "text",
        "text": "Basuh kedua telapak tangan sampai pergelangan tangan sebanyak tiga kali. Dahulukan tangan kanan."
      }
    ]
  },
  {
    "level": 3,
    "title": "4. Berkumur-kumur",
    "blocks": [
      {
        "type": "text",
        "text": "Masukkan air ke mulut, gerakkan untuk berkumur, lalu keluarkan. Disunahkan melakukannya tiga kali."
      }
    ]
  },
  {
    "level": 3,
    "title": "5. Membersihkan hidung",
    "blocks": [
      {
        "type": "text",
        "text": "Masukkan air ke hidung secara perlahan, lalu keluarkan. Disunahkan melakukannya tiga kali. Jangan berlebihan jika sedang berpuasa."
      }
    ]
  },
  {
    "level": 3,
    "title": "6. Membasuh wajah",
    "blocks": [
      {
        "type": "text",
        "text": "Basuh seluruh wajah dari batas tempat tumbuh rambut kepala hingga dagu, dan dari sisi telinga kanan hingga sisi telinga kiri. Disunahkan tiga kali."
      }
    ]
  },
  {
    "level": 3,
    "title": "7. Membasuh kedua tangan sampai siku",
    "blocks": [
      {
        "type": "text",
        "text": "Basuh tangan kanan dari ujung jari sampai siku, kemudian tangan kiri dengan cara yang sama. Siku harus terkena air. Disunahkan masing-masing tiga kali."
      }
    ]
  },
  {
    "level": 3,
    "title": "8. Mengusap sebagian kepala",
    "blocks": [
      {
        "type": "text",
        "text": "Usap sebagian kepala dengan tangan yang basah. Dalam mazhab Syafi'i, mengusap sebagian kecil kepala sudah memenuhi batas minimal rukun."
      }
    ]
  },
  {
    "level": 3,
    "title": "9. Mengusap kedua telinga",
    "blocks": [
      {
        "type": "text",
        "text": "Disunahkan mengusap bagian dalam dan luar kedua telinga dengan air yang digunakan untuk mengusap kepala."
      }
    ]
  },
  {
    "level": 3,
    "title": "10. Membasuh kedua kaki sampai mata kaki",
    "blocks": [
      {
        "type": "text",
        "text": "Basuh kaki kanan kemudian kaki kiri sampai mata kaki. Pastikan air mengenai tumit dan sela-sela jari kaki. Disunahkan masing-masing tiga kali."
      }
    ]
  },
  {
    "level": 3,
    "title": "11. Membaca doa setelah wudhu",
    "blocks": [
      {
        "type": "recitation",
        "arab": "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ",
        "translit": "Asyhadu an laa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna Muhammadan 'abduhu wa rasuuluh.",
        "arti": "Aku bersaksi bahwa tidak ada Tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya."
      },
      {
        "type": "text",
        "text": "Tambahan doa yang diriwayatkan dalam hadis:"
      },
      {
        "type": "recitation",
        "arab": "اللّٰهُمَّ اجْعَلْنِيْ مِنَ التَّوَّابِيْنَ وَاجْعَلْنِيْ مِنَ الْمُتَطَهِّرِيْنَ",
        "translit": "Allaahummaj'alnii minat-tawwaabiina waj'alnii minal-mutathahhiriin.",
        "arti": "Ya Allah, jadikanlah aku termasuk orang-orang yang bertaubat dan jadikanlah aku termasuk orang-orang yang menyucikan diri."
      }
    ]
  },
  {
    "level": 2,
    "title": "1.4 Rukun wudhu",
    "blocks": [
      {
        "type": "text",
        "text": "Dalam mazhab Syafi'i, rukun wudhu ada enam:"
      },
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Niat ketika mulai membasuh wajah.",
          "Membasuh seluruh wajah.",
          "Membasuh kedua tangan sampai siku.",
          "Mengusap sebagian kepala.",
          "Membasuh kedua kaki sampai mata kaki.",
          "Tertib, yaitu melakukan rukun-rukun tersebut secara berurutan."
        ]
      },
      {
        "type": "text",
        "text": "Penting: Berkumur, membersihkan hidung, membasuh anggota tiga kali, mengusap telinga, membaca basmalah, dan membaca doa setelah wudhu termasuk sunah, bukan rukun menurut mazhab Syafi'i."
      }
    ]
  },
  {
    "level": 2,
    "title": "1.5 Hal yang membatalkan wudhu",
    "blocks": [
      {
        "type": "text",
        "text": "Menurut mazhab Syafi'i, hal-hal yang membatalkan wudhu antara lain:"
      },
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Keluar sesuatu dari qubul atau dubur, selain mani.",
          "Hilang akal karena tidur, pingsan, mabuk, atau sebab lain, dengan pengecualian tidur dalam posisi duduk yang mantap sesuai ketentuan fikih.",
          "Bersentuhan kulit antara laki-laki dan perempuan yang bukan mahram dan telah mencapai batas ketentuan fikih, tanpa penghalang.",
          "Menyentuh kemaluan manusia atau lingkaran dubur dengan bagian dalam telapak tangan atau jari, tanpa penghalang."
        ]
      },
      {
        "type": "text",
        "text": "Untuk kasus khusus, ikuti penjelasan guru agama atau ulama yang tepercaya."
      }
    ]
  },
  {
    "level": 1,
    "title": "2. Tata Cara Salat",
    "blocks": []
  },
  {
    "level": 2,
    "title": "2.1 Persiapan sebelum salat",
    "blocks": [
      {
        "type": "text",
        "text": "Sebelum salat, pastikan:"
      },
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Beragama Islam dan berakal.",
          "Suci dari hadas kecil dan besar.",
          "Badan, pakaian, serta tempat salat suci dari najis.",
          "Menutup aurat.",
          "Telah masuk waktu salat.",
          "Menghadap kiblat.",
          "Mengetahui salat yang akan dikerjakan dan menghadirkan niat di dalam hati."
        ]
      }
    ]
  },
  {
    "level": 2,
    "title": "2.2 Urutan salat dua rakaat",
    "blocks": [
      {
        "type": "text",
        "text": "Contoh berikut adalah urutan dasar salat dua rakaat, seperti salat Subuh. Bacaan sunah dapat bervariasi; panduan ini menampilkan bacaan yang umum diajarkan."
      }
    ]
  },
  {
    "level": 3,
    "title": "Rakaat pertama",
    "blocks": []
  },
  {
    "level": 4,
    "title": "1. Berdiri dan niat",
    "blocks": [
      {
        "type": "text",
        "text": "Berdiri tegak menghadap kiblat bagi yang mampu. Niatkan salat tertentu di dalam hati. Contoh niat salat Subuh:"
      },
      {
        "type": "recitation",
        "translit": "Ushallii fardhash-shubhi rak'ataini adaa'an lillaahi ta'aalaa.",
        "arti": "Aku berniat salat fardu Subuh dua rakaat karena Allah Ta'ala."
      },
      {
        "type": "text",
        "text": "Catatan: Niat di dalam hati adalah yang wajib. Pelafalan niat bukan syarat sah salat."
      }
    ]
  },
  {
    "level": 4,
    "title": "2. Takbiratul ihram",
    "blocks": [
      {
        "type": "text",
        "text": "Angkat kedua tangan sejajar bahu atau telinga, lalu ucapkan:"
      },
      {
        "type": "recitation",
        "arab": "اللّٰهُ أَكْبَرُ",
        "translit": "Allaahu akbar.",
        "arti": "Allah Maha Besar."
      },
      {
        "type": "text",
        "text": "Setelah takbir, letakkan tangan kanan di atas tangan kiri ketika berdiri. Posisi tangan memiliki variasi dalam praktik fikih."
      }
    ]
  },
  {
    "level": 4,
    "title": "3. Doa iftitah (sunah)",
    "blocks": [
      {
        "type": "text",
        "text": "Salah satu doa iftitah yang dikenal:"
      },
      {
        "type": "recitation",
        "arab": "اللّٰهُ أَكْبَرُ كَبِيْرًا، وَالْحَمْدُ لِلّٰهِ كَثِيْرًا، وَسُبْحَانَ اللّٰهِ بُكْرَةً وَأَصِيْلًا",
        "translit": "Allaahu akbaru kabiiraa, walhamdu lillaahi katsiiraa, wa subhaanallaahi bukratan wa ashiilaa.",
        "arti": "Allah Maha Besar dengan sebesar-besarnya. Segala puji bagi Allah dengan pujian yang banyak. Maha Suci Allah pada waktu pagi dan petang."
      },
      {
        "type": "text",
        "text": "Doa iftitah dibaca pada rakaat pertama setelah takbiratul ihram. Membacanya sunah, bukan rukun."
      }
    ]
  },
  {
    "level": 4,
    "title": "4. Membaca taawuz dan Surah Al-Fatihah",
    "blocks": [
      {
        "type": "recitation",
        "label": "Taawuz",
        "arab": "أَعُوْذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ",
        "translit": "A'uudzu billaahi minasy-syaithaanir-rajiim.",
        "arti": "Aku berlindung kepada Allah dari setan yang terkutuk."
      },
      {
        "type": "text",
        "text": "Kemudian membaca Surah Al-Fatihah sampai selesai. Setelah Al-Fatihah, membaca “Aamiin”."
      },
      {
        "type": "text",
        "text": "Catatan: Membaca Al-Fatihah merupakan rukun salat pada setiap rakaat menurut mazhab Syafi'i."
      }
    ]
  },
  {
    "level": 4,
    "title": "5. Membaca surah atau ayat Al-Qur'an",
    "blocks": [
      {
        "type": "text",
        "text": "Setelah Al-Fatihah pada rakaat pertama dan kedua, disunahkan membaca surah atau beberapa ayat Al-Qur'an. Contohnya Surah Al-Ikhlas."
      }
    ]
  },
  {
    "level": 4,
    "title": "6. Rukuk",
    "blocks": [
      {
        "type": "text",
        "text": "Ucapkan Allaahu akbar, lalu membungkuk. Letakkan kedua telapak tangan pada lutut, punggung dibuat rata semampunya, dan lakukan dengan tenang."
      },
      {
        "type": "text",
        "text": "Bacaan rukuk:"
      },
      {
        "type": "recitation",
        "arab": "سُبْحَانَ رَبِّيَ الْعَظِيْمِ",
        "translit": "Subhaana rabbiyal 'azhiim.",
        "arti": "Maha Suci Tuhanku Yang Maha Agung."
      },
      {
        "type": "text",
        "text": "Disunahkan membaca tiga kali atau lebih."
      }
    ]
  },
  {
    "level": 4,
    "title": "7. Iktidal",
    "blocks": [
      {
        "type": "text",
        "text": "Bangkit dari rukuk sambil membaca:"
      },
      {
        "type": "recitation",
        "arab": "سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ",
        "translit": "Sami'allaahu liman hamidah.",
        "arti": "Allah mendengar orang yang memuji-Nya."
      },
      {
        "type": "text",
        "text": "Setelah berdiri tegak, baca:"
      },
      {
        "type": "recitation",
        "arab": "رَبَّنَا لَكَ الْحَمْدُ",
        "translit": "Rabbanaa lakal hamdu.",
        "arti": "Wahai Tuhan kami, bagi-Mu segala puji."
      }
    ]
  },
  {
    "level": 4,
    "title": "8. Sujud pertama",
    "blocks": [
      {
        "type": "text",
        "text": "Ucapkan Allaahu akbar, kemudian sujud. Usahakan tujuh anggota tubuh menyentuh tempat sujud:"
      },
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Dahi dan hidung.",
          "Kedua telapak tangan.",
          "Kedua lutut.",
          "Ujung jari kedua kaki."
        ]
      },
      {
        "type": "text",
        "text": "Bacaan sujud:"
      },
      {
        "type": "recitation",
        "arab": "سُبْحَانَ رَبِّيَ الْأَعْلَى",
        "translit": "Subhaana rabbiyal a'laa.",
        "arti": "Maha Suci Tuhanku Yang Maha Tinggi."
      },
      {
        "type": "text",
        "text": "Disunahkan membaca tiga kali atau lebih."
      }
    ]
  },
  {
    "level": 4,
    "title": "9. Duduk di antara dua sujud",
    "blocks": [
      {
        "type": "text",
        "text": "Ucapkan Allaahu akbar, lalu duduk dengan tenang. Dalam praktik mazhab Syafi'i, posisi duduk yang umum adalah iftirasy: duduk di atas kaki kiri dan menegakkan kaki kanan."
      },
      {
        "type": "text",
        "text": "Doa yang dapat dibaca:"
      },
      {
        "type": "recitation",
        "arab": "رَبِّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ وَعَافِنِيْ وَاعْفُ عَنِّيْ",
        "translit": "Rabbighfir lii, warhamnii, wajburnii, warfa'nii, warzuqnii, wahdinii, wa'aafinii, wa'fu 'annii.",
        "arti": "Ya Tuhanku, ampunilah aku, rahmatilah aku, cukupkanlah kekuranganku, angkatlah derajatku, berilah aku rezeki, berilah aku petunjuk, sehatkanlah aku, dan maafkanlah aku."
      }
    ]
  },
  {
    "level": 4,
    "title": "10. Sujud kedua",
    "blocks": [
      {
        "type": "text",
        "text": "Ucapkan Allaahu akbar, kemudian sujud kembali seperti sujud pertama. Baca:"
      },
      {
        "type": "text",
        "text": "Subhaana rabbiyal a'laa (disunahkan tiga kali atau lebih)."
      }
    ]
  },
  {
    "level": 4,
    "title": "11. Berdiri untuk rakaat kedua",
    "blocks": [
      {
        "type": "text",
        "text": "Bangkit dari sujud kedua sambil mengucapkan Allaahu akbar. Berdiri tegak untuk rakaat kedua."
      }
    ]
  },
  {
    "level": 3,
    "title": "Rakaat kedua",
    "blocks": []
  },
  {
    "level": 4,
    "title": "12. Membaca Al-Fatihah dan surah",
    "blocks": [
      {
        "type": "text",
        "text": "Baca Surah Al-Fatihah, kemudian disunahkan membaca surah atau ayat Al-Qur'an."
      }
    ]
  },
  {
    "level": 4,
    "title": "13. Rukuk",
    "blocks": [
      {
        "type": "text",
        "text": "Lakukan rukuk dengan tenang dan baca:"
      },
      {
        "type": "translit",
        "text": "Subhaana rabbiyal 'azhiim."
      }
    ]
  },
  {
    "level": 4,
    "title": "14. Iktidal",
    "blocks": [
      {
        "type": "text",
        "text": "Bangkit sambil membaca:"
      },
      {
        "type": "translit",
        "text": "Sami'allaahu liman hamidah."
      },
      {
        "type": "text",
        "text": "Setelah berdiri tegak, baca:"
      },
      {
        "type": "translit",
        "text": "Rabbanaa lakal hamdu."
      }
    ]
  },
  {
    "level": 4,
    "title": "15. Sujud pertama",
    "blocks": [
      {
        "type": "text",
        "text": "Lakukan sujud dan baca:"
      },
      {
        "type": "translit",
        "text": "Subhaana rabbiyal a'laa."
      }
    ]
  },
  {
    "level": 4,
    "title": "16. Duduk di antara dua sujud",
    "blocks": [
      {
        "type": "text",
        "text": "Duduk dengan tenang dan baca doa:"
      },
      {
        "type": "translit",
        "text": "Rabbighfir lii, warhamnii, wajburnii, warfa'nii, warzuqnii, wahdinii, wa'aafinii, wa'fu 'annii."
      }
    ]
  },
  {
    "level": 4,
    "title": "17. Sujud kedua",
    "blocks": [
      {
        "type": "text",
        "text": "Lakukan sujud kedua dan baca:"
      },
      {
        "type": "translit",
        "text": "Subhaana rabbiyal a'laa."
      }
    ]
  },
  {
    "level": 4,
    "title": "18. Duduk tasyahud akhir",
    "blocks": [
      {
        "type": "text",
        "text": "Setelah sujud kedua pada rakaat terakhir, duduk tasyahud akhir. Dalam praktik mazhab Syafi'i, posisi duduk yang umum adalah tawarruk."
      },
      {
        "type": "text",
        "text": "Bacaan tasyahud:"
      },
      {
        "type": "recitation",
        "arab": "التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلّٰهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللّٰهِ الصَّالِحِيْنَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُوْلُ اللّٰهِ",
        "translit": "Attahiyyaatul mubaarakaatush-shalawaatuth-thayyibaatu lillaah. Assalaamu 'alaika ayyuhan-nabiyyu wa rahmatullaahi wa barakaatuh. Assalaamu 'alainaa wa 'alaa 'ibaadillaahish-shaalihiin. Asyhadu an laa ilaaha illallaah wa asyhadu anna Muhammadan rasuulullaah.",
        "arti": "Segala penghormatan, keberkahan, doa, dan kebaikan adalah milik Allah. Semoga keselamatan, rahmat Allah, dan keberkahan-Nya tercurah kepadamu, wahai Nabi. Semoga keselamatan tercurah kepada kami dan hamba-hamba Allah yang saleh. Aku bersaksi bahwa tidak ada Tuhan selain Allah dan aku bersaksi bahwa Muhammad adalah utusan Allah."
      },
      {
        "type": "text",
        "text": "Kemudian membaca selawat Ibrahimiyah:"
      },
      {
        "type": "recitation",
        "arab": "اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيْمَ وَعَلَى آلِ إِبْرَاهِيْمَ، إِنَّكَ حَمِيْدٌ مَجِيْدٌ. اللّٰهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيْمَ وَعَلَى آلِ إِبْرَاهِيْمَ، إِنَّكَ حَمِيْدٌ مَجِيْدٌ",
        "translit": "Allaahumma shalli 'alaa Muhammad wa 'alaa aali Muhammad, kamaa shallaita 'alaa Ibraahiima wa 'alaa aali Ibraahiim, innaka hamiidum majiid. Allaahumma baarik 'alaa Muhammad wa 'alaa aali Muhammad, kamaa baarakta 'alaa Ibraahiima wa 'alaa aali Ibraahiim, innaka hamiidum majiid.",
        "arti": "Ya Allah, limpahkanlah rahmat kepada Nabi Muhammad dan keluarga Nabi Muhammad sebagaimana Engkau telah melimpahkan rahmat kepada Nabi Ibrahim dan keluarga Nabi Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia. Ya Allah, limpahkanlah keberkahan kepada Nabi Muhammad dan keluarga Nabi Muhammad sebagaimana Engkau telah melimpahkan keberkahan kepada Nabi Ibrahim dan keluarga Nabi Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia."
      }
    ]
  },
  {
    "level": 4,
    "title": "19. Salam",
    "blocks": [
      {
        "type": "text",
        "text": "Menoleh ke kanan dan mengucapkan:"
      },
      {
        "type": "recitation",
        "arab": "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
        "translit": "Assalaamu 'alaikum wa rahmatullaah.",
        "arti": "Semoga keselamatan dan rahmat Allah tercurah kepada kalian."
      },
      {
        "type": "text",
        "text": "Kemudian menoleh ke kiri dan mengucapkan bacaan yang sama."
      },
      {
        "type": "text",
        "text": "Salat dua rakaat selesai."
      }
    ]
  },
  {
    "level": 1,
    "title": "3. Salat Wajib Lima Waktu",
    "blocks": [
      {
        "type": "table",
        "rows": [
          [
            "Nama salat",
            "Jumlah rakaat",
            "Keterangan"
          ],
          [
            "Subuh",
            "2",
            "Tasyahud akhir pada rakaat kedua"
          ],
          [
            "Zuhur",
            "4",
            "Tasyahud awal setelah rakaat kedua"
          ],
          [
            "Asar",
            "4",
            "Tasyahud awal setelah rakaat kedua"
          ],
          [
            "Magrib",
            "3",
            "Tasyahud awal setelah rakaat kedua"
          ],
          [
            "Isya",
            "4",
            "Tasyahud awal setelah rakaat kedua"
          ]
        ]
      }
    ]
  },
  {
    "level": 2,
    "title": "3.1 Pola salat tiga rakaat",
    "blocks": [
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Rakaat pertama: Al-Fatihah, surah, rukuk, iktidal, dua sujud.",
          "Rakaat kedua: Al-Fatihah, surah, rukuk, iktidal, dua sujud.",
          "Duduk tasyahud awal setelah sujud kedua rakaat kedua.",
          "Berdiri ke rakaat ketiga.",
          "Rakaat ketiga: Al-Fatihah, rukuk, iktidal, dua sujud.",
          "Duduk tasyahud akhir, membaca tasyahud dan selawat.",
          "Salam ke kanan dan ke kiri."
        ]
      }
    ]
  },
  {
    "level": 2,
    "title": "3.2 Pola salat empat rakaat",
    "blocks": [
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Rakaat pertama: Al-Fatihah, surah, rukuk, iktidal, dua sujud.",
          "Rakaat kedua: Al-Fatihah, surah, rukuk, iktidal, dua sujud.",
          "Duduk tasyahud awal setelah sujud kedua rakaat kedua.",
          "Berdiri ke rakaat ketiga.",
          "Rakaat ketiga: Al-Fatihah, rukuk, iktidal, dua sujud.",
          "Berdiri ke rakaat keempat.",
          "Rakaat keempat: Al-Fatihah, rukuk, iktidal, dua sujud.",
          "Duduk tasyahud akhir, membaca tasyahud dan selawat.",
          "Salam ke kanan dan ke kiri."
        ]
      },
      {
        "type": "text",
        "text": "Dalam praktik umum mazhab Syafi'i, membaca surah setelah Al-Fatihah disunahkan pada dua rakaat pertama. Pada rakaat ketiga dan keempat, membaca Al-Fatihah saja sudah mencukupi."
      }
    ]
  },
  {
    "level": 1,
    "title": "4. Rukun Salat Menurut Mazhab Syafi'i",
    "blocks": [
      {
        "type": "text",
        "text": "Rukun salat yang umum dirangkum berjumlah 13:"
      },
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Niat.",
          "Berdiri bagi yang mampu dalam salat fardu.",
          "Takbiratul ihram.",
          "Membaca Surah Al-Fatihah.",
          "Rukuk dengan tumakninah.",
          "Iktidal dengan tumakninah.",
          "Sujud dua kali dengan tumakninah.",
          "Duduk di antara dua sujud dengan tumakninah.",
          "Duduk tasyahud akhir.",
          "Membaca tasyahud akhir.",
          "Membaca selawat kepada Nabi pada tasyahud akhir.",
          "Salam pertama.",
          "Tertib, yaitu melaksanakan rukun sesuai urutannya."
        ]
      },
      {
        "type": "text",
        "text": "Tumakninah berarti berhenti sejenak dengan tenang pada gerakan rukuk, iktidal, sujud, dan duduk di antara dua sujud. Jangan melakukan gerakan salat secara terburu-buru."
      }
    ]
  },
  {
    "level": 1,
    "title": "5. Sunah dan Hal yang Perlu Diperhatikan",
    "blocks": [
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Doa iftitah adalah sunah, bukan rukun.",
          "Membaca surah setelah Al-Fatihah pada dua rakaat pertama adalah sunah.",
          "Bacaan tasbih rukuk dan sujud adalah sunah; bacaan minimal yang sah dalam rukun-rukun tertentu perlu mengikuti ketentuan mazhab.",
          "Tasyahud awal dan duduk tasyahud awal termasuk sunah ab'ad dalam mazhab Syafi'i.",
          "Qunut Subuh termasuk sunah ab'ad menurut mazhab Syafi'i.",
          "Tumakninah merupakan bagian dari rukun salat.",
          "Orang yang tidak mampu berdiri dapat salat dengan posisi yang mampu dilakukan sesuai ketentuan fikih."
        ]
      }
    ]
  },
  {
    "level": 1,
    "title": "6. Referensi dan Dalil",
    "blocks": []
  },
  {
    "level": 2,
    "title": "Al-Qur'an",
    "blocks": [
      {
        "type": "text",
        "text": "1. QS. Al-Ma'idah [5]: 6 — Perintah wudhu dan anggota tubuh yang dibasuh atau diusap.\n- https://quran.com/5/6\n2. QS. Al-Baqarah [2]: 43 — Perintah mendirikan salat.\n- https://quran.com/2/43\n3. QS. Al-Mu'minun [23]: 1–2 — Ciri orang beriman yang khusyuk dalam salat.\n- https://quran.com/23/1-2"
      }
    ]
  },
  {
    "level": 2,
    "title": "Hadis",
    "blocks": [
      {
        "type": "text",
        "text": "1. Sahih al-Bukhari No. 631 — Perintah Nabi Muhammad ﷺ: “Salatlah kalian sebagaimana kalian melihat aku salat.”\n- https://sunnah.com/bukhari:631\n2. Sahih al-Bukhari No. 159 dan Sahih Muslim No. 226 — Riwayat tata cara wudhu Utsman bin Affan r.a. yang memperlihatkan wudhu Nabi ﷺ.\n- https://sunnah.com/bukhari:159\n- https://sunnah.com/muslim:226\n3. Sahih Muslim No. 234 — Keutamaan menyempurnakan wudhu.\n- https://sunnah.com/muslim:234"
      }
    ]
  },
  {
    "level": 2,
    "title": "Rujukan pembelajaran Indonesia",
    "blocks": [
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Kementerian Agama Republik Indonesia — Buku Fikih Madrasah (materi bersuci dan salat).",
          "https://cendikia.kemenag.go.id/",
          "NU Online — Artikel fikih wudhu dan salat berdasarkan mazhab Syafi'i.",
          "https://islam.nu.or.id/"
        ]
      }
    ]
  },
  {
    "level": 1,
    "title": "7. Catatan Implementasi untuk Dunia Qinaraya",
    "blocks": [
      {
        "type": "text",
        "text": "Bagian ini merupakan catatan pengembangan game, bukan bagian dari tata cara ibadah."
      }
    ]
  },
  {
    "level": 2,
    "title": "Rekomendasi struktur konten",
    "blocks": [
      {
        "type": "text",
        "text": "Agar mudah ditampilkan sebagai materi interaktif:"
      },
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Menu Wudhu",
          "Tampilkan 11 langkah secara berurutan.",
          "Setiap langkah berisi nama gerakan, ilustrasi, instruksi singkat, dan bacaan jika ada.",
          "Beri penanda apakah langkah termasuk rukun atau sunah.",
          "Sediakan tombol “Sebelumnya” dan “Berikutnya”."
        ]
      },
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Menu Salat",
          "Pilihan salat: Subuh, Zuhur, Asar, Magrib, dan Isya.",
          "Tampilkan urutan gerakan berdasarkan rakaat.",
          "Setiap gerakan berisi nama gerakan, ilustrasi posisi, bacaan Arab, transliterasi, dan arti.",
          "Beri indikator rakaat dan posisi saat ini.",
          "Bedakan tasyahud awal dan tasyahud akhir."
        ]
      },
      {
        "type": "list",
        "ordered": false,
        "items": [
          "Menu Belajar",
          "Daftar rukun wudhu.",
          "Daftar rukun salat.",
          "Hal-hal yang membatalkan wudhu.",
          "Kuis sederhana untuk menguji pemahaman."
        ]
      }
    ]
  },
  {
    "level": 2,
    "title": "Prinsip penyajian",
    "blocks": [
      {
        "type": "list",
        "ordered": true,
        "items": [
          "Jangan mengubah atau memotong bacaan Arab sehingga mengubah maknanya.",
          "Pastikan teks Arab ditampilkan dengan dukungan font Arab dan arah kanan-ke-kiri (RTL).",
          "Sediakan transliterasi dan arti bahasa Indonesia.",
          "Jangan menampilkan gerakan sunah sebagai rukun.",
          "Jangan menyatakan ibadah pemain sah atau tidak sah hanya berdasarkan kuis sederhana.",
          "Gunakan ilustrasi yang sopan dan jelas, serta hindari animasi yang menjadikan gerakan ibadah sebagai bahan candaan.",
          "Jadikan materi ini sebagai panduan belajar, bukan pengganti bimbingan guru agama."
        ]
      },
      {
        "type": "text",
        "text": "Acuan utama: Al-Qur'an, hadis sahih, dan penjelasan fikih mazhab Syafi'i."
      }
    ]
  }
];
