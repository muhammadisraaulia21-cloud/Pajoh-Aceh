import {
  addCategory,
  deleteProduct,
  deleteStory,
  exportStateJson,
  findProduct,
  findStory,
  getStorageUsageBytes,
  importStateJson,
  removeCategory,
  resetAllData,
  state,
  ui,
  updateBrandSettings,
  updatePromoSettings,
  updateStoryHeroSettings,
  upsertProduct,
  upsertStory,
} from '../state/store.js';
import {
  openConfirmModal,
  sectionEyebrow,
  showToast,
  statusTag,
} from '../components/ui.js';
import { renderHeader, renderFooter, updateCartBadge } from '../components/layout.js';
import {
  escapeHtml,
  formatRupiah,
  validateProductForm,
  validateStoryForm,
} from '../utils/format.js';
import {
  calculateCartSummary,
  countProductsInCategory,
} from '../utils/menuFilter.js';
import {
  bindImageFallbacks,
  compressImageFile,
  createDishFallbackDataUrl,
  renderImgTag,
} from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

const ADMIN_TABS = [
  { key: 'products', label: 'Kelola Produk', icon: 'package' },
  { key: 'stories', label: 'Kisah Kuliner', icon: 'book-open' },
  { key: 'promo', label: 'Promo & Kategori', icon: 'megaphone' },
  { key: 'settings', label: 'Pengaturan Brand & WA', icon: 'settings' },
];

export function renderAdminPage() {
  return `
  <section class="mx-auto max-w-[1400px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pt-12">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        ${sectionEyebrow('Admin Dashboard')}
        <h1 class="serif mt-3 text-4xl font-semibold text-pajoh-green sm:text-5xl">Dapur &amp; Katalog</h1>
        <p class="mt-2 max-w-xl text-[13.5px] leading-relaxed text-pajoh-ink/60">Kelola foto hidangan, harga, status stok, promo, dan pengaturan brand. Perubahan langsung tersinkronisasi ke seluruh toko.</p>
      </div>
      <a href="#/home" class="btn btn-outline btn-sm self-start sm:self-auto"><i data-lucide="external-link" class="h-3.5 w-3.5"></i> Lihat Situs</a>
    </div>

    <div class="mt-7 flex gap-2 overflow-x-auto border-b border-pajoh-green/10 pb-3 no-scrollbar" role="tablist" aria-label="Menu Admin">
      ${ADMIN_TABS.map((t) => {
        const active = ui.adminTab === t.key;
        return `<button type="button" role="tab" aria-selected="${active ? 'true' : 'false'}" data-admin-tab="${t.key}" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap transition cursor-pointer ${
          active
            ? 'bg-pajoh-green text-pajoh-ivory'
            : 'bg-transparent text-pajoh-green/65 hover:bg-white'
        }">
          <i data-lucide="${t.icon}" class="h-4 w-4"></i>${t.label}
        </button>`;
      }).join('')}
    </div>

    <div id="admin-content" class="mt-6">${adminContentHtml()}</div>
  </section>`;
}

function adminContentHtml() {
  if (ui.adminTab === 'stories') return adminStoriesHtml();
  if (ui.adminTab === 'promo') return adminPromoHtml();
  if (ui.adminTab === 'settings') return adminSettingsHtml();
  return adminProductsHtml();
}

function filteredAdminProducts() {
  const q = String(ui.adminSearch || '').trim().toLowerCase();
  if (!q) return state.products;
  return state.products.filter((p) =>
    [p.name, p.subtitle, p.category, p.status].join(' ').toLowerCase().includes(q)
  );
}

function adminProductsHtml() {
  const list = filteredAdminProducts();
  const featuredCount = state.products.filter((p) => p.featured).length;
  const availableCount = state.products.filter((p) => p.status === 'Tersedia').length;

  return `
  <div class="grid gap-3 sm:grid-cols-4">
    <div class="rounded-2xl border border-pajoh-green/10 bg-white p-4">
      <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-pajoh-green/55">Total Produk</p>
      <p class="serif tabular-nums mt-1 text-3xl font-bold text-pajoh-green">${state.products.length}</p>
    </div>
    <div class="rounded-2xl border border-pajoh-green/10 bg-white p-4">
      <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-pajoh-green/55">Tersedia</p>
      <p class="serif tabular-nums mt-1 text-3xl font-bold text-pajoh-green">${availableCount}</p>
    </div>
    <div class="rounded-2xl border border-pajoh-green/10 bg-white p-4">
      <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-pajoh-green/55">Unggulan Hero</p>
      <p class="serif tabular-nums mt-1 text-3xl font-bold text-pajoh-green">${featuredCount}</p>
    </div>
    <div class="rounded-2xl border border-pajoh-green/10 bg-white p-4">
      <p class="text-[10.5px] font-bold uppercase tracking-[0.16em] text-pajoh-green/55">Kategori</p>
      <p class="serif tabular-nums mt-1 text-3xl font-bold text-pajoh-green">${state.categories.length}</p>
    </div>
  </div>

  <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative w-full sm:max-w-xs">
      <i data-lucide="search" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pajoh-green/45"></i>
      <label for="admin-search" class="sr-only">Cari produk di admin</label>
      <input id="admin-search" type="text" value="${escapeHtml(ui.adminSearch)}" placeholder="Cari produk, kategori, status…" class="input !pl-10" autocomplete="off" />
    </div>
    <button type="button" id="admin-add-product-btn" class="btn btn-primary btn-sm">
      <i data-lucide="plus" class="h-4 w-4"></i> Tambah Produk
    </button>
  </div>

  <div class="mt-4 overflow-hidden rounded-2xl border border-pajoh-green/10 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[780px] text-left text-[13px]">
        <thead class="bg-pajoh-ivory text-[10px] uppercase tracking-[0.16em] text-pajoh-green/55">
          <tr>
            <th class="px-4 py-3 font-bold">Produk &amp; Foto</th>
            <th class="px-4 py-3 font-bold">Kategori</th>
            <th class="px-4 py-3 font-bold">Harga</th>
            <th class="px-4 py-3 font-bold">Status Stok</th>
            <th class="px-4 py-3 font-bold">Unggulan</th>
            <th class="px-4 py-3 text-right font-bold">Aksi</th>
          </tr>
        </thead>
        <tbody id="admin-product-tbody" class="divide-y divide-pajoh-green/10">
          ${adminProductRowsHtml(list)}
        </tbody>
      </table>
    </div>
  </div>
  <p class="mt-3 flex items-center gap-1.5 text-[11px] text-pajoh-ink/50">
    <i data-lucide="info" class="h-3.5 w-3.5"></i> Klik Edit untuk mengubah foto makanan (unggah file atau URL), harga, rempah, dan detail hidangan.
  </p>`;
}

function adminProductRowsHtml(list) {
  if (!list.length) {
    return `<tr><td colspan="6" class="px-4 py-10 text-center text-pajoh-ink/55">Tidak ada produk yang cocok dengan pencarian Anda.</td></tr>`;
  }
  return list
    .map(
      (p) => `<tr class="transition hover:bg-pajoh-ivory/60">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-pajoh-sand ring-1 ring-pajoh-green/10">${renderImgTag(p, 'h-full w-full object-cover')}</div>
            <div class="min-w-0">
              <a href="#/product/${encodeURIComponent(p.id)}" class="block max-w-[220px] truncate font-semibold text-pajoh-green hover:text-[#8A6A1F]">${escapeHtml(p.name)}</a>
              <p class="max-w-[220px] truncate text-[11px] text-pajoh-ink/45">${escapeHtml(p.subtitle)}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-pajoh-ink/70">${escapeHtml(p.category)}</td>
        <td class="tabular-nums px-4 py-3 font-semibold text-pajoh-green">${formatRupiah(p.price)}</td>
        <td class="px-4 py-3">${statusTag(p.status)}</td>
        <td class="px-4 py-3">${
          p.featured
            ? '<span class="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A6A1F]"><i data-lucide="star" class="h-3.5 w-3.5"></i> Ya</span>'
            : '<span class="text-xs text-pajoh-ink/35">—</span>'
        }</td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-end gap-2">
            <button type="button" data-edit-product="${escapeHtml(p.id)}" class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-pajoh-green/20 px-3 text-xs font-semibold text-pajoh-green transition hover:bg-pajoh-green hover:text-white cursor-pointer" aria-label="Edit ${escapeHtml(p.name)}">
              <i data-lucide="pencil" class="h-3.5 w-3.5"></i> Edit
            </button>
            <button type="button" data-delete-product="${escapeHtml(p.id)}" class="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-600 hover:text-white cursor-pointer" aria-label="Hapus ${escapeHtml(p.name)}">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
            </button>
          </div>
        </td>
      </tr>`
    )
    .join('');
}

function filteredAdminStories() {
  const q = String(ui.storySearch || '').trim().toLowerCase();
  const list = state.stories || [];
  if (!q) return list;
  return list.filter((st) =>
    [st.tag, st.title, st.quote, (st.paragraphs || []).join(' ')].join(' ').toLowerCase().includes(q)
  );
}

function adminStoryRowsHtml(list) {
  if (!list.length) {
    return `<tr><td colspan="4" class="px-4 py-10 text-center text-pajoh-ink/55">Tidak ada kisah yang cocok dengan pencarian Anda.</td></tr>`;
  }
  return list
    .map((st) => {
      const linked = st.productId ? findProduct(st.productId) : null;
      const fallback = createDishFallbackDataUrl(st.title, st.tag);
      const src = st.image && st.image.trim() ? st.image.trim() : fallback;
      const snippet = (st.paragraphs && st.paragraphs[0]) || st.quote || '';
      return `<tr class="transition hover:bg-pajoh-ivory/60">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-pajoh-sand ring-1 ring-pajoh-green/10">
              <img src="${escapeHtml(src)}" data-fallback-src="${escapeHtml(fallback)}" alt="${escapeHtml(st.title)}" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
            </div>
            <div class="min-w-0">
              <p class="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8A6A1F]">${escapeHtml(st.tag)}</p>
              <p class="max-w-[300px] truncate font-semibold text-pajoh-green">${escapeHtml(st.title)}</p>
              <p class="max-w-[300px] truncate text-[11.5px] text-pajoh-ink/50">${escapeHtml(snippet)}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-pajoh-ink/70">
          ${linked ? `<span class="font-semibold text-pajoh-green">${escapeHtml(linked.name)}</span>` : '<span class="text-xs text-pajoh-ink/40">Tanpa tautan</span>'}
        </td>
        <td class="tabular-nums px-4 py-3 text-xs text-pajoh-ink/60">${(st.paragraphs || []).length} paragraf</td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-end gap-2">
            <button type="button" data-edit-story="${escapeHtml(st.id)}" class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-pajoh-green/20 px-3 text-xs font-semibold text-pajoh-green transition hover:bg-pajoh-green hover:text-white cursor-pointer" aria-label="Edit kisah ${escapeHtml(st.title)}">
              <i data-lucide="pencil" class="h-3.5 w-3.5"></i> Edit
            </button>
            <button type="button" data-delete-story="${escapeHtml(st.id)}" class="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-600 hover:text-white cursor-pointer" aria-label="Hapus kisah ${escapeHtml(st.title)}">
              <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
            </button>
          </div>
        </td>
      </tr>`;
    })
    .join('');
}

function adminStoriesHtml() {
  const s = state.settings;
  const list = filteredAdminStories();
  const heroFallback = createDishFallbackDataUrl('Kisah Kuliner', 'Warisan Aceh');
  const heroPreview = s.storyHeroImage && s.storyHeroImage.trim() ? s.storyHeroImage.trim() : heroFallback;

  return `
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative w-full sm:max-w-xs">
      <i data-lucide="search" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pajoh-green/45"></i>
      <label for="admin-story-search" class="sr-only">Cari kisah kuliner</label>
      <input id="admin-story-search" type="text" value="${escapeHtml(ui.storySearch)}" placeholder="Cari bab, judul, atau isi kisah…" class="input !pl-10" autocomplete="off" />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <a href="#/story" class="btn btn-outline btn-sm"><i data-lucide="eye" class="h-3.5 w-3.5"></i> Buka Kisah Kuliner</a>
      <button type="button" id="admin-add-story-btn" class="btn btn-primary btn-sm">
        <i data-lucide="plus" class="h-4 w-4"></i> Tambah Kisah
      </button>
    </div>
  </div>

  <div class="mt-4 overflow-hidden rounded-2xl border border-pajoh-green/10 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[740px] text-left text-[13px]">
        <thead class="bg-pajoh-ivory text-[10px] uppercase tracking-[0.16em] text-pajoh-green/55">
          <tr>
            <th class="px-4 py-3 font-bold">Bab, Judul &amp; Foto</th>
            <th class="px-4 py-3 font-bold">Produk Terkait</th>
            <th class="px-4 py-3 font-bold">Panjang</th>
            <th class="px-4 py-3 text-right font-bold">Aksi</th>
          </tr>
        </thead>
        <tbody id="admin-story-tbody" class="divide-y divide-pajoh-green/10">
          ${adminStoryRowsHtml(list)}
        </tbody>
      </table>
    </div>
  </div>

  <form id="story-hero-form" class="mt-6 rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="serif text-2xl font-semibold text-pajoh-green">Banner Utama Halaman Kisah Kuliner</h2>
        <p class="text-[12px] text-pajoh-ink/55">Ubah foto meja hidangan, judul pembuka, dan ringkasan di bagian atas halaman Kisah Kuliner.</p>
      </div>
      <button type="submit" class="btn btn-primary btn-sm self-start"><i data-lucide="save" class="h-3.5 w-3.5"></i> Simpan Banner Kisah</button>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-12">
      <div class="lg:col-span-5 rounded-2xl border border-pajoh-green/10 bg-pajoh-ivory/70 p-4">
        <div class="aspect-[4/3] overflow-hidden rounded-xl bg-pajoh-sand ring-1 ring-pajoh-green/10">
          <img id="sh-preview" src="${escapeHtml(heroPreview)}" data-fallback-src="${escapeHtml(heroFallback)}" alt="Pratinjau foto banner kisah kuliner" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
        </div>
        <label class="label mt-3" for="sh-image">Foto Banner (URL atau Unggah)</label>
        <input id="sh-image" class="input" value="${escapeHtml(s.storyHeroImage || '')}" placeholder="https://..." />
        <div class="mt-2.5 flex flex-wrap gap-2">
          <label class="btn btn-outline btn-sm cursor-pointer">
            <i data-lucide="upload" class="h-3.5 w-3.5"></i> Unggah Foto
            <input id="sh-image-file" type="file" accept="image/*" class="sr-only" />
          </label>
          <button type="button" id="sh-image-clear" class="btn btn-ghost btn-sm">Gunakan Ilustrasi</button>
        </div>
      </div>

      <div class="space-y-4 lg:col-span-7">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="sh-title">Judul Baris Pertama</label>
            <input id="sh-title" class="input" value="${escapeHtml(s.storyHeroTitle || '')}" placeholder="Kisah dari" />
          </div>
          <div>
            <label class="label" for="sh-accent">Judul Baris Miring (Aksen)</label>
            <input id="sh-accent" class="input" value="${escapeHtml(s.storyHeroAccent || '')}" placeholder="dapur indatu." />
          </div>
        </div>
        <div>
          <label class="label" for="sh-badge">Label Lencana Foto</label>
          <input id="sh-badge" class="input" value="${escapeHtml(s.storyHeroBadge || '')}" placeholder="Warisan Rasa Aceh" />
        </div>
        <div>
          <label class="label" for="sh-desc">Paragraf Pengantar</label>
          <textarea id="sh-desc" rows="4" class="textarea">${escapeHtml(s.storyHeroDesc || '')}</textarea>
        </div>
      </div>
    </div>
  </form>`;
}

function adminPromoHtml() {
  return `
  <div class="grid gap-5 lg:grid-cols-2">
    <form id="promo-form" class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-pajoh-gold/15 text-[#8A6A1F]"><i data-lucide="megaphone" class="h-4 w-4"></i></span>
        <div>
          <h2 class="serif text-xl font-semibold leading-none text-pajoh-green">Teks Pengumuman</h2>
          <p class="mt-1 text-[11px] text-pajoh-ink/50">Berjalan di bilah paling atas situs.</p>
        </div>
      </div>
      <label class="label mt-4" for="promo-announcement">Pengumuman *</label>
      <textarea id="promo-announcement" rows="3" class="textarea">${escapeHtml(state.settings.announcement)}</textarea>
      <label class="label mt-4" for="promo-highlight">Label Highlight Hero</label>
      <input id="promo-highlight" class="input" value="${escapeHtml(state.settings.highlight)}" placeholder="Hidangan Warisan Terfavorit" />
      <p class="mt-1 text-[11px] text-pajoh-ink/45">Tampil di atas judul hero sebagai label kurasi utama.</p>
      <button type="submit" class="btn btn-primary btn-sm mt-5"><i data-lucide="save" class="h-3.5 w-3.5"></i> Simpan Promo</button>
    </form>

    <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green"><i data-lucide="tags" class="h-4 w-4"></i></span>
        <div>
          <h2 class="serif text-xl font-semibold leading-none text-pajoh-green">Kategori Menu</h2>
          <p class="mt-1 text-[11px] text-pajoh-ink/50">Dipakai pada filter menu &amp; form produk.</p>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        ${state.categories
          .map((c) => {
            const used = countProductsInCategory(state.products, c);
            return `<div class="flex items-center justify-between rounded-xl bg-pajoh-ivory px-3.5 py-2.5">
              <div>
                <p class="text-[13px] font-semibold text-pajoh-green">${escapeHtml(c)}</p>
                <p class="tabular-nums text-[11px] text-pajoh-ink/50">${used} produk</p>
              </div>
              <button type="button" data-remove-cat="${escapeHtml(c)}" class="rounded-lg p-2 text-pajoh-ink/40 transition hover:bg-red-50 hover:text-red-600 cursor-pointer" aria-label="Hapus kategori ${escapeHtml(c)}">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
              </button>
            </div>`;
          })
          .join('')}
      </div>

      <form id="add-cat-form" class="mt-4">
        <label class="label" for="promo-newcat">Tambah Kategori Baru</label>
        <div class="flex gap-2">
          <input id="promo-newcat" class="input" placeholder="Contoh: Minuman Tradisional" />
          <button type="submit" class="btn btn-gold btn-sm shrink-0"><i data-lucide="plus" class="h-3.5 w-3.5"></i> Tambah</button>
        </div>
      </form>
      <p class="mt-2 text-[11px] text-pajoh-ink/45">Kategori yang masih dipakai produk tidak bisa dihapus.</p>
    </div>
  </div>`;
}

function adminSettingsHtml() {
  const { count } = calculateCartSummary(state.products, state.cart);
  const usedKb = (getStorageUsageBytes() / 1024).toFixed(1);

  return `
  <div class="grid gap-5 lg:grid-cols-2">
    <form id="settings-form" class="rounded-2xl border border-pajoh-green/10 bg-white p-5 sm:p-6">
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green"><i data-lucide="settings" class="h-4 w-4"></i></span>
        <div>
          <h2 class="serif text-xl font-semibold leading-none text-pajoh-green">Brand &amp; WhatsApp</h2>
          <p class="mt-1 text-[11px] text-pajoh-ink/50">Dipakai pada checkout, kontak, dan footer.</p>
        </div>
      </div>

      <div class="mt-4 space-y-4">
        <div>
          <label class="label" for="set-wa">Nomor WhatsApp Tujuan Checkout *</label>
          <input id="set-wa" class="input" value="${escapeHtml(state.settings.wa)}" placeholder="6281269002470" inputmode="numeric" />
          <p class="mt-1 text-[11px] text-pajoh-ink/45">Format internasional tanpa tanda plus, contoh 6281269002470.</p>
        </div>
        <div>
          <label class="label" for="set-email">Surel Resmi</label>
          <input id="set-email" type="email" class="input" value="${escapeHtml(state.settings.email || '')}" placeholder="muhammadisraaulia21@gmail.com" />
        </div>
        <div>
          <label class="label" for="set-instagram">Tautan Instagram</label>
          <input id="set-instagram" type="url" class="input" value="${escapeHtml(state.settings.instagram || '')}" placeholder="https://www.instagram.com/mhdsraa/" />
        </div>
        <div>
          <label class="label" for="set-address">Alamat Dapur *</label>
          <textarea id="set-address" rows="2" class="textarea">${escapeHtml(state.settings.address)}</textarea>
        </div>
        <div>
          <label class="label" for="set-hours">Jam Operasional</label>
          <input id="set-hours" class="input" value="${escapeHtml(state.settings.hours)}" />
        </div>
        <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="save" class="h-3.5 w-3.5"></i> Simpan Pengaturan</button>
      </div>
    </form>

    <div class="space-y-4">
      <div class="rounded-2xl border border-pajoh-green/10 bg-pajoh-ivory p-5 sm:p-6">
        <h2 class="serif text-xl font-semibold text-pajoh-green">Status &amp; Cadangan Data</h2>
        <ul class="mt-3 space-y-2 text-[13px] text-pajoh-ink/70">
          <li class="flex items-center justify-between"><span>Produk tersimpan</span><span class="tabular-nums font-semibold text-pajoh-green">${state.products.length}</span></li>
          <li class="flex items-center justify-between"><span>Kategori</span><span class="tabular-nums font-semibold text-pajoh-green">${state.categories.length}</span></li>
          <li class="flex items-center justify-between"><span>Item di keranjang</span><span class="tabular-nums font-semibold text-pajoh-green">${count}</span></li>
          <li class="flex items-center justify-between"><span>Ukuran localStorage</span><span class="tabular-nums font-semibold text-pajoh-green">${usedKb} KB</span></li>
        </ul>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" id="export-json-btn" class="btn btn-outline btn-sm">
            <i data-lucide="download" class="h-3.5 w-3.5"></i> Ekspor JSON
          </button>
          <label class="btn btn-outline btn-sm cursor-pointer">
            <i data-lucide="file-up" class="h-3.5 w-3.5"></i> Impor JSON
            <input id="import-json-input" type="file" accept="application/json,.json" class="sr-only" />
          </label>
        </div>
        <p class="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-pajoh-ink/50">
          <i data-lucide="info" class="mt-0.5 h-3.5 w-3.5 shrink-0"></i> Foto yang diunggah akan dikompresi otomatis agar tetap ringan di penyimpanan peramban.
        </p>
      </div>

      <div class="rounded-2xl border border-red-200 bg-red-50/70 p-5 sm:p-6">
        <h2 class="serif text-xl font-semibold text-red-700">Reset Data Awal</h2>
        <p class="mt-1.5 text-[12.5px] leading-relaxed text-red-700/75">Mengembalikan 8 produk awal, kategori, pengaturan brand, dan mengosongkan keranjang. Perubahan Anda akan hilang.</p>
        <button type="button" id="reset-data-btn" class="btn btn-danger btn-sm mt-4"><i data-lucide="rotate-ccw" class="h-3.5 w-3.5"></i> Reset Data Awal</button>
      </div>
    </div>
  </div>`;
}

export function mountAdminPage(rerenderCurrentRoute) {
  const app = document.getElementById('app');
  if (!app) return;

  app.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ui.adminTab = btn.dataset.adminTab || 'products';
      rerenderCurrentRoute();
    });
  });

  if (ui.adminTab === 'products') {
    mountProductsTab(rerenderCurrentRoute);
  } else if (ui.adminTab === 'stories') {
    mountStoriesTab(rerenderCurrentRoute);
  } else if (ui.adminTab === 'promo') {
    mountPromoTab(rerenderCurrentRoute);
  } else {
    mountSettingsTab(rerenderCurrentRoute);
  }

  bindImageFallbacks(app);
  renderIcons();
}

function mountProductsTab(rerenderCurrentRoute) {
  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      ui.adminSearch = searchInput.value;
      const tbody = document.getElementById('admin-product-tbody');
      if (tbody) {
        tbody.innerHTML = adminProductRowsHtml(filteredAdminProducts());
        bindRowButtons(rerenderCurrentRoute);
        bindImageFallbacks(tbody);
        renderIcons();
      }
    });
  }

  const addBtn = document.getElementById('admin-add-product-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openProductModal(null, rerenderCurrentRoute));
  }

  bindRowButtons(rerenderCurrentRoute);
}

function bindRowButtons(rerenderCurrentRoute) {
  const tbody = document.getElementById('admin-product-tbody');
  if (!tbody) return;

  tbody.querySelectorAll('[data-edit-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openProductModal(btn.dataset.editProduct, rerenderCurrentRoute);
    });
  });

  tbody.querySelectorAll('[data-delete-product]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteProduct;
      const p = findProduct(id);
      if (!p) return;
      const confirmed = await openConfirmModal({
        title: `Hapus "${p.name}"?`,
        message: 'Produk akan dihapus permanen dari katalog dan keranjang pengunjung.',
        confirmLabel: 'Hapus Produk',
        danger: true,
      });
      if (!confirmed) return;
      deleteProduct(id);
      updateCartBadge();
      showToast(`Produk "${p.name}" dihapus.`);
      rerenderCurrentRoute();
    });
  });
}

function mountPromoTab(rerenderCurrentRoute) {
  const promoForm = document.getElementById('promo-form');
  if (promoForm) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const announcement = (document.getElementById('promo-announcement')?.value || '').trim();
      const highlight = (document.getElementById('promo-highlight')?.value || '').trim();
      if (!announcement) {
        showToast('Teks pengumuman tidak boleh kosong.', 'error');
        return;
      }
      updatePromoSettings({ announcement, highlight });
      renderHeader('admin');
      updateCartBadge();
      showToast('Promo dan highlight hero diperbarui.');
      rerenderCurrentRoute();
    });
  }

  const catForm = document.getElementById('add-cat-form');
  if (catForm) {
    catForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('promo-newcat');
      const res = addCategory(input?.value || '');
      if (!res.ok) {
        showToast(res.error, 'error');
        return;
      }
      showToast(`Kategori "${res.name}" ditambahkan.`);
      rerenderCurrentRoute();
    });
  }

  document.querySelectorAll('[data-remove-cat]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const cat = btn.dataset.removeCat;
      const used = countProductsInCategory(state.products, cat);
      if (used > 0) {
        showToast(`Kategori "${cat}" masih dipakai ${used} produk.`, 'error');
        return;
      }
      const confirmed = await openConfirmModal({
        title: `Hapus kategori "${cat}"?`,
        message: 'Kategori ini tidak dipakai produk mana pun dan akan dihapus dari daftar.',
        confirmLabel: 'Hapus Kategori',
        danger: true,
      });
      if (!confirmed) return;
      const res = removeCategory(cat);
      if (!res.ok) {
        showToast(res.error, 'error');
        return;
      }
      showToast('Kategori dihapus.');
      rerenderCurrentRoute();
    });
  });
}

function mountSettingsTab(rerenderCurrentRoute) {
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const wa = (document.getElementById('set-wa')?.value || '').replace(/[^0-9]/g, '');
      const email = (document.getElementById('set-email')?.value || '').trim();
      const instagram = (document.getElementById('set-instagram')?.value || '').trim();
      const address = (document.getElementById('set-address')?.value || '').trim();
      const hours = (document.getElementById('set-hours')?.value || '').trim();

      if (wa.length < 9) {
        showToast('Nomor WhatsApp tidak valid.', 'error');
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Format surel tidak valid.', 'error');
        return;
      }
      if (address.length < 8) {
        showToast('Alamat dapur terlalu pendek.', 'error');
        return;
      }

      updateBrandSettings({ wa, email, instagram, address, hours });
      renderFooter();
      showToast('Pengaturan brand, surel, dan WhatsApp disimpan.');
      rerenderCurrentRoute();
    });
  }

  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([exportStateJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pajoh-katalog-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Cadangan katalog JSON diunduh.');
    });
  }

  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const res = importStateJson(text);
        if (!res.ok) {
          showToast(res.error, 'error');
          return;
        }
        renderHeader('admin');
        renderFooter();
        updateCartBadge();
        showToast(`${res.count} produk berhasil dipulihkan.`);
        rerenderCurrentRoute();
      } catch {
        showToast('Gagal membaca berkas JSON.', 'error');
      }
    });
  }

  const resetBtn = document.getElementById('reset-data-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const confirmed = await openConfirmModal({
        title: 'Reset seluruh data awal?',
        message: 'Semua perubahan produk, foto, harga, promo, dan keranjang akan dikembalikan ke data awal.',
        confirmLabel: 'Ya, Reset Data',
        danger: true,
      });
      if (!confirmed) return;
      resetAllData();
      renderHeader('admin');
      renderFooter();
      updateCartBadge();
      showToast('Data berhasil dikembalikan ke kondisi awal.');
      rerenderCurrentRoute();
    });
  }
}

export function closeProductModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.body.style.overflow = '';
  ui.editingId = null;
  ui.editingStoryId = null;
}

function mountStoriesTab(rerenderCurrentRoute) {
  const searchInput = document.getElementById('admin-story-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      ui.storySearch = searchInput.value;
      const tbody = document.getElementById('admin-story-tbody');
      if (tbody) {
        tbody.innerHTML = adminStoryRowsHtml(filteredAdminStories());
        bindStoryRowButtons(rerenderCurrentRoute);
        bindImageFallbacks(tbody);
        renderIcons();
      }
    });
  }

  const addBtn = document.getElementById('admin-add-story-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openStoryModal(null, rerenderCurrentRoute));
  }

  bindStoryRowButtons(rerenderCurrentRoute);

  const shPreview = document.getElementById('sh-preview');
  const shImageInput = document.getElementById('sh-image');
  const shImageFile = document.getElementById('sh-image-file');
  const shImageClear = document.getElementById('sh-image-clear');
  const heroFallback = createDishFallbackDataUrl('Kisah Kuliner', 'Warisan Aceh');

  const updateHeroPreview = (url) => {
    const target = url && url.trim() ? url.trim() : heroFallback;
    if (shPreview) {
      shPreview.onerror = () => {
        shPreview.src = heroFallback;
      };
      shPreview.src = target;
    }
  };

  if (shImageInput) {
    shImageInput.addEventListener('input', () => updateHeroPreview(shImageInput.value));
  }
  if (shImageClear && shImageInput) {
    shImageClear.addEventListener('click', () => {
      shImageInput.value = '';
      updateHeroPreview('');
    });
  }
  if (shImageFile && shImageInput) {
    shImageFile.addEventListener('change', async () => {
      const file = shImageFile.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file, 840, 0.82);
        shImageInput.value = dataUrl;
        updateHeroPreview(dataUrl);
        showToast('Foto banner berhasil diproses dan siap disimpan.');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Gagal memproses foto.', 'error');
      }
    });
  }

  const heroForm = document.getElementById('story-hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (document.getElementById('sh-title')?.value || '').trim();
      const accent = (document.getElementById('sh-accent')?.value || '').trim();
      const desc = (document.getElementById('sh-desc')?.value || '').trim();
      const badge = (document.getElementById('sh-badge')?.value || '').trim();
      const image = (document.getElementById('sh-image')?.value || '').trim();
      const res = updateStoryHeroSettings({ title, accent, desc, badge, image });
      if (!res.ok) {
        showToast(res.error, 'error');
        return;
      }
      showToast('Banner Kisah Kuliner diperbarui.');
      rerenderCurrentRoute();
    });
  }
}

function bindStoryRowButtons(rerenderCurrentRoute) {
  const tbody = document.getElementById('admin-story-tbody');
  if (!tbody) return;

  tbody.querySelectorAll('[data-edit-story]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openStoryModal(btn.dataset.editStory, rerenderCurrentRoute);
    });
  });

  tbody.querySelectorAll('[data-delete-story]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteStory;
      const st = findStory(id);
      if (!st) return;
      const confirmed = await openConfirmModal({
        title: `Hapus kisah "${st.title}"?`,
        message: 'Bab kisah kuliner ini akan dihapus permanen dari halaman Kisah Kuliner.',
        confirmLabel: 'Hapus Kisah',
        danger: true,
      });
      if (!confirmed) return;
      deleteStory(id);
      showToast(`Kisah "${st.title}" dihapus.`);
      rerenderCurrentRoute();
    });
  });
}

function openStoryModal(id, rerenderCurrentRoute) {
  const st = id ? findStory(id) : null;
  ui.editingStoryId = id || null;

  const productOptions = [
    `<option value="">— Tanpa tautan produk —</option>`,
    ...state.products.map(
      (p) =>
        `<option value="${escapeHtml(p.id)}"${st && st.productId === p.id ? ' selected' : ''}>${escapeHtml(p.name)}</option>`
    ),
  ].join('');

  const initialPreview =
    st && st.image && st.image.trim()
      ? st.image.trim()
      : createDishFallbackDataUrl(st?.title || 'Kisah Baru', st?.tag || 'Kisah Kuliner');

  const root = document.getElementById('modal-root');
  if (!root) return;
  document.body.style.overflow = 'hidden';

  root.innerHTML = `
  <div id="story-modal" role="dialog" aria-modal="true" aria-labelledby="stm-title" class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
    <div class="modal-backdrop absolute inset-0" data-close-sm></div>
    <form id="story-form" novalidate class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl fade-up">
      <div class="flex shrink-0 items-start justify-between gap-3 border-b border-pajoh-green/10 bg-white px-5 py-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A6A1F]">${st ? 'Edit Kisah Kuliner' : 'Kisah Kuliner Baru'}</p>
          <h2 id="stm-title" class="serif text-2xl font-semibold leading-tight text-pajoh-green">${st ? escapeHtml(st.title) : 'Tambah Bab Kisah'}</h2>
        </div>
        <button type="button" data-close-sm class="rounded-lg p-2 text-pajoh-green/50 transition hover:bg-pajoh-ivory hover:text-pajoh-green cursor-pointer" aria-label="Tutup form kisah">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>

      <div class="grid flex-1 gap-5 overflow-y-auto px-5 py-5 sm:grid-cols-2">
        <div class="sm:col-span-2 rounded-2xl border border-pajoh-green/10 bg-pajoh-ivory/75 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-pajoh-sand ring-1 ring-pajoh-green/15">
              <img id="st-preview" src="${escapeHtml(initialPreview)}" alt="Pratinjau foto kisah" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
            </div>
            <div class="min-w-0 flex-1 space-y-2.5">
              <div>
                <label class="label" for="st-image">Foto Kisah (URL atau Unggah File)</label>
                <input id="st-image" class="input" value="${st ? escapeHtml(st.image || '') : ''}" placeholder="https://... atau unggah foto dari perangkat" />
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <label class="btn btn-outline btn-sm cursor-pointer">
                  <i data-lucide="upload" class="h-3.5 w-3.5"></i> Unggah Foto
                  <input id="st-image-file" type="file" accept="image/*" class="sr-only" />
                </label>
                <button type="button" id="st-image-clear" class="btn btn-ghost btn-sm">Gunakan Ilustrasi</button>
                <span class="text-[11px] text-pajoh-ink/50">Maks. lebar 720px (otomatis dikompresi)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="label" for="st-tag">Label Bab *</label>
          <input id="st-tag" class="input" value="${st ? escapeHtml(st.tag || '') : ''}" placeholder="Contoh: Bab I · Lauk Warisan" />
          <p class="err-msg" id="err-st-tag"></p>
        </div>

        <div>
          <label class="label" for="st-short">Label Singkat Navigasi</label>
          <input id="st-short" class="input" value="${st ? escapeHtml(st.shortTitle || '') : ''}" placeholder="Contoh: Sie Reuboh" />
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="st-title">Judul Kisah *</label>
          <input id="st-title" class="input" value="${st ? escapeHtml(st.title || '') : ''}" placeholder="Sie Reuboh: bekal para pejuang, harum di meja hari ini" />
          <p class="err-msg" id="err-st-title"></p>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="st-paragraphs">Isi Cerita / Paragraf * (pisahkan paragraf dengan baris kosong)</label>
          <textarea id="st-paragraphs" rows="7" class="textarea" placeholder="Tulis paragraf kisah di sini. Tekan Enter dua kali untuk membuat paragraf baru.">${st ? escapeHtml((st.paragraphs || []).join('\n\n')) : ''}</textarea>
          <p class="err-msg" id="err-st-paragraphs"></p>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="st-quote">Kutipan Sorotan (Quote)</label>
          <textarea id="st-quote" rows="2" class="textarea" placeholder="Kalimat kutipan penuh makna di akhir cerita.">${st ? escapeHtml(st.quote || '') : ''}</textarea>
        </div>

        <div>
          <label class="label" for="st-product">Produk Terkait</label>
          <select id="st-product" class="select">${productOptions}</select>
        </div>

        <div>
          <label class="label" for="st-cta">Teks Tombol Tautan</label>
          <input id="st-cta" class="input" value="${st ? escapeHtml(st.cta || '') : ''}" placeholder="Contoh: Pesan Sie Reuboh" />
        </div>
      </div>

      <div class="flex shrink-0 flex-col-reverse gap-2 border-t border-pajoh-green/10 bg-white px-5 py-4 sm:flex-row sm:justify-end">
        <button type="button" data-close-sm class="btn btn-outline">Batal</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="save" class="h-4 w-4"></i> ${st ? 'Simpan Kisah' : 'Tambah Kisah'}</button>
      </div>
    </form>
  </div>`;

  renderIcons();

  root.querySelectorAll('[data-close-sm]').forEach((btn) => {
    btn.addEventListener('click', closeProductModal);
  });

  const previewImg = document.getElementById('st-preview');
  const imgUrlInput = document.getElementById('st-image');
  const imgFileInput = document.getElementById('st-image-file');
  const imgClearBtn = document.getElementById('st-image-clear');
  const titleInput = document.getElementById('st-title');
  const tagInput = document.getElementById('st-tag');

  const updatePreview = (url) => {
    const fallback = createDishFallbackDataUrl(
      titleInput?.value || 'Kisah Kuliner',
      tagInput?.value || 'Pajôh'
    );
    const target = url && url.trim() ? url.trim() : fallback;
    if (previewImg) {
      previewImg.onerror = () => {
        previewImg.src = fallback;
      };
      previewImg.src = target;
    }
  };

  if (imgUrlInput) {
    imgUrlInput.addEventListener('input', () => updatePreview(imgUrlInput.value));
  }
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      if (!imgUrlInput?.value.trim()) updatePreview('');
    });
  }
  if (imgClearBtn && imgUrlInput) {
    imgClearBtn.addEventListener('click', () => {
      imgUrlInput.value = '';
      updatePreview('');
    });
  }
  if (imgFileInput && imgUrlInput) {
    imgFileInput.addEventListener('change', async () => {
      const file = imgFileInput.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file, 720, 0.82);
        imgUrlInput.value = dataUrl;
        updatePreview(dataUrl);
        showToast('Foto kisah berhasil diproses dan siap disimpan.');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Gagal memproses foto.', 'error');
      }
    });
  }

  const form = document.getElementById('story-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (fid) => (document.getElementById(fid)?.value || '').trim();
      const tag = val('st-tag');
      const title = val('st-title');
      const rawParagraphs = val('st-paragraphs');

      setProductError('st-tag', 'err-st-tag', '');
      setProductError('st-title', 'err-st-title', '');
      setProductError('st-paragraphs', 'err-st-paragraphs', '');

      const checked = validateStoryForm({ tag, title, paragraphs: rawParagraphs });
      if (!checked.valid) {
        if (checked.errors.tag) setProductError('st-tag', 'err-st-tag', checked.errors.tag);
        if (checked.errors.title) setProductError('st-title', 'err-st-title', checked.errors.title);
        if (checked.errors.paragraphs) {
          setProductError('st-paragraphs', 'err-st-paragraphs', checked.errors.paragraphs);
        }
        showToast('Mohon periksa kembali data kisah kuliner.', 'error');
        return;
      }

      const payload = {
        tag,
        shortTitle: val('st-short'),
        title,
        image: val('st-image'),
        paragraphs: checked.paragraphs,
        quote: val('st-quote'),
        productId: val('st-product'),
        cta: val('st-cta'),
      };

      const res = upsertStory(ui.editingStoryId, payload);
      if (!res.ok) {
        showToast(res.error, 'error');
        return;
      }

      closeProductModal();
      showToast(
        res.isEdit
          ? `Kisah "${title}" diperbarui.`
          : `Kisah "${title}" ditambahkan.`
      );
      rerenderCurrentRoute();
    });
  }

  if (tagInput) tagInput.focus();
}

function openProductModal(id, rerenderCurrentRoute) {
  const p = id ? findProduct(id) : null;
  ui.editingId = id || null;

  const catOptions = state.categories
    .map(
      (c) =>
        `<option value="${escapeHtml(c)}"${p && p.category === c ? ' selected' : ''}>${escapeHtml(c)}</option>`
    )
    .join('');

  const initialPreview =
    p && p.image && p.image.trim()
      ? p.image.trim()
      : createDishFallbackDataUrl(p?.name || 'Hidangan Baru', p?.category || 'Pajôh');

  const root = document.getElementById('modal-root');
  if (!root) return;

  document.body.style.overflow = 'hidden';

  root.innerHTML = `
  <div id="product-modal" role="dialog" aria-modal="true" aria-labelledby="pm-title" class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
    <div class="modal-backdrop absolute inset-0" data-close-pm></div>
    <form id="product-form" novalidate class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl fade-up">
      <div class="flex shrink-0 items-start justify-between gap-3 border-b border-pajoh-green/10 bg-white px-5 py-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8A6A1F]">${p ? 'Edit Produk' : 'Produk Baru'}</p>
          <h2 id="pm-title" class="serif text-2xl font-semibold leading-tight text-pajoh-green">${p ? escapeHtml(p.name) : 'Tambah ke Katalog'}</h2>
        </div>
        <button type="button" data-close-pm class="rounded-lg p-2 text-pajoh-green/50 transition hover:bg-pajoh-ivory hover:text-pajoh-green cursor-pointer" aria-label="Tutup form produk">
          <i data-lucide="x" class="h-4 w-4"></i>
        </button>
      </div>

      <div class="grid flex-1 gap-5 overflow-y-auto px-5 py-5 sm:grid-cols-2">
        <!-- Foto Makanan + Live Preview -->
        <div class="sm:col-span-2 rounded-2xl border border-pajoh-green/10 bg-pajoh-ivory/75 p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="flex items-center gap-3 shrink-0">
              <div class="h-24 w-32 overflow-hidden rounded-xl bg-pajoh-sand ring-1 ring-pajoh-green/15">
                <img id="pm-preview-rect" src="${escapeHtml(initialPreview)}" alt="Pratinjau kartu produk" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
              </div>
              <div class="h-20 w-20 overflow-hidden rounded-full bg-pajoh-sand ring-4 ring-white shadow-md">
                <img id="pm-preview-circle" src="${escapeHtml(initialPreview)}" alt="Pratinjau piring hero" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
              </div>
            </div>
            <div class="min-w-0 flex-1 space-y-2.5">
              <div>
                <label class="label" for="f-image">Foto Makanan (URL atau Unggah File)</label>
                <input id="f-image" class="input" value="${p ? escapeHtml(p.image) : ''}" placeholder="https://... atau unggah foto dari perangkat" />
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <label class="btn btn-outline btn-sm cursor-pointer">
                  <i data-lucide="upload" class="h-3.5 w-3.5"></i> Unggah Foto
                  <input id="f-image-file" type="file" accept="image/*" class="sr-only" />
                </label>
                <button type="button" id="f-image-clear" class="btn btn-ghost btn-sm">Gunakan Ilustrasi</button>
                <span class="text-[11px] text-pajoh-ink/50">Maks. lebar 720px (otomatis dikompresi)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="f-name">Nama Produk *</label>
          <input id="f-name" class="input" value="${p ? escapeHtml(p.name) : ''}" placeholder="Contoh: Sie Reuboh" />
          <p class="err-msg" id="err-f-name"></p>
        </div>

        <div>
          <label class="label" for="f-category">Kategori *</label>
          <select id="f-category" class="select">${catOptions}</select>
          <p class="err-msg" id="err-f-category"></p>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label class="label" for="f-price">Harga (Rp) *</label>
            <span id="f-price-preview" class="tabular-nums text-[11px] font-bold text-pajoh-green">${formatRupiah(p ? p.price : 0)}</span>
          </div>
          <input id="f-price" type="number" min="1000" step="500" class="input tabular-nums" value="${p ? p.price : ''}" placeholder="85000" />
          <p class="err-msg" id="err-f-price"></p>
        </div>

        <div>
          <label class="label" for="f-status">Status Stok *</label>
          <select id="f-status" class="select">
            ${['Tersedia', 'Pre-Order', 'Habis']
              .map(
                (s) =>
                  `<option value="${s}"${p && p.status === s ? ' selected' : !p && s === 'Tersedia' ? ' selected' : ''}>${s}</option>`
              )
              .join('')}
          </select>
        </div>

        <div>
          <label class="label" for="f-rating">Rating (0.0 – 5.0)</label>
          <input id="f-rating" type="number" min="0" max="5" step="0.1" class="input tabular-nums" value="${p ? p.rating || 4.8 : '4.8'}" />
          <p class="err-msg" id="err-f-rating"></p>
        </div>

        <div>
          <label class="label" for="f-eyebrow">Baris Judul Pembuka</label>
          <input id="f-eyebrow" class="input" value="${p ? escapeHtml(p.eyebrow) : ''}" placeholder="Daging Masak Cuka" />
        </div>

        <div>
          <label class="label" for="f-subtitle">Subjudul / Asal Resep</label>
          <input id="f-subtitle" class="input" value="${p ? escapeHtml(p.subtitle) : ''}" placeholder="Resep Indatu • Aceh Besar" />
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="f-desc">Deskripsi Singkat *</label>
          <textarea id="f-desc" rows="3" class="textarea" placeholder="Deskripsi menggugah selera, 1–2 kalimat.">${p ? escapeHtml(p.desc) : ''}</textarea>
          <p class="err-msg" id="err-f-desc"></p>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="f-story">Kisah Hidangan</label>
          <textarea id="f-story" rows="3" class="textarea" placeholder="Cerita di balik hidangan (tampil di halaman detail).">${p ? escapeHtml(p.story || '') : ''}</textarea>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="f-spices">Rempah &amp; Bahan (satu per baris)</label>
          <textarea id="f-spices" rows="4" class="textarea" placeholder="Daging Sapi Pilihan&#10;Cuka Aren Aceh">${p ? escapeHtml((p.spices || []).join('\n')) : ''}</textarea>
        </div>

        <div class="sm:col-span-2">
          <label class="label" for="f-serving">Saran Penyajian &amp; Penyimpanan</label>
          <textarea id="f-serving" rows="2" class="textarea" placeholder="Cara terbaik menikmati dan menyimpan hidangan.">${p ? escapeHtml(p.serving || '') : ''}</textarea>
        </div>

        <div class="sm:col-span-2">
          <label class="flex cursor-pointer items-start gap-3 rounded-xl bg-pajoh-ivory p-4">
            <input id="f-featured" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-pajoh-green/30" ${p && p.featured ? 'checked' : ''} />
            <span>
              <span class="block text-[13px] font-semibold text-pajoh-green">Tampilkan sebagai produk unggulan</span>
              <span class="mt-0.5 block text-[11px] leading-relaxed text-pajoh-ink/50">Maksimal 4 unggulan tampil di Hero Showcase beranda.</span>
            </span>
          </label>
        </div>
      </div>

      <div class="flex shrink-0 flex-col-reverse gap-2 border-t border-pajoh-green/10 bg-white px-5 py-4 sm:flex-row sm:justify-end">
        <button type="button" data-close-pm class="btn btn-outline">Batal</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="save" class="h-4 w-4"></i> ${p ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
      </div>
    </form>
  </div>`;

  renderIcons();

  root.querySelectorAll('[data-close-pm]').forEach((btn) => {
    btn.addEventListener('click', closeProductModal);
  });

  const rectImg = document.getElementById('pm-preview-rect');
  const circleImg = document.getElementById('pm-preview-circle');
  const imgUrlInput = document.getElementById('f-image');
  const imgFileInput = document.getElementById('f-image-file');
  const imgClearBtn = document.getElementById('f-image-clear');
  const nameInput = document.getElementById('f-name');
  const catInput = document.getElementById('f-category');
  const priceInput = document.getElementById('f-price');
  const pricePreview = document.getElementById('f-price-preview');

  const updatePreview = (url) => {
    const fallback = createDishFallbackDataUrl(
      nameInput?.value || 'Hidangan',
      catInput?.value || 'Pajôh'
    );
    const target = url && url.trim() ? url.trim() : fallback;
    if (rectImg) {
      rectImg.onerror = () => {
        rectImg.src = fallback;
      };
      rectImg.src = target;
    }
    if (circleImg) {
      circleImg.onerror = () => {
        circleImg.src = fallback;
      };
      circleImg.src = target;
    }
  };

  if (imgUrlInput) {
    imgUrlInput.addEventListener('input', () => updatePreview(imgUrlInput.value));
  }
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (!imgUrlInput?.value.trim()) updatePreview('');
    });
  }
  if (priceInput && pricePreview) {
    priceInput.addEventListener('input', () => {
      pricePreview.textContent = formatRupiah(Number(priceInput.value) || 0);
    });
  }
  if (imgClearBtn && imgUrlInput) {
    imgClearBtn.addEventListener('click', () => {
      imgUrlInput.value = '';
      updatePreview('');
    });
  }
  if (imgFileInput && imgUrlInput) {
    imgFileInput.addEventListener('change', async () => {
      const file = imgFileInput.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file, 720, 0.82);
        imgUrlInput.value = dataUrl;
        updatePreview(dataUrl);
        showToast('Foto berhasil diproses dan siap disimpan.');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Gagal memproses foto.', 'error');
      }
    });
  }

  const form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveProduct(rerenderCurrentRoute);
    });
  }

  if (nameInput) nameInput.focus();
}

function setProductError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (msg) {
    if (input) input.classList.add('is-err');
    if (err) {
      err.textContent = msg;
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

function handleSaveProduct(rerenderCurrentRoute) {
  const val = (id) => (document.getElementById(id)?.value || '').trim();

  const name = val('f-name');
  const price = val('f-price');
  const category = val('f-category');
  const desc = val('f-desc');
  const rating = val('f-rating');

  setProductError('f-name', 'err-f-name', '');
  setProductError('f-category', 'err-f-category', '');
  setProductError('f-price', 'err-f-price', '');
  setProductError('f-desc', 'err-f-desc', '');
  setProductError('f-rating', 'err-f-rating', '');

  const { valid, errors } = validateProductForm({ name, price, category, desc, rating });
  if (!valid) {
    if (errors.name) setProductError('f-name', 'err-f-name', errors.name);
    if (errors.category) setProductError('f-category', 'err-f-category', errors.category);
    if (errors.price) setProductError('f-price', 'err-f-price', errors.price);
    if (errors.desc) setProductError('f-desc', 'err-f-desc', errors.desc);
    if (errors.rating) setProductError('f-rating', 'err-f-rating', errors.rating);
    showToast('Mohon periksa kembali data produk.', 'error');
    return;
  }

  const payload = {
    name,
    eyebrow: val('f-eyebrow') || name.toUpperCase(),
    subtitle: val('f-subtitle') || 'Resep Indatu • Banda Aceh',
    kicker: state.settings.highlight,
    category,
    price: Number(price),
    status: val('f-status') || 'Tersedia',
    rating: rating ? Number(rating) : 4.8,
    desc,
    story: val('f-story') || desc,
    spices: val('f-spices')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    serving:
      val('f-serving') ||
      'Nikmati selagi hangat. Simpan di wadah tertutup dalam lemari pendingin dan panaskan kembali sebelum disantap.',
    image: val('f-image'),
    featured: Boolean(document.getElementById('f-featured')?.checked),
  };

  const res = upsertProduct(ui.editingId, payload);
  if (!res.ok) {
    showToast(res.error, 'error');
    return;
  }

  closeProductModal();
  updateCartBadge();
  showToast(
    res.isEdit
      ? `Produk "${name}" diperbarui.`
      : `Produk "${name}" ditambahkan ke katalog.`
  );
  rerenderCurrentRoute();
}
