import { escapeHtml } from './format.js';

export const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">' +
      '<defs><radialGradient id="g" cx="50%" cy="45%" r="62%"><stop offset="0%" stop-color="#F3EFE7"/><stop offset="100%" stop-color="#E2D9C8"/></radialGradient></defs>' +
      '<rect width="600" height="600" fill="url(#g)"/>' +
      '<circle cx="300" cy="300" r="196" fill="#FAF8F5" stroke="#D4AF37" stroke-width="4"/>' +
      '<circle cx="300" cy="300" r="166" fill="none" stroke="#064E3B" stroke-opacity=".22" stroke-width="2" stroke-dasharray="6 10"/>' +
      '<path d="M300 200c30 0 54 24 54 54s-24 54-54 54-54-24-54-54 24-54 54-54z" fill="none" stroke="#D4AF37" stroke-opacity=".55" stroke-width="3"/>' +
      '<text x="300" y="328" font-family="Georgia,serif" font-size="60" fill="#064E3B" text-anchor="middle">Pajôh</text>' +
      '<text x="300" y="370" font-family="Helvetica,Arial,sans-serif" font-size="14" letter-spacing="7" fill="#D4AF37" text-anchor="middle">ACEH</text>' +
      '</svg>'
  );

export function createDishFallbackDataUrl(name = 'Pajôh', category = 'Aceh Heritage') {
  const shortTitle = String(name || 'Pajôh').slice(0, 24);
  const shortCat = String(category || 'Aceh Heritage').toUpperCase().slice(0, 24);
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">' +
        '<defs><radialGradient id="g" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#F8F5EE"/><stop offset="100%" stop-color="#E6DEC8"/></radialGradient></defs>' +
        '<rect width="600" height="600" fill="url(#g)"/>' +
        '<circle cx="300" cy="300" r="206" fill="#FAF8F5" stroke="#D4AF37" stroke-width="4"/>' +
        '<circle cx="300" cy="300" r="176" fill="none" stroke="#064E3B" stroke-opacity=".22" stroke-width="2" stroke-dasharray="6 10"/>' +
        '<circle cx="300" cy="236" r="32" fill="none" stroke="#D4AF37" stroke-width="2.5"/>' +
        '<path d="M284 236h32M300 220v32" stroke="#064E3B" stroke-opacity=".55" stroke-width="2"/>' +
        `<text x="300" y="318" font-family="Georgia,serif" font-size="34" font-weight="600" fill="#064E3B" text-anchor="middle">${escapeHtml(shortTitle)}</text>` +
        `<text x="300" y="356" font-family="Helvetica,Arial,sans-serif" font-size="13" letter-spacing="4" fill="#8A6A1F" text-anchor="middle">${escapeHtml(shortCat)}</text>` +
        '</svg>'
    )
  );
}

export function renderImgTag(product, cls, opts = {}) {
  const src =
    product && product.image && String(product.image).trim()
      ? String(product.image).trim()
      : createDishFallbackDataUrl(product?.name, product?.category);
  const alt = opts.alt || (product ? product.name : 'Hidangan Pajôh');
  const fallback = createDishFallbackDataUrl(product?.name, product?.category);
  const loadingAttr = opts.lazy === false ? '' : 'loading="lazy"';
  return `<img src="${escapeHtml(src)}" data-fallback-src="${escapeHtml(fallback)}" alt="${escapeHtml(alt)}" ${loadingAttr} referrerpolicy="no-referrer" class="${escapeHtml(cls)}" />`;
}

export function bindImageFallbacks(root = document) {
  root.querySelectorAll('img[data-fallback-src]').forEach((img) => {
    if (img.dataset.fallbackBound === '1') return;
    img.dataset.fallbackBound = '1';
    const applyFallback = () => {
      const fb = img.dataset.fallbackSrc || FALLBACK_IMG;
      if (img.src !== fb) {
        img.src = fb;
      }
    };
    img.addEventListener('error', applyFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) {
      applyFallback();
    }
  });
}

export function compressImageFile(file, maxSize = 720, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, atau WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak dapat diproses.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
