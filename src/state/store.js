import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  STORAGE_KEY,
  STORIES,
} from '../data/seed.js';
import { normalizeWaNumber, slugifyProduct } from '../utils/format.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createSeedState() {
  return {
    products: clone(SEED_PRODUCTS),
    categories: clone(SEED_CATEGORIES),
    stories: clone(STORIES),
    settings: { ...DEFAULT_SETTINGS },
    cart: {},
    savedLikes: {},
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw);
    const base = createSeedState();
    return {
      products:
        Array.isArray(parsed.products) && parsed.products.length
          ? parsed.products
          : base.products,
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length
          ? parsed.categories
          : base.categories,
      stories:
        Array.isArray(parsed.stories) && parsed.stories.length
          ? parsed.stories
          : base.stories,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        wa:
          !parsed.settings?.wa || parsed.settings.wa === '6281269002470'
            ? DEFAULT_SETTINGS.wa
            : normalizeWaNumber(parsed.settings.wa),
        email:
          !parsed.settings?.email || parsed.settings.email === 'halo@pajoh.id'
            ? DEFAULT_SETTINGS.email
            : parsed.settings.email,
        instagram: parsed.settings?.instagram || DEFAULT_SETTINGS.instagram,
      },
      cart: parsed.cart && typeof parsed.cart === 'object' ? parsed.cart : {},
      savedLikes:
        parsed.savedLikes && typeof parsed.savedLikes === 'object'
          ? parsed.savedLikes
          : {},
    };
  } catch {
    return createSeedState();
  }
}

export let state = loadState();

export const ui = {
  heroIndex: 0,
  heroDirection: 'next',
  heroTab: 'overview',
  heroBusy: false,
  heroSpiceIdx: 0,
  homeCategory: 'Semua',
  menu: { q: '', cat: 'Semua', status: 'Semua', sort: 'Unggulan' },
  adminTab: 'products',
  adminSearch: '',
  storySearch: '',
  editingId: null,
  editingStoryId: null,
  lastOrder: null,
  method: 'kurir',
  mobileNav: false,
};

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err && err.name === 'QuotaExceededError'
          ? 'Penyimpanan peramban penuh. Gunakan foto lebih kecil atau URL gambar.'
          : 'Gagal menyimpan data ke localStorage.',
    };
  }
}

export function getStorageUsageBytes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}

export function findProduct(id) {
  return state.products.find((p) => p.id === id) || null;
}

export function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product) return { ok: false, reason: 'Produk tidak ditemukan.' };
  if (product.status === 'Habis') {
    return {
      ok: false,
      reason: `Maaf, ${product.name} sedang habis. Coba hidangan lain, ya.`,
    };
  }
  const amount = Math.max(1, Number(qty) || 1);
  state.cart[id] = (Number(state.cart[id]) || 0) + amount;
  saveState();
  return { ok: true, product, amount };
}

export function changeCartQty(id, delta) {
  const next = (Number(state.cart[id]) || 0) + delta;
  if (next <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = Math.min(99, next);
  }
  saveState();
}

export function removeFromCart(id) {
  const product = findProduct(id);
  delete state.cart[id];
  saveState();
  return product;
}

export function clearCart() {
  state.cart = {};
  saveState();
}

export function getLikeCount(product) {
  return Number(product.likes || 0) + (state.savedLikes[product.id] ? 1 : 0);
}

export function toggleLike(id) {
  if (state.savedLikes[id]) {
    delete state.savedLikes[id];
  } else {
    state.savedLikes[id] = true;
  }
  saveState();
}

export function upsertProduct(editingId, payload) {
  const previous = clone(state.products);
  let savedProduct = null;

  if (editingId) {
    const idx = state.products.findIndex((p) => p.id === editingId);
    if (idx !== -1) {
      savedProduct = { ...state.products[idx], ...payload };
      state.products[idx] = savedProduct;
    }
  } else {
    savedProduct = {
      id: slugifyProduct(payload.name, state.products),
      likes: 0,
      ...payload,
    };
    state.products.unshift(savedProduct);
  }

  const persisted = saveState();
  if (!persisted.ok) {
    state.products = previous;
    return persisted;
  }

  return { ok: true, product: savedProduct, isEdit: Boolean(editingId) };
}

export function deleteProduct(id) {
  const product = findProduct(id);
  if (!product) return null;
  state.products = state.products.filter((p) => p.id !== id);
  delete state.cart[id];
  delete state.savedLikes[id];
  if (ui.heroIndex > 0) ui.heroIndex = 0;
  saveState();
  return product;
}

export function updatePromoSettings({ announcement, highlight }) {
  state.settings.announcement = announcement;
  state.settings.highlight = highlight || DEFAULT_SETTINGS.highlight;
  return saveState();
}

export function addCategory(name) {
  const trimmed = String(name || '').trim();
  if (trimmed.length < 2) {
    return { ok: false, error: 'Nama kategori minimal 2 karakter.' };
  }
  if (state.categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: 'Kategori tersebut sudah ada.' };
  }
  state.categories.push(trimmed);
  saveState();
  return { ok: true, name: trimmed };
}

export function removeCategory(name) {
  const used = state.products.filter((p) => p.category === name).length;
  if (used > 0) {
    return {
      ok: false,
      error: `Kategori "${name}" masih dipakai ${used} produk.`,
    };
  }
  if (state.categories.length <= 1) {
    return { ok: false, error: 'Minimal harus ada satu kategori.' };
  }
  state.categories = state.categories.filter((c) => c !== name);
  if (ui.menu.cat === name) ui.menu.cat = 'Semua';
  saveState();
  return { ok: true };
}

export function updateBrandSettings({ wa, email, instagram, address, hours }) {
  state.settings.wa = normalizeWaNumber(wa) || DEFAULT_SETTINGS.wa;
  state.settings.email = email || DEFAULT_SETTINGS.email;
  state.settings.instagram = instagram || DEFAULT_SETTINGS.instagram;
  state.settings.address = address;
  state.settings.hours = hours || DEFAULT_SETTINGS.hours;
  return saveState();
}

export function findStory(id) {
  return (state.stories || []).find((s) => s.id === id) || null;
}

export function upsertStory(editingStoryId, payload) {
  const previous = clone(state.stories || []);
  let savedStory = null;

  if (editingStoryId) {
    const idx = state.stories.findIndex((s) => s.id === editingStoryId);
    if (idx !== -1) {
      savedStory = { ...state.stories[idx], ...payload };
      state.stories[idx] = savedStory;
    }
  } else {
    savedStory = {
      id: slugifyProduct(payload.title, state.stories),
      ...payload,
    };
    state.stories.push(savedStory);
  }

  const persisted = saveState();
  if (!persisted.ok) {
    state.stories = previous;
    return persisted;
  }

  return { ok: true, story: savedStory, isEdit: Boolean(editingStoryId) };
}

export function deleteStory(id) {
  const story = findStory(id);
  if (!story) return null;
  state.stories = state.stories.filter((s) => s.id !== id);
  saveState();
  return story;
}

export function updateStoryHeroSettings({ title, accent, desc, badge, image }) {
  state.settings.storyHeroTitle = title || DEFAULT_SETTINGS.storyHeroTitle;
  state.settings.storyHeroAccent = accent || DEFAULT_SETTINGS.storyHeroAccent;
  state.settings.storyHeroDesc = desc || DEFAULT_SETTINGS.storyHeroDesc;
  state.settings.storyHeroBadge = badge || DEFAULT_SETTINGS.storyHeroBadge;
  state.settings.storyHeroImage = image || DEFAULT_SETTINGS.storyHeroImage;
  return saveState();
}

export function exportStateJson() {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      products: state.products,
      categories: state.categories,
      stories: state.stories,
      settings: state.settings,
    },
    null,
    2
  );
}

export function importStateJson(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || !Array.isArray(parsed.products) || !parsed.products.length) {
      return { ok: false, error: 'Berkas JSON tidak berisi daftar produk yang valid.' };
    }
    const base = createSeedState();
    state = {
      products: parsed.products,
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length
          ? parsed.categories
          : base.categories,
      stories:
        Array.isArray(parsed.stories) && parsed.stories.length
          ? parsed.stories
          : base.stories,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      cart: state.cart,
      savedLikes: state.savedLikes,
    };
    const res = saveState();
    if (!res.ok) return res;
    ui.heroIndex = 0;
    return { ok: true, count: state.products.length };
  } catch {
    return { ok: false, error: 'Format JSON tidak valid.' };
  }
}

export function resetAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  state = createSeedState();
  ui.heroIndex = 0;
  ui.heroTab = 'overview';
  ui.menu = { q: '', cat: 'Semua', status: 'Semua', sort: 'Unggulan' };
  ui.adminTab = 'products';
  ui.adminSearch = '';
  ui.storySearch = '';
  ui.editingStoryId = null;
  ui.lastOrder = null;
  saveState();
}
