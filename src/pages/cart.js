import { changeCartQty, removeFromCart, state } from '../state/store.js';
import { emptyStateHtml, sectionEyebrow, showToast } from '../components/ui.js';
import { updateCartBadge } from '../components/layout.js';
import { escapeHtml, formatRupiah } from '../utils/format.js';
import { calculateCartSummary } from '../utils/menuFilter.js';
import { bindImageFallbacks, renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

function cartRowHtml(entry) {
  const p = entry.p;
  const line = entry.q * Number(p.price || 0);
  return `
  <div class="flex gap-3 rounded-2xl border border-pajoh-green/10 bg-white p-3.5 sm:gap-4 sm:p-4">
    <a href="#/product/${encodeURIComponent(p.id)}" class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-pajoh-sand sm:h-24 sm:w-24">
      ${renderImgTag(p, 'h-full w-full object-cover')}
    </a>
    <div class="flex min-w-0 flex-1 flex-col justify-between">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A6A1F]">${escapeHtml(p.category)}</p>
          <a href="#/product/${encodeURIComponent(p.id)}" class="serif block truncate text-lg font-semibold leading-tight text-pajoh-green hover:text-[#8A6A1F] sm:text-xl">${escapeHtml(p.name)}</a>
          <p class="mt-0.5 truncate text-[11.5px] text-pajoh-ink/50">${escapeHtml(p.subtitle)} · <span class="tabular-nums">${formatRupiah(p.price)}</span></p>
        </div>
        <button type="button" data-cart-remove="${escapeHtml(p.id)}" class="shrink-0 rounded-lg p-2 text-pajoh-ink/40 transition hover:bg-red-50 hover:text-red-600 cursor-pointer" aria-label="Hapus ${escapeHtml(p.name)} dari keranjang">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
        </button>
      </div>
      <div class="mt-2.5 flex items-end justify-between gap-2">
        <div class="flex items-center rounded-full border border-pajoh-green/15">
          <button type="button" data-cart-delta="-1" data-cart-id="${escapeHtml(p.id)}" class="flex h-9 w-9 items-center justify-center text-pajoh-green transition hover:bg-pajoh-ivory cursor-pointer" aria-label="Kurangi jumlah ${escapeHtml(p.name)}">
            <i data-lucide="minus" class="h-3.5 w-3.5"></i>
          </button>
          <span class="tabular-nums w-8 text-center text-[13px] font-bold text-pajoh-green">${entry.q}</span>
          <button type="button" data-cart-delta="1" data-cart-id="${escapeHtml(p.id)}" class="flex h-9 w-9 items-center justify-center text-pajoh-green transition hover:bg-pajoh-ivory cursor-pointer" aria-label="Tambah jumlah ${escapeHtml(p.name)}">
            <i data-lucide="plus" class="h-3.5 w-3.5"></i>
          </button>
        </div>
        <p class="tabular-nums text-[14.5px] font-bold text-pajoh-green">${formatRupiah(line)}</p>
      </div>
    </div>
  </div>`;
}

export function renderCartPage() {
  const { entries, count, subtotal, freeDeliveryEligible } = calculateCartSummary(
    state.products,
    state.cart
  );

  if (!entries.length) {
    return `<section class="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:py-24">
      ${emptyStateHtml(
        'shopping-bag',
        'Keranjang masih kosong',
        'Belum ada hidangan yang dipilih. Mulai dari Sie Reuboh yang legendaris, atau sambal ganja yang bikin nambah.',
        '#/menu',
        'Jelajahi Menu'
      )}
    </section>`;
  }

  const remainingForFree = Math.max(0, 250000 - subtotal);

  return `
  <section class="mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pt-14">
    <div class="flex items-end justify-between">
      <div>
        ${sectionEyebrow('Keranjang')}
        <h1 class="serif mt-3 text-4xl font-semibold text-pajoh-green sm:text-5xl">Pesanan Anda</h1>
      </div>
      <a href="#/menu" class="hidden text-[11.5px] font-bold uppercase tracking-[0.14em] text-pajoh-green/70 underline underline-offset-4 hover:text-pajoh-green sm:block">Tambah hidangan</a>
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-12">
      <div class="space-y-3 lg:col-span-8">
        ${entries.map(cartRowHtml).join('')}
        <a href="#/menu" class="btn btn-ghost btn-sm mt-2 !px-0 text-pajoh-green/75">
          <i data-lucide="arrow-left" class="h-3.5 w-3.5"></i> Lanjut pilih hidangan
        </a>
      </div>

      <aside class="lg:col-span-4">
        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-6 shadow-soft lg:sticky lg:top-28">
          <h2 class="serif text-2xl font-semibold text-pajoh-green">Ringkasan</h2>
          <div class="mt-4 space-y-2.5 text-[13.5px]">
            <div class="flex justify-between text-pajoh-ink/70">
              <span>Subtotal (<span class="tabular-nums">${count}</span> item)</span>
              <span class="tabular-nums font-semibold text-pajoh-ink/85">${formatRupiah(subtotal)}</span>
            </div>
            <div class="flex justify-between text-pajoh-ink/70">
              <span>Pengiriman Banda Aceh</span>
              <span class="font-semibold text-pajoh-green">${freeDeliveryEligible ? 'Gratis' : 'Menyusul'}</span>
            </div>
            <div class="flex justify-between text-pajoh-ink/70">
              <span>Biaya penanganan</span>
              <span class="tabular-nums font-semibold text-pajoh-green">Rp 0</span>
            </div>
          </div>
          ${
            !freeDeliveryEligible
              ? `<p class="mt-3 rounded-xl bg-pajoh-ivory px-3 py-2 text-[11.5px] text-pajoh-green/80">Tambah <span class="tabular-nums font-bold">${formatRupiah(remainingForFree)}</span> lagi untuk gratis ongkir Banda Aceh.</p>`
              : `<p class="mt-3 rounded-xl bg-pajoh-green/10 px-3 py-2 text-[11.5px] font-semibold text-pajoh-green">Pesanan Anda memenuhi syarat gratis ongkir Banda Aceh.</p>`
          }
          <div class="mt-4 flex items-center justify-between border-t border-dashed border-pajoh-green/15 pt-4">
            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-pajoh-green/60">Total</span>
            <span class="serif tabular-nums text-2xl font-bold text-pajoh-green">${formatRupiah(subtotal)}</span>
          </div>
          <a href="#/checkout" class="btn btn-primary mt-5 w-full">
            Lanjut ke Checkout <i data-lucide="arrow-right" class="h-4 w-4"></i>
          </a>
          <div class="mt-4 flex items-center gap-2.5 rounded-xl bg-pajoh-sand/75 p-3 text-[11px] text-pajoh-ink/65">
            <i data-lucide="shield-check" class="h-4 w-4 shrink-0 text-pajoh-green/70"></i>
            <span>Tanpa pembayaran di muka. Konfirmasi dan pembayaran diatur langsung dengan dapur.</span>
          </div>
        </div>
      </aside>
    </div>
  </section>`;
}

export function mountCartPage(rerenderCurrentRoute) {
  const app = document.getElementById('app');
  if (!app) return;

  app.querySelectorAll('[data-cart-delta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cartId;
      const delta = Number(btn.dataset.cartDelta);
      changeCartQty(id, delta);
      updateCartBadge();
      rerenderCurrentRoute();
    });
  });

  app.querySelectorAll('[data-cart-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cartRemove;
      const removed = removeFromCart(id);
      updateCartBadge();
      showToast(`${removed ? removed.name : 'Item'} dihapus dari keranjang.`);
      rerenderCurrentRoute();
    });
  });

  bindImageFallbacks(app);
  renderIcons();
}
