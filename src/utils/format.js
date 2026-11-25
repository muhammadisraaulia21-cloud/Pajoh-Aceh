export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch];
  });
}

export function formatRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

export function normalizeWaNumber(wa) {
  const digits = String(wa || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}

export function formatWaDisplay(wa) {
  const digits = normalizeWaNumber(wa);
  if (digits.length >= 11 && digits.slice(0, 2) === '62') {
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + '-' + digits.slice(5, 9) + '-' + digits.slice(9);
  }
  return digits;
}

export function slugifyProduct(name, existingProducts = []) {
  const existingIds = new Set(existingProducts.map((p) => p.id));
  let base = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) base = 'produk';
  let id = base;
  let counter = 1;
  while (existingIds.has(id)) {
    counter += 1;
    id = `${base}-${counter}`;
  }
  return id;
}

export function validateCheckoutForm({ name, phone, method, address }) {
  const errors = {};
  const trimmedName = String(name || '').trim();
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  const trimmedAddress = String(address || '').trim();

  if (trimmedName.length < 3) {
    errors.name = 'Nama minimal 3 karakter.';
  }
  if (!/^(0|62)[0-9]{8,13}$/.test(cleanPhone)) {
    errors.phone = 'Nomor tidak valid. Gunakan format 08xx atau 62xx, 10–15 digit.';
  }
  if (method === 'kurir' && trimmedAddress.length < 10) {
    errors.address = 'Alamat minimal 10 karakter agar kurir tidak tersesat.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProductForm({ name, price, category, desc, rating }) {
  const errors = {};
  const trimmedName = String(name || '').trim();
  const numericPrice = Number(price);
  const trimmedDesc = String(desc || '').trim();
  const numericRating = Number(rating);

  if (trimmedName.length < 3) {
    errors.name = 'Nama produk minimal 3 karakter.';
  }
  if (!String(category || '').trim()) {
    errors.category = 'Pilih kategori produk.';
  }
  if (!Number.isFinite(numericPrice) || numericPrice < 1000) {
    errors.price = 'Harga minimal Rp 1.000.';
  }
  if (trimmedDesc.length < 10) {
    errors.desc = 'Deskripsi singkat minimal 10 karakter.';
  }
  if (rating !== '' && rating != null && (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 5)) {
    errors.rating = 'Rating harus antara 0.0 hingga 5.0.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStoryForm({ tag, title, paragraphs }) {
  const errors = {};
  const trimmedTag = String(tag || '').trim();
  const trimmedTitle = String(title || '').trim();
  const paraList = Array.isArray(paragraphs)
    ? paragraphs.map((p) => String(p || '').trim()).filter(Boolean)
    : String(paragraphs || '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

  if (trimmedTag.length < 2) {
    errors.tag = 'Label bab minimal 2 karakter.';
  }
  if (trimmedTitle.length < 5) {
    errors.title = 'Judul kisah minimal 5 karakter.';
  }
  const combinedLength = paraList.join(' ').trim().length;
  if (!paraList.length || combinedLength < 15) {
    errors.paragraphs = 'Isi kisah minimal 15 karakter.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    paragraphs: paraList,
  };
}

export function buildWhatsAppOrderMessage(order, settings) {
  const items = Array.isArray(order.items) ? order.items : [];
  const totalItems =
    Number(order.totalItems) ||
    items.reduce((sum, it) => sum + Math.max(0, Number(it.q || 0)), 0);
  const freeDelivery =
    typeof order.freeDeliveryEligible === 'boolean'
      ? order.freeDeliveryEligible
      : Number(order.subtotal || 0) >= 250000;

  const lines = [];
  lines.push('*PESANAN BARU — PAJÔH*');
  lines.push('_Authentic Taste, Heritage of Aceh_');
  if (order.orderCode) {
    lines.push(`Kode Pesanan: *${order.orderCode}*`);
  }
  lines.push('');
  lines.push('*Data Pemesan*');
  lines.push(`Nama: ${order.name}`);
  lines.push(`No. HP: ${order.phone}`);
  lines.push(`Metode: ${order.method === 'pickup' ? 'Ambil Langsung (Self-Pickup)' : 'Pengiriman Kurir'}`);
  if (order.method === 'pickup') {
    lines.push(`Lokasi ambil: ${settings.address}`);
  } else {
    lines.push(`Alamat: ${order.address}`);
  }
  lines.push('');
  lines.push(`*Rincian Pesanan (${totalItems} item)*`);
  items.forEach((it, index) => {
    const qty = Number(it.q || 0);
    const price = Number(it.p?.price || 0);
    lines.push(`${index + 1}. ${it.p.name}`);
    if (it.p.subtitle) lines.push(`   ${it.p.subtitle}`);
    lines.push(`   Jumlah: ${qty} item x ${formatRupiah(price)} = *${formatRupiah(qty * price)}*`);
  });
  lines.push('');
  lines.push(`Total Jumlah Item: *${totalItems} item*`);
  lines.push(`Subtotal: ${formatRupiah(order.subtotal)}`);
  lines.push(`Pengiriman: ${freeDelivery ? 'Gratis (Area Banda Aceh)' : 'Menyusul (sesuai jarak)'}`);
  lines.push(`*Total Harga: ${formatRupiah(order.total)}*`);
  if (order.note) {
    lines.push('');
    lines.push(`Catatan: ${order.note}`);
  }
  lines.push('');
  lines.push(
    `Mohon konfirmasi ketersediaan dan jadwal ${order.method === 'pickup' ? 'pengambilan' : 'pengiriman'}. Terima kasih banyak.`
  );
  return lines.join('\n');
}

export function buildWhatsAppUrl(waNumber, message) {
  const digits = normalizeWaNumber(waNumber);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
