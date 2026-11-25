import { addToCart, findProduct, state } from '../state/store.js';
import { productCardHtml, sectionEyebrow, showToast, statusTag } from '../components/ui.js';
import { updateCartBadge } from '../components/layout.js';
import { escapeHtml, formatRupiah } from '../utils/format.js';
import { bindImageFallbacks, renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

export function renderNotFoundPage() {
  return `<section class="mx-auto max-w-[900px] px-4 py-24 text-center sm:px-6">
    <p class="serif text-7xl font-bold text-pajoh-green/20">404</p>
    <h1 class="serif mt-2 text-3xl font-semibold text-pajoh-green">Halaman tidak ditemukan</h1>
    <p class="mt-2 text-[14px] text-pajoh-ink/60">Sepertinya resep yang Anda cari tidak ada di buku kami.</p>
    <a href="#/home" class="btn btn-primary mt-6">Kembali ke Beranda</a>
  </section>`;
}

export function renderProductPage(id) {
  const p = findProduct(id);
  if (!p) return renderNotFoundPage();

  const related = state.products.filter((x) => x.id !== p.id).slice(0, 3);
  const soldOut = p.status === 'Habis';

  return `
  <section class="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
    <nav class="flex items-center gap-2 text-[12px] text-pajoh-green/55" aria-label="Breadcrumb">
      <a href="#/home" class="transition hover:text-pajoh-green">Beranda</a>
      <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
      <a href="#/menu" class="transition hover:text-pajoh-green">Menu</a>
      <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
      <span class="text-pajoh-green/85">${escapeHtml(p.name)}</span>
    </nav>

    <div class="mt-8 grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
      <div class="lg:col-span-5 lg:sticky lg:top-28">
        <div class="relative mx-auto aspect-square w-full max-w-[440px]">
          <div class="spin-slow absolute inset-0 rounded-full border border-dashed border-pajoh-gold/45"></div>
          <div class="absolute inset-3 overflow-hidden rounded-full shadow-[0_40px_70px_-30px_rgba(2,44,34,0.5)] ring-[7px] ring-white">
            ${renderImgTag(p, 'h-full w-full object-cover', { lazy: false, alt: `${p.name} di atas piring Pajôh` })}
          </div>
          <div class="absolute -bottom-2 right-2 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-pajoh-green/10">
            <p class="text-[10px] uppercase tracking-[0.16em] text-pajoh-ink/50">Harga</p>
            <p class="tabular-nums text-lg font-bold text-pajoh-green">${formatRupiah(p.price)}</p>
          </div>
        </div>
        <div class="mt-8 grid grid-cols-3 gap-3">
          <div class="rounded-xl bg-white/80 p-3 text-center ring-1 ring-pajoh-green/10">
            <p class="serif tabular-nums text-xl font-bold text-pajoh-green">★ ${p.rating || 4.8}</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Rating</p>
          </div>
          <div class="rounded-xl bg-white/80 p-3 text-center ring-1 ring-pajoh-green/10">
            <p class="serif tabular-nums text-xl font-bold text-pajoh-green">${(p.spices || []).length}</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Rempah</p>
          </div>
          <div class="rounded-xl bg-white/80 p-3 text-center ring-1 ring-pajoh-green/10">
            <p class="serif text-xl font-bold text-pajoh-green">${p.status === 'Pre-Order' ? 'H+1' : 'Fresh'}</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Penyajian</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="flex flex-wrap items-center gap-3">
          ${statusTag(p.status)}
          <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6A1F]">${escapeHtml(p.category)}</span>
          ${
            p.featured
              ? '<span aria-hidden="true" class="text-pajoh-green/30">·</span><span class="text-[11px] font-bold uppercase tracking-[0.14em] text-pajoh-green">Unggulan</span>'
              : ''
          }
        </div>
        <p class="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-pajoh-green/60">${escapeHtml(p.eyebrow)}</p>
        <h1 class="serif mt-2 text-4xl font-bold leading-[0.96] text-pajoh-green sm:text-5xl">${escapeHtml(p.name)}</h1>
        <p class="mt-3 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-[#8A6A1F]">${escapeHtml(p.subtitle)}</p>
        <p class="mt-5 text-[15px] leading-relaxed text-pajoh-ink/75">${escapeHtml(p.desc)}</p>

        <div class="mt-7 rounded-2xl border border-pajoh-green/10 bg-white/80 p-5">
          <p class="text-[10.5px] font-bold uppercase tracking-[0.2em] text-pajoh-green/60">Rempah &amp; Bahan Utama</p>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            ${(p.spices || [])
              .map(
                (s) =>
                  `<li class="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-[13px] text-pajoh-ink/80 ring-1 ring-pajoh-green/5">
                    <i data-lucide="leaf" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-pajoh-green/55"></i>
                    <span>${escapeHtml(s)}</span>
                  </li>`
              )
              .join('')}
          </ul>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-pajoh-sand/75 p-5">
            <div class="flex items-center gap-2 text-pajoh-green">
              <i data-lucide="utensils" class="h-4 w-4"></i>
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em]">Saran Penyajian</p>
            </div>
            <p class="mt-2 text-[13px] leading-relaxed text-pajoh-ink/70">${escapeHtml(p.serving)}</p>
          </div>
          <div class="rounded-2xl bg-pajoh-green p-5 text-pajoh-ivory">
            <div class="flex items-center gap-2 text-pajoh-gold">
              <i data-lucide="package" class="h-4 w-4"></i>
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em]">Penyimpanan</p>
            </div>
            <p class="mt-2 text-[13px] leading-relaxed text-pajoh-ivory/75">Dikemas dalam wadah food grade tertutup. Untuk pengiriman kurir, kami menambahkan ice gel agar suhu tetap aman selama perjalanan.</p>
          </div>
        </div>

        <div class="mt-7 flex flex-col gap-3 rounded-2xl border border-pajoh-green/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-pajoh-green/60">Jumlah</span>
            <div class="flex items-center rounded-full border border-pajoh-green/15">
              <button type="button" id="pd-qty-minus" class="flex h-10 w-10 items-center justify-center text-pajoh-green transition hover:bg-pajoh-ivory cursor-pointer" aria-label="Kurangi jumlah"><i data-lucide="minus" class="h-4 w-4"></i></button>
              <input id="pd-qty" type="text" value="1" inputmode="numeric" readonly class="tabular-nums w-10 border-0 bg-transparent text-center text-sm font-bold text-pajoh-green outline-none" aria-label="Kuantitas" />
              <button type="button" id="pd-qty-plus" class="flex h-10 w-10 items-center justify-center text-pajoh-green transition hover:bg-pajoh-ivory cursor-pointer" aria-label="Tambah jumlah"><i data-lucide="plus" class="h-4 w-4"></i></button>
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" id="pd-add-btn" data-product-id="${escapeHtml(p.id)}" ${soldOut ? 'disabled' : ''} class="btn btn-primary flex-1 sm:flex-none">
              <i data-lucide="shopping-bag" class="h-4 w-4"></i> ${soldOut ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
            <a href="#/checkout" class="btn btn-outline">Checkout <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>
        </div>
        <p class="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-pajoh-ink/50"><i data-lucide="truck" class="h-3.5 w-3.5"></i> Pengiriman area Banda Aceh · Pre-order H-1 untuk kue tradisional</p>

        <div class="mt-10 border-t border-pajoh-green/10 pt-8">
          <p class="text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#8A6A1F]">Kisah Hidangan</p>
          <h2 class="serif mt-2 text-2xl font-semibold text-pajoh-green">Di balik sepiring ${escapeHtml(p.name)}</h2>
          <p class="mt-3 text-[14px] leading-relaxed text-pajoh-ink/75">${escapeHtml(p.story || p.desc)}</p>
          <a href="#/story" class="btn btn-ghost btn-sm mt-4 !px-0">Baca kisah kuliner lainnya <i data-lucide="arrow-right" class="h-3.5 w-3.5"></i></a>
        </div>
      </div>
    </div>

    <div class="mt-16 border-t border-pajoh-green/10 pt-10">
      <div class="flex items-end justify-between">
        <div>
          ${sectionEyebrow('Lainnya')}
          <h2 class="serif mt-2 text-3xl font-semibold text-pajoh-green">Mungkin Anda juga suka</h2>
        </div>
        <a href="#/menu" class="hidden text-[11.5px] font-bold uppercase tracking-[0.14em] text-pajoh-green/70 hover:text-pajoh-green sm:block">Semua menu</a>
      </div>
      <div id="related-grid" class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${related.map(productCardHtml).join('')}</div>
    </div>
  </section>`;
}

export function mountProductPage() {
  const qtyInput = document.getElementById('pd-qty');
  const minusBtn = document.getElementById('pd-qty-minus');
  const plusBtn = document.getElementById('pd-qty-plus');
  const addBtn = document.getElementById('pd-add-btn');

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      const curr = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = String(Math.max(1, curr - 1));
    });
  }
  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      const curr = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = String(Math.min(20, curr + 1));
    });
  }
  if (addBtn && qtyInput) {
    addBtn.addEventListener('click', () => {
      const id = addBtn.dataset.productId;
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const res = addToCart(id, qty);
      if (!res.ok) {
        showToast(res.reason, 'error');
        return;
      }
      updateCartBadge();
      showToast(`${res.product.name} (${qty}) ditambahkan ke keranjang.`);
    });
  }

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    relatedGrid.querySelectorAll('[data-add-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const res = addToCart(btn.dataset.addCart, 1);
        if (!res.ok) {
          showToast(res.reason, 'error');
          return;
        }
        updateCartBadge();
        showToast(`${res.product.name} (1) ditambahkan ke keranjang.`);
      });
    });
  }

  bindImageFallbacks(document.getElementById('app'));
  renderIcons();
}
