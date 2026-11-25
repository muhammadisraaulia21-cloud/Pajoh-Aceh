import { state, ui } from '../state/store.js';
import { buildWhatsAppUrl, escapeHtml, formatRupiah, formatWaDisplay } from '../utils/format.js';
import { calculateCartSummary } from '../utils/menuFilter.js';
import { bindImageFallbacks, renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

export function renderShell(activePath) {
  renderHeader(activePath);
  renderFooter();
  renderSearchShell();
  updateCartBadge();
  renderIcons();
}

export function renderHeader(activePath) {
  const root = document.getElementById('site-header-root');
  if (!root) return;
  const s = state.settings;

  const navLinks = [
    { path: 'home', href: '#/home', label: 'Beranda' },
    { path: 'menu', href: '#/menu', label: 'Menu' },
    { path: 'story', href: '#/story', label: 'Kisah Kuliner' },
    { path: 'about', href: '#/about', label: 'Tentang' },
    { path: 'contact', href: '#/contact', label: 'Kontak' },
  ];

  root.innerHTML = `
  <div class="fixed inset-x-0 top-0 z-50">
    <div class="bg-pajoh-green text-pajoh-ivory">
      <div class="mx-auto flex h-[30px] max-w-[1400px] items-center justify-center gap-2 px-4 text-[10.5px] tracking-[0.1em]">
        <i data-lucide="sparkles" class="h-3 w-3 shrink-0 text-pajoh-gold"></i>
        <p id="announcement-text" class="truncate uppercase">${escapeHtml(s.announcement || 'Authentic Taste, Heritage of Aceh')}</p>
      </div>
    </div>
    <header class="border-b border-pajoh-green/10 bg-pajoh-ivory/90 backdrop-blur-xl">
      <div class="mx-auto flex h-[66px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <a href="#/home" class="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0" aria-label="Beranda Pajôh">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5] ring-1 ring-pajoh-gold/60 shadow-sm">
            <img src="/assets/aistudio/logo_pajoh_2b85c88f.png" alt="Logo Pajôh" class="h-full w-full object-cover scale-[1.16]" />
          </span>
          <span class="serif text-[30px] font-bold leading-none tracking-tight text-pajoh-green">Pajôh</span>
        </a>

        <nav class="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
          ${navLinks
            .map(
              (link) =>
                `<a href="${link.href}" data-nav="${link.path}" class="nav-link ${activePath === link.path ? 'active' : ''}">${link.label}</a>`
            )
            .join('')}
        </nav>

        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" id="open-search-btn" class="icon-btn" aria-label="Cari menu">
            <i data-lucide="search" class="h-[18px] w-[18px]"></i>
          </button>
          <a href="#/cart" class="icon-btn relative" aria-label="Keranjang belanja">
            <i data-lucide="shopping-bag" class="h-[18px] w-[18px]"></i>
            <span data-cart-count class="tabular-nums absolute -right-0.5 -top-0.5 hidden min-w-[18px] rounded-full bg-pajoh-gold px-1 text-center text-[10px] font-bold leading-[18px] text-pajoh-forest">0</span>
          </a>
          <a href="#/admin" class="btn btn-outline btn-sm ml-1 hidden sm:inline-flex ${activePath === 'admin' ? '!border-pajoh-green !bg-pajoh-green !text-pajoh-ivory' : ''}" aria-label="Admin Dashboard">
            <i data-lucide="layout-dashboard" class="h-4 w-4"></i><span>Admin</span>
          </a>
          <button type="button" id="toggle-mobile-nav-btn" class="icon-btn lg:hidden" aria-label="Buka menu navigasi" aria-expanded="${ui.mobileNav ? 'true' : 'false'}">
            <i data-lucide="menu" class="h-5 w-5"></i>
          </button>
        </div>
      </div>

      <div id="mobile-nav" class="${ui.mobileNav ? '' : 'hidden '}border-t border-pajoh-green/10 bg-pajoh-ivory px-4 pb-5 pt-2 lg:hidden">
        <nav class="flex flex-col divide-y divide-pajoh-green/10" aria-label="Navigasi seluler">
          <a href="#/home" class="py-3 text-sm font-semibold text-pajoh-green">Beranda</a>
          <a href="#/menu" class="py-3 text-sm font-semibold text-pajoh-green">Menu</a>
          <a href="#/story" class="py-3 text-sm font-semibold text-pajoh-green">Kisah Kuliner</a>
          <a href="#/about" class="py-3 text-sm font-semibold text-pajoh-green">Tentang Kami</a>
          <a href="#/contact" class="py-3 text-sm font-semibold text-pajoh-green">Kontak</a>
          <a href="#/cart" class="py-3 text-sm font-semibold text-pajoh-green">Keranjang</a>
          <a href="#/admin" class="py-3 text-sm font-semibold text-[#8A6A1F]">Admin Dashboard</a>
        </nav>
      </div>
    </header>
  </div>`;

  const searchBtn = document.getElementById('open-search-btn');
  if (searchBtn) searchBtn.addEventListener('click', openSearchModal);

  const mobBtn = document.getElementById('toggle-mobile-nav-btn');
  if (mobBtn) mobBtn.addEventListener('click', toggleMobileNav);
}

export function renderFooter() {
  const root = document.getElementById('site-footer-root');
  if (!root) return;
  const s = state.settings;
  const waHref = buildWhatsAppUrl(
    s.wa,
    'Halo Pajôh, saya ingin bertanya tentang menu dan jadwal pengiriman. Terima kasih!'
  );
  const igHref = s.instagram || 'https://www.instagram.com/mhdsraa/';
  const emailAddr = s.email || 'muhammadisraaulia21@gmail.com';

  root.innerHTML = `
  <footer class="relative overflow-hidden bg-pajoh-forest text-pajoh-ivory">
    <div class="aceh-band opacity-30"></div>
    <div class="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-10">
      <div class="lg:col-span-2">
        <div class="flex items-center gap-4">
          <span class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5] ring-2 ring-pajoh-gold/70 shadow-lg">
            <img src="/assets/aistudio/logo_pajoh_2b85c88f.png" alt="Logo Pajôh" class="h-full w-full object-cover scale-[1.16]" />
          </span>
          <div>
            <p class="serif text-3xl font-bold leading-none">Pajôh</p>
            <p class="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-pajoh-gold">Authentic Taste, Heritage of Aceh</p>
          </div>
        </div>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-pajoh-ivory/65">Dapur rumahan di Banda Aceh yang menghidangkan resep indatu dengan rempah pilihan—tanpa pengawet, dimasak per pesanan.</p>
        <div class="mt-5 flex gap-2">
          <a href="${escapeHtml(igHref)}" target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-pajoh-ivory/75 transition hover:border-pajoh-gold hover:text-pajoh-gold" aria-label="Instagram Pajôh">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="mailto:${escapeHtml(emailAddr)}" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-pajoh-ivory/75 transition hover:border-pajoh-gold hover:text-pajoh-gold" aria-label="Surel Pajôh">
            <i data-lucide="mail" class="h-4 w-4"></i>
          </a>
          <a href="${escapeHtml(waHref)}" target="_blank" rel="noopener" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-pajoh-ivory/75 transition hover:border-pajoh-gold hover:text-pajoh-gold" aria-label="WhatsApp Pajôh"><i data-lucide="message-circle" class="h-4 w-4"></i></a>
        </div>
      </div>
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-pajoh-gold">Navigasi</p>
        <ul class="mt-4 space-y-2.5 text-sm text-pajoh-ivory/70">
          <li><a href="#/menu" class="transition hover:text-pajoh-gold">Menu Lengkap</a></li>
          <li><a href="#/story" class="transition hover:text-pajoh-gold">Kisah Kuliner</a></li>
          <li><a href="#/about" class="transition hover:text-pajoh-gold">Tentang Pajôh</a></li>
          <li><a href="#/cart" class="transition hover:text-pajoh-gold">Keranjang</a></li>
          <li><a href="#/admin" class="transition hover:text-pajoh-gold">Admin Dashboard</a></li>
        </ul>
      </div>
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-pajoh-gold">Dapur Kami</p>
        <ul class="mt-4 space-y-3 text-sm text-pajoh-ivory/70">
          <li class="flex gap-2.5"><i data-lucide="map-pin" class="mt-0.5 h-4 w-4 shrink-0 text-pajoh-gold/75"></i><span id="footer-address">${escapeHtml(s.address)}</span></li>
          <li class="flex gap-2.5"><i data-lucide="clock" class="mt-0.5 h-4 w-4 shrink-0 text-pajoh-gold/75"></i><span id="footer-hours">${escapeHtml(s.hours)}</span></li>
          <li class="flex gap-2.5"><i data-lucide="phone" class="mt-0.5 h-4 w-4 shrink-0 text-pajoh-gold/75"></i><a id="footer-wa" href="${escapeHtml(waHref)}" target="_blank" rel="noopener" class="transition hover:text-pajoh-gold">${escapeHtml(formatWaDisplay(s.wa))}</a></li>
          <li class="flex gap-2.5"><i data-lucide="mail" class="mt-0.5 h-4 w-4 shrink-0 text-pajoh-gold/75"></i><a id="footer-email" href="mailto:${escapeHtml(emailAddr)}" class="break-all transition hover:text-pajoh-gold">${escapeHtml(emailAddr)}</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 text-xs text-pajoh-ivory/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© ${new Date().getFullYear()} Pajôh. Seluruh hak cipta dilindungi.</p>
        <p>Aceh Heritage Kitchen · Banda Aceh.</p>
      </div>
    </div>
  </footer>`;
}

export function renderSearchShell() {
  const root = document.getElementById('search-root');
  if (!root || root.dataset.mounted === '1') return;
  root.dataset.mounted = '1';

  root.innerHTML = `
  <div id="search-modal" role="dialog" aria-modal="true" aria-label="Pencarian menu" class="fixed inset-0 z-[70] hidden">
    <div class="modal-backdrop absolute inset-0" data-close-search></div>
    <div class="relative mx-auto mt-24 w-[92%] max-w-xl rounded-2xl bg-white p-4 shadow-2xl fade-up sm:mt-32">
      <div class="flex items-center gap-3 border-b border-pajoh-green/10 pb-3">
        <i data-lucide="search" class="h-5 w-5 text-pajoh-green/45"></i>
        <label for="search-input" class="sr-only">Cari hidangan</label>
        <input id="search-input" type="text" autocomplete="off" class="w-full bg-transparent text-base text-pajoh-ink outline-none placeholder:text-pajoh-ink/35" placeholder="Cari sie reuboh, timphan, sambal…" />
        <button type="button" data-close-search class="rounded-lg p-2 text-pajoh-green/50 transition hover:bg-pajoh-ivory" aria-label="Tutup pencarian">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>
      <div id="search-results" class="mt-2 max-h-[50vh] overflow-y-auto"></div>
      <p class="mt-3 text-[10.5px] uppercase tracking-[0.18em] text-pajoh-green/45">Tekan Esc untuk menutup</p>
    </div>
  </div>`;

  root.querySelectorAll('[data-close-search]').forEach((el) => {
    el.addEventListener('click', closeSearchModal);
  });
  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', () => renderSearchResults(input.value));
  }
}

export function updateCartBadge() {
  const { count } = calculateCartSummary(state.products, state.cart);
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('hidden', count === 0);
  });
}

export function toggleMobileNav() {
  const panel = document.getElementById('mobile-nav');
  const btn = document.getElementById('toggle-mobile-nav-btn');
  if (!panel) return;
  ui.mobileNav = !ui.mobileNav;
  panel.classList.toggle('hidden', !ui.mobileNav);
  if (btn) btn.setAttribute('aria-expanded', ui.mobileNav ? 'true' : 'false');
}

export function closeMobileNav() {
  const panel = document.getElementById('mobile-nav');
  const btn = document.getElementById('toggle-mobile-nav-btn');
  if (!panel) return;
  ui.mobileNav = false;
  panel.classList.add('hidden');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

export function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  renderSearchResults('');
  setTimeout(() => {
    if (input) input.focus();
  }, 40);
}

export function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot || !modalRoot.innerHTML.trim()) {
    document.body.style.overflow = '';
  }
}

export function renderSearchResults(query) {
  const root = document.getElementById('search-results');
  if (!root) return;
  const q = String(query || '').trim().toLowerCase();
  const list = state.products
    .filter((p) => {
      if (!q) return true;
      return [p.name, p.subtitle, p.desc, p.category]
        .concat(p.spices || [])
        .join(' ')
        .toLowerCase()
        .includes(q);
    })
    .slice(0, 6);

  if (!list.length) {
    root.innerHTML = `<div class="px-3 py-8 text-center">
      <p class="serif text-xl text-pajoh-green">Tidak ada hasil</p>
      <p class="mt-1 text-xs text-pajoh-ink/50">Coba kata lain seperti “reuboh”, “timphan”, atau “sambal”.</p>
    </div>`;
    return;
  }

  root.innerHTML = list
    .map(
      (p) => `<a href="#/product/${encodeURIComponent(p.id)}" data-search-pick class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-pajoh-ivory">
        <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-pajoh-gold/30">
          ${renderImgTag(p, 'h-full w-full object-cover')}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-pajoh-green">${escapeHtml(p.name)}</p>
          <p class="truncate text-[11px] text-pajoh-ink/50">${escapeHtml(p.category)} · ${escapeHtml(p.subtitle)}</p>
        </div>
        <span class="tabular-nums shrink-0 text-[12.5px] font-bold text-pajoh-green">${formatRupiah(p.price)}</span>
      </a>`
    )
    .join('');

  root.querySelectorAll('[data-search-pick]').forEach((a) => {
    a.addEventListener('click', closeSearchModal);
  });
  bindImageFallbacks(root);
  renderIcons();
}
