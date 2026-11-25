export function filterAndSortProducts(products, { q = '', cat = 'Semua', status = 'Semua', sort = 'Unggulan' } = {}) {
  const query = String(q || '').trim().toLowerCase();

  const list = products.filter((p) => {
    const inCat = cat === 'Semua' || p.category === cat;
    const inStatus = status === 'Semua' || p.status === status;
    const haystack = [p.name, p.subtitle, p.desc, p.category]
      .concat(Array.isArray(p.spices) ? p.spices : [])
      .join(' ')
      .toLowerCase();
    const inQuery = !query || haystack.includes(query);
    return inCat && inStatus && inQuery;
  });

  if (sort === 'Harga Terendah') {
    list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sort === 'Harga Tertinggi') {
    list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sort === 'A-Z') {
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'id'));
  } else {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || Number(b.rating || 0) - Number(a.rating || 0));
  }

  return list;
}

export function getFeaturedProducts(products, limit = 4) {
  const featured = products.filter((p) => p.featured);
  return (featured.length ? featured : products).slice(0, limit);
}

export function calculateCartEntries(products, cartMap) {
  const byId = new Map(products.map((p) => [p.id, p]));
  return Object.keys(cartMap || {})
    .map((id) => ({
      p: byId.get(id) || null,
      q: Number(cartMap[id]) || 0,
    }))
    .filter((entry) => entry.p && entry.q > 0);
}

export function calculateCartSummary(products, cartMap) {
  const entries = calculateCartEntries(products, cartMap);
  const count = entries.reduce((sum, entry) => sum + entry.q, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.q * Number(entry.p.price || 0), 0);
  return {
    entries,
    count,
    subtotal,
    freeDeliveryEligible: subtotal >= 250000,
  };
}

export function countProductsInCategory(products, category) {
  return products.filter((p) => p.category === category).length;
}
