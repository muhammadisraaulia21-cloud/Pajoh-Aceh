import { addToCart, state, ui } from '../state/store.js';
import { productCardHtml, sectionEyebrow, showToast } from '../components/ui.js';
import { updateCartBadge } from '../components/layout.js';
import { escapeHtml } from '../utils/format.js';
import { filterAndSortProducts } from '../utils/menuFilter.js';
import { bindImageFallbacks } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

function categoryPillsHtml() {
  const cats = ['Semua', ...state.categories];
  return cats
    .map((c) => {
      const active = ui.menu.cat === c;
      return `<button type="button" data-menu-cat="${escapeHtml(c)}" class="shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
        active
          ? 'border-pajoh-green bg-pajoh-green text-pajoh-ivory shadow-sm'
          : 'border-pajoh-green/15 bg-white/75 text-pajoh-green/75 hover:border-pajoh-gold hover:text-pajoh-green'
      }">${escapeHtml(c)}</button>`;
    })
    .join('');
}

function menuGridHtml(list) {
  if (!list.length) {
    return `<div class="col-span-full rounded-2xl border border-dashed border-pajoh-green/20 bg-white/70 px-6 py-16 text-center">
      <i data-lucide="search-x" class="mx-auto h-8 w-8 text-pajoh-green/35"></i>
      <p class="serif mt-3 text-2xl text-pajoh-green">Hidangan tidak ditemukan</p>
      <p class="mt-1 text-[13.5px] text-pajoh-ink/60">Coba kata kunci lain atau reset filter untuk melihat seluruh menu.</p>
      <button type="button" id="empty-reset-menu" class="btn btn-outline btn-sm mt-5">Tampilkan semua menu</button>
    </div>`;
  }
  return list.map(productCardHtml).join('');
}

export function renderMenuPage() {
  const list = filterAndSortProducts(state.products, ui.menu);

  return `
  <section class="mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pt-14">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        ${sectionEyebrow('Katalog Hidangan')}
        <h1 class="serif mt-3 text-4xl font-semibold leading-none text-pajoh-green sm:text-5xl">Our Menu</h1>
        <p class="mt-3 max-w-xl text-[14px] leading-relaxed text-pajoh-ink/65">Hidangan warisan yang kami masak dengan rempah asli Aceh. Pilih lauk utama untuk meja makan, sambal untuk menemani, atau kue tradisional untuk acara istimewa.</p>
      </div>
      <p id="menu-count" class="tabular-nums text-[11.5px] font-semibold uppercase tracking-[0.18em] text-pajoh-green/60">${list.length} hidangan ditemukan</p>
    </div>

    <div class="mt-8 rounded-2xl border border-pajoh-green/10 bg-white/80 p-4 sm:p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative w-full lg:max-w-sm">
          <i data-lucide="search" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pajoh-green/45"></i>
          <label for="menu-search" class="sr-only">Cari hidangan</label>
          <input id="menu-search" type="text" value="${escapeHtml(ui.menu.q)}" placeholder="Cari nama hidangan, rempah…" class="input !pl-10" autocomplete="off" />
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <div>
            <label class="sr-only" for="menu-status">Filter Status</label>
            <select id="menu-status" class="select !w-auto min-w-[150px] !py-2 !text-[12.5px]">
              ${['Semua', 'Tersedia', 'Pre-Order', 'Habis']
                .map(
                  (s) =>
                    `<option value="${s}"${ui.menu.status === s ? ' selected' : ''}>Status: ${s}</option>`
                )
                .join('')}
            </select>
          </div>
          <div>
            <label class="sr-only" for="menu-sort">Urutkan Menu</label>
            <select id="menu-sort" class="select !w-auto min-w-[172px] !py-2 !text-[12.5px]">
              ${['Unggulan', 'Harga Terendah', 'Harga Tertinggi', 'A-Z']
                .map(
                  (s) =>
                    `<option value="${s}"${ui.menu.sort === s ? ' selected' : ''}>Urutkan: ${s}</option>`
                )
                .join('')}
            </select>
          </div>
        </div>
      </div>
      <div id="menu-pills" class="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">${categoryPillsHtml()}</div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <p class="text-[11px] uppercase tracking-[0.16em] text-pajoh-green/50">Rempah asli · Dimasak per pesanan</p>
      <button type="button" id="reset-menu-btn" class="text-[12px] font-semibold text-pajoh-green/70 underline decoration-pajoh-gold/70 underline-offset-4 transition hover:text-pajoh-green cursor-pointer">Reset filter</button>
    </div>

    <div id="menu-grid" class="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${menuGridHtml(list)}</div>
  </section>`;
}

export function mountMenuPage() {
  const searchInput = document.getElementById('menu-search');
  const statusSelect = document.getElementById('menu-status');
  const sortSelect = document.getElementById('menu-sort');
  const resetBtn = document.getElementById('reset-menu-btn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      ui.menu.q = searchInput.value;
      refreshMenuGrid();
    });
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      ui.menu.status = statusSelect.value;
      refreshMenuGrid();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      ui.menu.sort = sortSelect.value;
      refreshMenuGrid();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetMenuFilters);
  }

  bindMenuPills();
  bindMenuGridActions();
  bindImageFallbacks(document.getElementById('menu-grid'));
}

function bindMenuPills() {
  const pills = document.getElementById('menu-pills');
  if (!pills) return;
  pills.querySelectorAll('[data-menu-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.menu.cat = btn.dataset.menuCat || 'Semua';
      pills.innerHTML = categoryPillsHtml();
      bindMenuPills();
      refreshMenuGrid();
    });
  });
}

function bindMenuGridActions() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  grid.querySelectorAll('[data-add-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addCart;
      const res = addToCart(id, 1);
      if (!res.ok) {
        showToast(res.reason, 'error');
        return;
      }
      updateCartBadge();
      showToast(`${res.product.name} (1) ditambahkan ke keranjang.`);
    });
  });

  const emptyReset = document.getElementById('empty-reset-menu');
  if (emptyReset) {
    emptyReset.addEventListener('click', resetMenuFilters);
  }
}

function refreshMenuGrid() {
  const list = filterAndSortProducts(state.products, ui.menu);
  const grid = document.getElementById('menu-grid');
  const count = document.getElementById('menu-count');
  if (count) count.textContent = `${list.length} hidangan ditemukan`;
  if (grid) {
    grid.innerHTML = menuGridHtml(list);
    bindMenuGridActions();
    bindImageFallbacks(grid);
  }
  renderIcons();
}

function resetMenuFilters() {
  ui.menu = { q: '', cat: 'Semua', status: 'Semua', sort: 'Unggulan' };
  const searchInput = document.getElementById('menu-search');
  const statusSelect = document.getElementById('menu-status');
  const sortSelect = document.getElementById('menu-sort');
  const pills = document.getElementById('menu-pills');
  if (searchInput) searchInput.value = '';
  if (statusSelect) statusSelect.value = 'Semua';
  if (sortSelect) sortSelect.value = 'Unggulan';
  if (pills) {
    pills.innerHTML = categoryPillsHtml();
    bindMenuPills();
  }
  refreshMenuGrid();
}
