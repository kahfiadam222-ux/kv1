/* =============================================================
   DATA KARYA kv1  —  edit file ini untuk menambah atau mengubah karya
   =============================================================

   Setiap karya adalah satu blok { ... }. Salin satu blok, ganti isinya.

   id     : wajib unik, misal 'w7'
   type   : 'slide'  -> gambar / carousel
            'motion' -> video motion graphic
            'produk' -> video produk
   ratio  : '4 / 5' (feed), '1 / 1' (kotak), '9 / 16' (reels/story), '16 / 9' (landscape)
   title  : judul karya
   desc   : keterangan singkat

   Isi SALAH SATU sumber di bawah (urutan prioritas dari atas):
   images : daftar link gambar untuk slide, misal ['img/promo-1.jpg', 'img/promo-2.jpg']
   src    : file video langsung (.mp4 / .webm), misal 'video/produk.mp4'
   poster : gambar sampul untuk video src (opsional)
   link   : link video atau postingan. Otomatis diputar di halaman untuk:
            YouTube (termasuk Shorts), Instagram (post / reel), TikTok,
            Vimeo, Google Drive (file harus "Anyone with the link"), Canva.
            Link lain tampil sebagai tombol yang membuka tab baru.

   Kosongkan semua sumber untuk menampilkan kotak placeholder.
   File gambar/video lokal taruh di folder img/ atau video/ di proyek ini.
*/

window.KARYA = [
  { id: 'w1', type: 'slide',  ratio: '4 / 5',  title: 'Carousel promo menu',      desc: 'Contoh slide feed untuk usaha FnB.',             images: [] },
  { id: 'w2', type: 'motion', ratio: '9 / 16', title: 'Motion graphic reels',     desc: 'Teks dan elemen bergerak untuk reels.',          src: 'video/motion-reels.mp4' },
  { id: 'w3', type: 'produk', ratio: '1 / 1',  title: 'Video produk',             desc: 'Video singkat untuk etalase produk.',            link: '' },
  { id: 'w4', type: 'slide',  ratio: '1 / 1',  title: 'Desain price list',        desc: 'Slide daftar harga yang rapi dan mudah dibaca.', images: [] },
  { id: 'w5', type: 'produk', ratio: '9 / 16', title: 'Video produk vertikal',    desc: 'Format story dan reels.',                        link: '' },
  { id: 'w6', type: 'motion', ratio: '16 / 9', title: 'Motion graphic landscape', desc: 'Untuk YouTube, presentasi, atau web.',           link: '' }
];
