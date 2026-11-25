import { clearCart, state, ui } from '../state/store.js';
import { emptyStateHtml, sectionEyebrow, showToast } from '../components/ui.js';
import { updateCartBadge } from '../components/layout.js';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  escapeHtml,
  formatRupiah,
  formatWaDisplay,
  validateCheckoutForm,
} from '../utils/format.js';
import { calculateCartSummary } from '../utils/menuFilter.js';
import { bindImageFallbacks, renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

function orderSuccessHtml() {
  const o = ui.lastOrder;
  const dateText = o.createdAt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const totalItems =
    Number(o.totalItems) ||
    o.items.reduce((sum, it) => sum + Math.max(0, Number(it.q || 0)), 0);
  const waDisplay = formatWaDisplay(state.settings.wa);

  return `
  <section class="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:py-20">
    <div class="fade-up rounded-[2rem] border border-pajoh-green/10 bg-white p-6 shadow-soft sm:p-10">
      <div class="text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pajoh-green/10 text-pajoh-green">
          <i data-lucide="party-popper" class="h-7 w-7"></i>
        </span>
        <p class="mt-4 text-[11px] font-bold uppercase tracking-[0.26em] text-[#8A6A1F]">Terima kasih, ${escapeHtml(o.name.split(' ')[0])}</p>
        <h1 class="serif mt-2 text-3xl font-semibold text-pajoh-green sm:text-4xl">Pesanan siap dikirim ke WhatsApp</h1>
        <p class="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-pajoh-ink/65">Klik tombol di bawah untuk membuka WhatsApp <strong class="font-semibold text-pajoh-green">${escapeHtml(waDisplay)}</strong> dengan teks rincian pesanan yang sudah terisi otomatis.</p>
      </div>

      <div class="mt-7 rounded-2xl bg-pajoh-ivory p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-pajoh-green/15 pb-3">
          <p class="serif text-lg font-semibold text-pajoh-green">Struk Pesanan · ${escapeHtml(o.orderCode)}</p>
          <p class="text-[11px] uppercase tracking-[0.14em] text-pajoh-ink/50">${escapeHtml(dateText)}</p>
        </div>
        <div class="mt-3 space-y-2 text-[13px]">
          ${o.items
            .map(
              (it) =>
                `<div class="flex justify-between gap-3">
                  <span class="text-pajoh-ink/80">${escapeHtml(it.p.name)} <span class="tabular-nums text-pajoh-ink/50">(${it.q} × ${formatRupiah(it.p.price)})</span></span>
                  <span class="tabular-nums shrink-0 font-semibold text-pajoh-green">${formatRupiah(it.q * it.p.price)}</span>
                </div>`
            )
            .join('')}
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-pajoh-green/15 pt-3">
          <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-pajoh-green/60">Total (${totalItems} item)</span>
          <span class="serif tabular-nums text-xl font-bold text-pajoh-green">${formatRupiah(o.total)}</span>
        </div>
        <div class="mt-3 grid gap-1 text-[12px] text-pajoh-ink/65">
          <p>Metode: ${o.method === 'pickup' ? 'Ambil langsung di dapur' : 'Pengiriman kurir'}</p>
          <p>${o.method === 'pickup' ? `Lokasi: ${escapeHtml(state.settings.address)}` : `Alamat: ${escapeHtml(o.address)}`}</p>
          ${o.note ? `<p>Catatan: ${escapeHtml(o.note)}</p>` : ''}
        </div>
      </div>

      <div class="mt-4 rounded-2xl border border-pajoh-green/10 bg-pajoh-sand/45 p-4">
        <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-green/65">Teks Pesanan Otomatis WhatsApp</p>
        <pre id="wa-message-preview" class="mt-2 whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-pajoh-ink/80">${escapeHtml(o.message)}</pre>
      </div>

      <div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <a id="checkout-wa-link" href="${escapeHtml(o.url)}" target="_blank" rel="noopener" class="btn btn-primary flex-1">
          <i data-lucide="message-circle" class="h-4 w-4"></i> Kirim ke WhatsApp (${escapeHtml(waDisplay)})
        </a>
        <button type="button" id="copy-receipt-btn" class="btn btn-outline flex-1">
          <i data-lucide="clipboard-list" class="h-4 w-4"></i> Salin Struk
        </button>
        <a href="#/menu" id="back-to-menu-order" class="btn btn-ghost flex-1">Tambah Pesanan Lain</a>
      </div>
      <button type="button" id="reset-order-view-btn" class="mt-4 w-full text-[12px] font-semibold text-pajoh-green/55 underline underline-offset-4 hover:text-pajoh-green cursor-pointer">
        Buat pesanan baru
      </button>
    </div>
  </section>`;
}

export function renderCheckoutPage() {
  if (ui.lastOrder) return orderSuccessHtml();

  const { entries, count, subtotal, freeDeliveryEligible } = calculateCartSummary(
    state.products,
    state.cart
  );

  if (!entries.length) {
    return `<section class="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:py-24">
      ${emptyStateHtml(
        'clipboard-list',
        'Belum ada pesanan',
        'Keranjang Anda kosong, jadi checkout belum bisa dilanjutkan. Pilih hidangan terlebih dahulu, lalu kembali ke halaman ini.',
        '#/menu',
        'Pilih Hidangan'
      )}
    </section>`;
  }

  return `
  <section class="mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pt-14">
    <nav class="flex items-center gap-2 text-[12px] text-pajoh-green/55" aria-label="Breadcrumb">
      <a href="#/cart" class="transition hover:text-pajoh-green">Keranjang</a>
      <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
      <span class="text-pajoh-green/85">Checkout</span>
    </nav>
    <div class="mt-4">
      ${sectionEyebrow('Langkah Terakhir')}
      <h1 class="serif mt-3 text-4xl font-semibold text-pajoh-green sm:text-5xl">Checkout</h1>
      <p class="mt-3 max-w-xl text-[14px] leading-relaxed text-pajoh-ink/65">Isi data pengiriman. Setelah tombol ditekan, struk pesanan Anda siap dikirim ke WhatsApp Dapur Pajôh.</p>
    </div>

    <form id="checkout-form" novalidate class="mt-8 grid gap-6 lg:grid-cols-12">
      <div class="space-y-4 lg:col-span-7">
        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-pajoh-green text-[11px] font-bold text-white">1</span>
            <h2 class="serif text-xl font-semibold text-pajoh-green">Data Pemesan</h2>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="co-name">Nama Pelanggan *</label>
              <input id="co-name" name="name" type="text" class="input" placeholder="Nama lengkap" autocomplete="name" />
              <p class="err-msg" id="err-name"></p>
            </div>
            <div>
              <label class="label" for="co-phone">No. HP / WhatsApp *</label>
              <input id="co-phone" name="phone" type="tel" class="input" placeholder="08xx xxxx xxxx" autocomplete="tel" />
              <p class="err-msg" id="err-phone"></p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-pajoh-green text-[11px] font-bold text-white">2</span>
            <h2 class="serif text-xl font-semibold text-pajoh-green">Metode Pesanan</h2>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label data-method-card="kurir" class="cursor-pointer rounded-xl border-2 border-pajoh-gold bg-pajoh-ivory p-4 transition">
              <input type="radio" name="co-method" value="kurir" class="sr-only" checked />
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2 text-[13px] font-bold text-pajoh-green"><i data-lucide="truck" class="h-4 w-4"></i> Pengiriman Kurir</span>
                <i data-lucide="check-circle-2" data-method-indicator class="h-4 w-4 text-pajoh-green"></i>
              </div>
              <p class="mt-1.5 text-[12px] leading-relaxed text-pajoh-ink/60">Diantar ke alamat Anda di area Banda Aceh.</p>
            </label>
            <label data-method-card="pickup" class="cursor-pointer rounded-xl border-2 border-pajoh-green/15 bg-white p-4 transition">
              <input type="radio" name="co-method" value="pickup" class="sr-only" />
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2 text-[13px] font-bold text-pajoh-green"><i data-lucide="store" class="h-4 w-4"></i> Ambil Langsung</span>
                <i data-lucide="circle" data-method-indicator class="h-4 w-4 text-pajoh-green/30"></i>
              </div>
              <p class="mt-1.5 text-[12px] leading-relaxed text-pajoh-ink/60">Self-pickup di dapur Peunayong.</p>
            </label>
          </div>

          <div id="co-address-wrap" class="mt-4">
            <label class="label" for="co-address">Alamat Lengkap *</label>
            <textarea id="co-address" name="address" rows="3" class="textarea" placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, patokan…"></textarea>
            <p class="err-msg" id="err-address"></p>
          </div>

          <div id="pickup-info" class="mt-4 hidden rounded-xl bg-pajoh-sand/80 p-4">
            <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-pajoh-green/65">Alamat Pengambilan</p>
            <p class="mt-1.5 text-[13.5px] font-semibold text-pajoh-green">${escapeHtml(state.settings.address)}</p>
            <p class="mt-1 text-[12px] text-pajoh-ink/60">${escapeHtml(state.settings.hours)} · Cari papan kayu bertuliskan Pajôh.</p>
          </div>
        </div>

        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
          <div class="flex items-center gap-2.5">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-pajoh-green text-[11px] font-bold text-white">3</span>
            <h2 class="serif text-xl font-semibold text-pajoh-green">Catatan Pesanan</h2>
          </div>
          <label class="label mt-4" for="co-note">Opsional</label>
          <textarea id="co-note" name="note" rows="3" class="textarea" placeholder="Contoh: tanpa cabai, kirim sore setelah pukul 16.00, tambahkan 2 sendok sambal…"></textarea>
          <p class="mt-2 text-[11.5px] text-pajoh-ink/50">Permintaan khusus akan dikonfirmasi dapur melalui WhatsApp.</p>
        </div>
      </div>

      <aside class="lg:col-span-5">
        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5 shadow-soft lg:sticky lg:top-28 sm:p-6">
          <h2 class="serif text-xl font-semibold text-pajoh-green">Ringkasan Belanja</h2>
          <div class="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
            ${entries
              .map(
                (e) => `<div class="flex items-start gap-3">
                  <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-pajoh-sand">${renderImgTag(e.p, 'h-full w-full object-cover')}</div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-semibold text-pajoh-green">${escapeHtml(e.p.name)}</p>
                    <p class="tabular-nums text-[11px] text-pajoh-ink/50">${e.q} × ${formatRupiah(e.p.price)}</p>
                  </div>
                  <p class="tabular-nums text-[12.5px] font-bold text-pajoh-green">${formatRupiah(e.q * e.p.price)}</p>
                </div>`
              )
              .join('')}
          </div>
          <div class="mt-4 space-y-2 border-t border-dashed border-pajoh-green/15 pt-4 text-[13.5px]">
            <div class="flex justify-between text-pajoh-ink/70"><span>Subtotal (<span class="tabular-nums">${count}</span> item)</span><span class="tabular-nums font-semibold">${formatRupiah(subtotal)}</span></div>
            <div class="flex justify-between text-pajoh-ink/70"><span>Pengiriman</span><span class="font-semibold text-pajoh-green">${freeDeliveryEligible ? 'Gratis' : 'Menyusul'}</span></div>
            <div class="flex justify-between text-pajoh-ink/70"><span>Biaya penanganan</span><span class="tabular-nums font-semibold text-pajoh-green">Rp 0</span></div>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-pajoh-green/15 pt-4">
            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-pajoh-green/60">Total Bayar (${count} item)</span>
            <span class="serif tabular-nums text-2xl font-bold text-pajoh-green">${formatRupiah(subtotal)}</span>
          </div>
          <button type="submit" class="btn btn-primary mt-5 w-full">
            <i data-lucide="message-circle" class="h-4 w-4"></i> Konfirmasi &amp; Kirim WhatsApp
          </button>
          <p class="mt-3 text-center text-[11px] leading-relaxed text-pajoh-ink/50">Pesan WhatsApp ke <strong class="font-semibold text-pajoh-green">${escapeHtml(formatWaDisplay(state.settings.wa))}</strong> berisi daftar menu, jumlah item, dan total harga dibuat otomatis.</p>
        </div>
      </aside>
    </form>
  </section>`;
}

export function mountCheckoutPage(rerenderCurrentRoute) {
  const app = document.getElementById('app');
  if (!app) return;

  if (ui.lastOrder) {
    const copyBtn = document.getElementById('copy-receipt-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(ui.lastOrder.message);
          showToast('Teks struk berhasil disalin.');
        } catch {
          showToast('Gagal menyalin struk. Gunakan tombol Kirim via WhatsApp.', 'error');
        }
      });
    }
    const resetBtn = document.getElementById('reset-order-view-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        ui.lastOrder = null;
        rerenderCurrentRoute();
      });
    }
    const menuLink = document.getElementById('back-to-menu-order');
    if (menuLink) {
      menuLink.addEventListener('click', () => {
        ui.lastOrder = null;
      });
    }
    renderIcons();
    return;
  }

  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.querySelectorAll('input[name="co-method"]').forEach((radio) => {
    radio.addEventListener('change', () => setMethod(radio.value));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('co-name');
    const phoneEl = document.getElementById('co-phone');
    const addressEl = document.getElementById('co-address');
    const noteEl = document.getElementById('co-note');
    const methodEl = form.querySelector('input[name="co-method"]:checked');

    const name = (nameEl?.value || '').trim();
    const phoneRaw = (phoneEl?.value || '').trim();
    const method = methodEl?.value || 'kurir';
    const address = (addressEl?.value || '').trim();
    const note = (noteEl?.value || '').trim();

    setFieldError('co-name', 'err-name', '');
    setFieldError('co-phone', 'err-phone', '');
    setFieldError('co-address', 'err-address', '');

    const { valid, errors } = validateCheckoutForm({
      name,
      phone: phoneRaw,
      method,
      address,
    });

    if (!valid) {
      if (errors.name) setFieldError('co-name', 'err-name', errors.name);
      if (errors.phone) setFieldError('co-phone', 'err-phone', errors.phone);
      if (errors.address) setFieldError('co-address', 'err-address', errors.address);
      const firstErr = form.querySelector('.is-err');
      if (firstErr) firstErr.focus();
      showToast('Mohon lengkapi data yang ditandai merah.', 'error');
      return;
    }

    const { entries, count, subtotal, freeDeliveryEligible } = calculateCartSummary(
      state.products,
      state.cart
    );
    if (!entries.length) {
      showToast('Keranjang kosong.', 'error');
      rerenderCurrentRoute();
      return;
    }

    const order = {
      orderCode: 'PJH-' + Math.floor(1000 + Math.random() * 9000),
      name,
      phone: phoneRaw,
      method,
      address: method === 'kurir' ? address : state.settings.address,
      note,
      items: entries.map((entry) => ({
        p: {
          id: entry.p.id,
          name: entry.p.name,
          subtitle: entry.p.subtitle,
          price: entry.p.price,
          image: entry.p.image,
        },
        q: entry.q,
      })),
      totalItems: count,
      freeDeliveryEligible,
      subtotal,
      total: subtotal,
      createdAt: new Date(),
    };

    order.message = buildWhatsAppOrderMessage(order, state.settings);
    order.url = buildWhatsAppUrl(state.settings.wa, order.message);

    ui.lastOrder = order;
    clearCart();
    updateCartBadge();
    rerenderCurrentRoute();
    showToast('Struk pesanan siap dikirim ke WhatsApp.');
  });

  bindImageFallbacks(app);
  renderIcons();
}

function setMethod(method) {
  ui.method = method;
  const addressWrap = document.getElementById('co-address-wrap');
  const pickupInfo = document.getElementById('pickup-info');
  if (addressWrap) addressWrap.classList.toggle('hidden', method !== 'kurir');
  if (pickupInfo) pickupInfo.classList.toggle('hidden', method !== 'pickup');

  document.querySelectorAll('[data-method-card]').forEach((card) => {
    const active = card.dataset.methodCard === method;
    card.classList.toggle('border-pajoh-gold', active);
    card.classList.toggle('bg-pajoh-ivory', active);
    card.classList.toggle('border-pajoh-green/15', !active);
    card.classList.toggle('bg-white', !active);
    const ind = card.querySelector('[data-method-indicator]');
    if (ind) {
      ind.setAttribute('data-lucide', active ? 'check-circle-2' : 'circle');
      ind.className = `h-4 w-4 ${active ? 'text-pajoh-green' : 'text-pajoh-green/30'}`;
    }
  });
  renderIcons();
}

function setFieldError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (message) {
    if (input) input.classList.add('is-err');
    if (err) {
      err.textContent = message;
      err.classList.add('show');
    }
  } else {
    if (input) input.classList.remove('is-err');
    if (err) {
      err.textContent = '';
      err.classList.remove('show');
    }
  }
}
