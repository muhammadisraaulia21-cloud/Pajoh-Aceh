/**
 * Pure choreography & dish-matched botanical illustration helpers
 * for the interactive Home Hero Showcase.
 */

export function getSlideDirection(prevIndex, nextIndex, total) {
  if (total <= 1 || prevIndex === nextIndex) return 'next';
  if (prevIndex === total - 1 && nextIndex === 0) return 'next';
  if (prevIndex === 0 && nextIndex === total - 1) return 'prev';
  return nextIndex > prevIndex ? 'next' : 'prev';
}

const DISH_ILLUSTRATION_SPECS = {
  'sie-reuboh': {
    motifKey: 'sie-reuboh',
    aromaTitle: 'Jejak Aroma Sie Reuboh',
    aromaSummary: 'Asam hangat cuka aren berpadu bunga lawang dan cabai kering yang meresap 4 jam.',
    accent: '#8A6A1F',
    nodes: [
      {
        slot: 'tl',
        icon: 'star-anise',
        label: 'Bunga Lawang & Rempah',
        note: 'Rempah kering hangat yang menjaga kuah tetap harum dan tahan lama.',
        delayMs: 110,
      },
      {
        slot: 'tr',
        icon: 'vinegar-drop',
        label: 'Cuka Aren Fermentasi',
        note: 'Nira aren fermentasi alami memberi asam lembut yang menembus serat daging.',
        delayMs: 185,
      },
      {
        slot: 'bl',
        icon: 'chili-pod',
        label: 'Cabai Aceh & Kunyit',
        note: 'Warna merah keemasan dengan pedas perlahan yang menghangatkan tenggorokan.',
        delayMs: 260,
      },
      {
        slot: 'br',
        icon: 'pinto-aceh',
        label: 'Ornamen Indatu',
        note: 'Resep bekal klasik warisan keluarga Aceh Besar sejak ratusan tahun silam.',
        delayMs: 335,
      },
    ],
  },
  'ayam-tangkap': {
    motifKey: 'ayam-tangkap',
    aromaTitle: 'Jejak Aroma Ayam Tangkap',
    aromaSummary: 'Daun temurui & pandan digoreng garing hingga menyebar wangi sebelum suapan pertama.',
    accent: '#064E3B',
    nodes: [
      {
        slot: 'tl',
        icon: 'curry-leaf',
        label: 'Daun Temurui Renyah',
        note: 'Salam koja digoreng garing memberi aroma pahit-segar khas Aceh Rayeuk.',
        delayMs: 110,
      },
      {
        slot: 'tr',
        icon: 'pandan-ribbon',
        label: 'Pandan Wangi',
        note: 'Ikatan pandan muda menetralkan gurih minyak kelapa dengan wangi manis alami.',
        delayMs: 185,
      },
      {
        slot: 'bl',
        icon: 'chili-pod',
        label: 'Cabai Hijau Utuh',
        note: 'Petikan cabai hijau segar menambah rasa pedas ringan yang renyah.',
        delayMs: 260,
      },
      {
        slot: 'br',
        icon: 'pinto-aceh',
        label: 'Sajian Wajan Panas',
        note: 'Diangkat langsung dari wajan agar kerenyahan daun menyelimuti ayam kampung.',
        delayMs: 335,
      },
    ],
  },
  'keumamah-tumis': {
    motifKey: 'keumamah-tumis',
    aromaTitle: 'Jejak Aroma Keumamah',
    aromaSummary: 'Tongkol kayu pesisir Pidie berpadu asam sunti dan serai harum penuh karakter.',
    accent: '#4F6D5E',
    nodes: [
      {
        slot: 'tl',
        icon: 'ocean-wave',
        label: 'Tongkol Kayu Pesisir',
        note: 'Ikan tongkol segar yang dijemur matahari Banda Aceh selama tiga hari.',
        delayMs: 110,
      },
      {
        slot: 'tr',
        icon: 'asam-sunti',
        label: 'Asam Sunti Tradisional',
        note: 'Belimbing wuluh yang diasinkan dan dijemur memberi asam gurih berlapis.',
        delayMs: 185,
      },
      {
        slot: 'bl',
        icon: 'lemongrass',
        label: 'Serai & Daun Jeruk',
        note: 'Mengangkat aroma laut menjadi tumisan hangat yang membangkitkan selera.',
        delayMs: 260,
      },
      {
        slot: 'br',
        icon: 'pinto-aceh',
        label: 'Warisan Nelayan',
        note: 'Ketekunan dapur pesisir Pidie yang awet dan kian sedap keesokan hari.',
        delayMs: 335,
      },
    ],
  },
  'sambal-ganja': {
    motifKey: 'sambal-ganja',
    aromaTitle: 'Jejak Aroma Sambal Ganja',
    aromaSummary: 'Ledakan asam belimbing wuluh, serai muda, dan udang sangrai yang bikin ketagihan.',
    accent: '#A16207',
    nodes: [
      {
        slot: 'tl',
        icon: 'asam-sunti',
        label: 'Belimbing Wuluh Segar',
        note: 'Diulek kasar agar rasa asam segar langsung pecah berpadu dengan nasi hangat.',
        delayMs: 110,
      },
      {
        slot: 'tr',
        icon: 'lemongrass',
        label: 'Serai Muda Iris Halus',
        note: 'Bagian putih serai muda memberi kerenyahan segar tanpa aroma menusuk.',
        delayMs: 185,
      },
      {
        slot: 'bl',
        icon: 'chili-pod',
        label: 'Rawit Hijau & Daun Jeruk',
        note: 'Pedas bersih tanpa terasi atau tomat agar cita rasa udang sangrai menonjol.',
        delayMs: 260,
      },
      {
        slot: 'br',
        icon: 'star-anise',
        label: 'Udang Segar Sangrai',
        note: 'Udang pilihan disangrai kering hingga gurih manis alami.',
        delayMs: 335,
      },
    ],
  },
};

export function getDishIllustrationSpec(product) {
  if (!product) return DISH_ILLUSTRATION_SPECS['sie-reuboh'];
  if (DISH_ILLUSTRATION_SPECS[product.id]) {
    return DISH_ILLUSTRATION_SPECS[product.id];
  }

  const spices = Array.isArray(product.spices) && product.spices.length
    ? product.spices
    : ['Rempah Pilihan Aceh', 'Racikan Dapur Segar', 'Bumbu Tradisional', 'Resep Indatu'];
  const isSweet = String(product.category || '').toLowerCase().includes('kue');

  const icons = isSweet
    ? ['banana-leaf', 'pandan-ribbon', 'vinegar-drop', 'pinto-aceh']
    : ['star-anise', 'curry-leaf', 'chili-pod', 'pinto-aceh'];

  return {
    motifKey: isSweet ? 'kue-tradisional' : 'custom-heritage',
    aromaTitle: `Jejak Aroma ${product.name}`,
    aromaSummary: product.desc || 'Racikan rempah asli Banda Aceh yang dimasak segar per pesanan.',
    accent: '#8A6A1F',
    nodes: [0, 1, 2, 3].map((i) => ({
      slot: ['tl', 'tr', 'bl', 'br'][i],
      icon: icons[i],
      label: spices[i % spices.length],
      note: `Elemen khas ${product.name}: ${spices[i % spices.length]} yang diolah segar di dapur Pajôh.`,
      delayMs: 110 + i * 75,
    })),
  };
}
