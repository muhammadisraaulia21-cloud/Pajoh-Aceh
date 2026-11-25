import { escapeHtml, formatRupiah } from '../utils/format.js';
import { renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

export function sectionEyebrow(text) {
  return `<div class="flex items-center gap-3">
    <span class="h-px w-8 bg-pajoh-gold" aria-hidden="true"></span>
    <span class="text-[11px] font-bold uppercase tracking-[0.26em] text-pajoh-green/65">${escapeHtml(text)}</span>
  </div>`;
}

export function statusTag(status) {
  const styles = {
    Tersedia: 'bg-pajoh-green text-pajoh-ivory',
    'Pre-Order': 'bg-pajoh-gold text-pajoh-forest',
    Habis: 'bg-pajoh-ink/75 text-white',
  };
  const tone = styles[status] || styles.Tersedia;
  return `<span class="inline-flex items-center rounded-md ${tone} px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap">${escapeHtml(status)}</span>`;
}

export function productCardHtml(product) {
  const soldOut = product.status === 'Habis';
  return `
  <article class="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-pajoh-green/10 bg-white">
    <a href="#/product/${encodeURIComponent(product.id)}" class="relative block aspect-[4/3] overflow-hidden bg-pajoh-sand" aria-label="Lihat detail ${escapeHtml(product.name)}">
      ${renderImgTag(product, 'h-full w-full object-cover transition duration-500 group-hover:scale-105')}
      <span class="absolute left-3 top-3">${statusTag(product.status)}</span>
      ${
        product.featured
          ? '<span class="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-pajoh-gold text-pajoh-forest shadow" title="Produk Unggulan"><i data-lucide="star" class="h-3.5 w-3.5"></i></span>'
          : ''
      }
    </a>
    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A1F]">
        <span>${escapeHtml(product.category)}</span>
      </div>
      <h3 class="serif mt-1.5 text-[22px] font-semibold leading-tight text-pajoh-green">
        <a href="#/product/${encodeURIComponent(product.id)}" class="hover:text-[#8A6A1F] transition-colors">${escapeHtml(product.name)}</a>
      </h3>
      <p class="mt-1 text-[11.5px] text-pajoh-ink/50">${escapeHtml(product.subtitle)}</p>
      <p class="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-pajoh-ink/65">${escapeHtml(product.desc)}</p>
      <div class="mt-auto flex items-end justify-between gap-2 border-t border-pajoh-green/10 pt-3.5 mt-4">
        <div>
          <p class="text-[10px] uppercase tracking-[0.16em] text-pajoh-ink/45">Harga</p>
          <p class="tabular-nums text-[15px] font-bold text-pajoh-green">${formatRupiah(product.price)}</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="#/product/${encodeURIComponent(product.id)}" class="flex h-10 w-10 items-center justify-center rounded-full border border-pajoh-green/20 text-pajoh-green transition hover:border-pajoh-green hover:bg-pajoh-green hover:text-white" aria-label="Lihat detail ${escapeHtml(product.name)}">
            <i data-lucide="eye" class="h-4 w-4"></i>
          </a>
          <button type="button" data-add-cart="${escapeHtml(product.id)}" ${soldOut ? 'disabled' : ''} class="flex h-10 w-10 items-center justify-center rounded-full bg-pajoh-green text-white transition hover:bg-pajoh-forest disabled:opacity-40 cursor-pointer" aria-label="Tambah ${escapeHtml(product.name)} ke keranjang">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
        </div>
      </div>
    </div>
  </article>`;
}

export function emptyStateHtml(icon, title, text, ctaHref, ctaLabel) {
  return `<div class="rounded-[2rem] border border-dashed border-pajoh-green/20 bg-white/75 px-6 py-16 text-center">
    <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green/55">
      <i data-lucide="${escapeHtml(icon)}" class="h-7 w-7"></i>
    </span>
    <p class="serif mt-4 text-3xl text-pajoh-green">${escapeHtml(title)}</p>
    <p class="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-pajoh-ink/60">${escapeHtml(text)}</p>
    <a href="${escapeHtml(ctaHref)}" class="btn btn-primary mt-6">${escapeHtml(ctaLabel)} <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
  </div>`;
}

export function showToast(message, type = 'success') {
  const root = document.getElementById('toasts');
  if (!root) return;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className =
    'pointer-events-auto flex max-w-xs items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-soft ring-1 ring-pajoh-green/15 toast-in';
  const icon = type === 'error' ? 'alert-circle' : 'check';
  const tone =
    type === 'error'
      ? 'bg-red-50 text-red-600'
      : 'bg-pajoh-green/10 text-pajoh-green';
  el.innerHTML = `<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tone}">
      <i data-lucide="${icon}" class="h-4 w-4"></i>
    </span>
    <p class="text-[13px] leading-snug text-pajoh-ink/85">${escapeHtml(message)}</p>`;
  root.appendChild(el);
  renderIcons();
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 260);
  }, 3000);
}

export function openConfirmModal({ title, message, confirmLabel = 'Ya, Lanjutkan', danger = false }) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    if (!root) {
      resolve(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    root.innerHTML = `
      <div id="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" class="fixed inset-0 z-[85] flex items-center justify-center p-4">
        <div class="modal-backdrop absolute inset-0" data-confirm-cancel></div>
        <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl fade-up">
          <h2 id="confirm-title" class="serif text-2xl font-semibold text-pajoh-green">${escapeHtml(title)}</h2>
          <p class="mt-2 text-[13.5px] leading-relaxed text-pajoh-ink/70">${escapeHtml(message)}</p>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" data-confirm-cancel class="btn btn-outline btn-sm">Batal</button>
            <button type="button" data-confirm-ok class="btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}">${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      </div>`;

    renderIcons();

    const cleanup = (result) => {
      root.innerHTML = '';
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
    };

    document.addEventListener('keydown', onKey);
    root.querySelectorAll('[data-confirm-cancel]').forEach((btn) => {
      btn.addEventListener('click', () => cleanup(false));
    });
    const okBtn = root.querySelector('[data-confirm-ok]');
    if (okBtn) {
      okBtn.addEventListener('click', () => cleanup(true));
      okBtn.focus();
    }
  });
}
