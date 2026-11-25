import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_SETTINGS, SEED_PRODUCTS } from '../data/seed.js';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  formatRupiah,
  formatWaDisplay,
  slugifyProduct,
  validateCheckoutForm,
  validateProductForm,
  validateStoryForm,
} from './format.js';
import {
  calculateCartSummary,
  countProductsInCategory,
  filterAndSortProducts,
  getFeaturedProducts,
} from './menuFilter.js';
import { getDishIllustrationSpec, getSlideDirection } from './heroMotion.js';

test('formatRupiah formats Indonesian currency accurately', () => {
  assert.equal(formatRupiah(85000), 'Rp 85.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('formatWaDisplay formats 62 numbers cleanly', () => {
  assert.equal(formatWaDisplay('6281269002470'), '+62 812-6900-2470');
});

test('slugifyProduct generates unique slugs against existing products', () => {
  const existing = [{ id: 'sie-reuboh' }, { id: 'sie-reuboh-2' }];
  assert.equal(slugifyProduct('Sie Reuboh', existing), 'sie-reuboh-3');
  assert.equal(slugifyProduct('Ayam Tangkap Baru!', existing), 'ayam-tangkap-baru');
});

test('filterAndSortProducts filters by category, status, query and sorts', () => {
  const byCategory = filterAndSortProducts(SEED_PRODUCTS, { cat: 'Sambal & Bumbu' });
  assert.equal(byCategory.length, 2);

  const byQuery = filterAndSortProducts(SEED_PRODUCTS, { q: 'cuka aren' });
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'sie-reuboh');

  const byStatus = filterAndSortProducts(SEED_PRODUCTS, { status: 'Pre-Order' });
  assert.equal(byStatus.length, 1);
  assert.equal(byStatus[0].id, 'timphan-srikaya');

  const sortedLow = filterAndSortProducts(SEED_PRODUCTS, { sort: 'Harga Terendah' });
  assert.equal(sortedLow[0].price <= sortedLow[1].price, true);
});

test('getFeaturedProducts returns up to 4 featured dishes', () => {
  const featured = getFeaturedProducts(SEED_PRODUCTS, 4);
  assert.equal(featured.length, 4);
  assert.equal(featured.every((p: { featured?: boolean }) => p.featured), true);
});

test('calculateCartSummary computes item count, subtotal, and free delivery threshold', () => {
  const summary = calculateCartSummary(SEED_PRODUCTS, {
    'sie-reuboh': 3, // 3 * 85.000 = 255.000
    'sambal-ganja': 1, // 35.000
    'non-existent': 5,
  });
  assert.equal(summary.count, 4);
  assert.equal(summary.subtotal, 290000);
  assert.equal(summary.freeDeliveryEligible, true);

  const smallOrder = calculateCartSummary(SEED_PRODUCTS, { 'sambal-ganja': 2 });
  assert.equal(smallOrder.subtotal, 70000);
  assert.equal(smallOrder.freeDeliveryEligible, false);
});

test('countProductsInCategory counts products matching category', () => {
  assert.equal(countProductsInCategory(SEED_PRODUCTS, 'Lauk Utama'), 3);
  assert.equal(countProductsInCategory(SEED_PRODUCTS, 'Kue Tradisional'), 3);
});

test('validateCheckoutForm rejects invalid inputs and accepts valid kurir/pickup inputs', () => {
  const invalid = validateCheckoutForm({
    name: 'Ab',
    phone: '123',
    method: 'kurir',
    address: 'pendek',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.address);

  const validKurir = validateCheckoutForm({
    name: 'Cut Meutia',
    phone: '081269002470',
    method: 'kurir',
    address: 'Jl. Tgk Chik Ditiro No. 14, Banda Aceh',
  });
  assert.equal(validKurir.valid, true);

  const validPickup = validateCheckoutForm({
    name: 'Teuku Umar',
    phone: '6281269002470',
    method: 'pickup',
    address: '',
  });
  assert.equal(validPickup.valid, true);
});

test('validateProductForm enforces required product fields and price', () => {
  const invalid = validateProductForm({
    name: 'AB',
    price: 500,
    category: '',
    desc: 'pendek',
    rating: 6,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.price);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.desc);
  assert.ok(invalid.errors.rating);

  const valid = validateProductForm({
    name: 'Gulai Pliek U',
    price: 45000,
    category: 'Lauk Utama',
    desc: 'Sayuran khas Aceh dengan bumbu patarana kaya rempah.',
    rating: 4.9,
  });
  assert.equal(valid.valid, true);
});

test('buildWhatsAppOrderMessage and buildWhatsAppUrl format receipt cleanly', () => {
  const msg = buildWhatsAppOrderMessage(
    {
      name: 'Cut Nyak',
      phone: '081234567890',
      method: 'kurir',
      address: 'Jl. Diponegoro No. 5, Banda Aceh',
      note: 'Tanpa cabai',
      items: [{ p: { name: 'Sie Reuboh', subtitle: 'Resep Indatu', price: 85000 }, q: 2 }],
      subtotal: 170000,
      total: 170000,
    },
    DEFAULT_SETTINGS
  );
  assert.match(msg, /\*PESANAN BARU — PAJÔH\*/);
  assert.match(msg, /Sie Reuboh/);
  assert.match(msg, /Rp 170\.000/);
  assert.match(msg, /Catatan: Tanpa cabai/);

  const url = buildWhatsAppUrl('62812-6900-2470', msg);
  assert.equal(url.startsWith('https://wa.me/6281269002470?text='), true);
});

test('DEFAULT_SETTINGS includes updated Instagram and Surel contact info', () => {
  assert.equal(DEFAULT_SETTINGS.instagram, 'https://www.instagram.com/mhdsraa/');
  assert.equal(DEFAULT_SETTINGS.email, 'muhammadisraaulia21@gmail.com');
});

test('getSlideDirection resolves forward, backward, and wrap-around transitions', () => {
  assert.equal(getSlideDirection(0, 1, 4), 'next');
  assert.equal(getSlideDirection(2, 1, 4), 'prev');
  assert.equal(getSlideDirection(3, 0, 4), 'next');
  assert.equal(getSlideDirection(0, 3, 4), 'prev');
});

test('getDishIllustrationSpec returns 4 staggered follow-along nodes for featured and custom dishes', () => {
  const sieSpec = getDishIllustrationSpec(SEED_PRODUCTS[0]);
  assert.equal(sieSpec.motifKey, 'sie-reuboh');
  assert.equal(sieSpec.nodes.length, 4);
  assert.equal(sieSpec.nodes[0].delayMs < sieSpec.nodes[3].delayMs, true);

  const customSpec = getDishIllustrationSpec({
    id: 'kue-khusus',
    name: 'Kue Khazanah',
    category: 'Kue Tradisional',
    spices: ['Tepung Ketan', 'Gula Aren'],
    desc: 'Kue manis warisan Aceh.',
  });
  assert.equal(customSpec.motifKey, 'kue-tradisional');
  assert.equal(customSpec.nodes.length, 4);
});

test('validateStoryForm validates required chapter tag, title, and paragraphs', () => {
  const invalid = validateStoryForm({
    tag: 'B',
    title: 'Hai',
    paragraphs: 'Pendek',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.tag);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.paragraphs);

  const valid = validateStoryForm({
    tag: 'Bab V · Kopi Aceh',
    title: 'Kopi Saring: dari kedai ke meja rumah',
    paragraphs: 'Paragraf pertama tentang kopi Ulee Kareng yang disangrai perlahan.\n\nParagraf kedua tentang tradisi pagi di Banda Aceh.',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.paragraphs.length, 2);
});
