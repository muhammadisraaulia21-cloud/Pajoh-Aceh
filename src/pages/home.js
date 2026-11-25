import { HERO_THEMES } from '../data/seed.js';
import {
  addToCart,
  getLikeCount,
  state,
  toggleLike,
  ui,
} from '../state/store.js';
import { productCardHtml, sectionEyebrow, showToast } from '../components/ui.js';
import { updateCartBadge } from '../components/layout.js';
import { escapeHtml, formatRupiah } from '../utils/format.js';
import { getDishIllustrationSpec, getSlideDirection } from '../utils/heroMotion.js';
import { renderBotanicalGlyph, renderSlideTrailSvg } from '../utils/illustrations.js';
import { filterAndSortProducts, getFeaturedProducts } from '../utils/menuFilter.js';
import { bindImageFallbacks, createDishFallbackDataUrl, renderImgTag } from '../utils/image.js';
import { renderIcons } from '../utils/icons.js';

const NODE_POSITIONS = {
  tl: '-left-2 top-3 sm:-left-6 sm:top-6',
  tr: '-right-2 bottom-20 sm:-right-7 sm:bottom-24',
  bl: '-left-2 bottom-5 sm:-left-5 sm:bottom-7',
  br: 'right-6 -bottom-3 sm:right-8 sm:-bottom-4',
};

const NODE_PARALLAX_DEPTH = [10, -12, 8, -9];

function heroBackgroundHtml() {
  return `
  <div class="pointer-events-none absolute inset-0">
    <svg class="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
      <path id="ribbonA" style="fill:#D9E7DE;transition:fill .7s ease" d="M0,0 L1440,0 L1440,250 C1080,110 760,340 380,250 C220,212 90,208 0,268 Z"/>
      <path id="ribbonB" style="fill:#C4DACA;opacity:.6;transition:fill .7s ease" d="M0,900 L1440,900 L1440,640 C1120,765 820,560 480,700 C300,772 120,730 0,660 Z"/>
      <path d="M-60,470 C260,300 620,620 1500,420" fill="none" stroke="#D4AF37" stroke-width="1" opacity=".32"/>
      <path d="M-60,502 C260,332 620,652 1500,452" fill="none" stroke="#D4AF37" stroke-width="1" opacity=".16"/>
    </svg>
    <div id="hero-glow-a" class="absolute -left-24 top-1/4 h-72 w-72 rounded-full opacity-50 blur-3xl transition-colors duration-700" style="background:#D2E3D8"></div>
    <div id="hero-glow-b" class="absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-40 blur-3xl transition-colors duration-700" style="background:#E4EEE7"></div>
  </div>`;
}

function heroCardInnerHtml(product) {
  const liked = Boolean(state.savedLikes[product.id]);
  const soldOut = product.status === 'Habis';

  return `
    <div class="flex rounded-xl bg-pajoh-ivory p-1" role="tablist" aria-label="Info hidangan">
      <button type="button" data-hero-tab="overview" class="flex-1 rounded-lg bg-white py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-pajoh-green whitespace-nowrap shadow-sm cursor-pointer">
        Ringkasan
      </button>
    </div>
    <div class="fade-up">
      <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
        <span class="tabular-nums font-bold text-pajoh-green">${formatRupiah(product.price)}</span>
        <span aria-hidden="true" class="text-pajoh-green/25">·</span>
        <span class="tabular-nums font-semibold text-[#8A6A1F]">★ ${product.rating || 4.8}</span>
        <span aria-hidden="true" class="text-pajoh-green/25">·</span>
        <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-pajoh-green/65">${escapeHtml(product.category)}</span>
      </div>
      <p class="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6A1F]">${escapeHtml(product.subtitle)}</p>
      <h2 class="serif mt-1 text-[26px] font-semibold leading-tight text-pajoh-green">${escapeHtml(product.name)}</h2>
      <p class="mt-2 text-[13px] leading-relaxed text-pajoh-ink/70">${escapeHtml(product.desc)}</p>
      <div class="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-pajoh-green/15 pt-4">
        <button type="button" data-hero-like="${escapeHtml(product.id)}" class="group inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold cursor-pointer ${
          liked ? 'text-rose-500' : 'text-pajoh-ink/50 hover:text-rose-500'
        }" aria-label="Favoritkan ${escapeHtml(product.name)}" aria-pressed="${liked ? 'true' : 'false'}">
          <i data-lucide="heart" class="h-4 w-4 ${liked ? 'fill-current' : ''} transition-transform group-active:scale-125"></i>
          <span class="tabular-nums">${getLikeCount(product)}</span>
        </button>
        <button type="button" data-hero-checkout="${escapeHtml(product.id)}" ${soldOut ? 'disabled' : ''} class="inline-flex shrink-0 items-center justify-center rounded-full bg-pajoh-green px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-pajoh-ivory whitespace-nowrap transition hover:bg-pajoh-forest disabled:opacity-40 cursor-pointer">
          ${soldOut ? 'Habis' : 'Checkout'}
        </button>
        <a href="#/product/${encodeURIComponent(product.id)}" class="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-pajoh-green whitespace-nowrap transition hover:text-[#8A6A1F]">
          Lihat Detail <i data-lucide="arrow-up-right" class="h-3.5 w-3.5"></i>
        </a>
      </div>
    </div>`;
}

function heroSpiceNoteHtml(spec, activeIdx) {
  const nodes = spec.nodes || [];
  const idx = activeIdx >= 0 && activeIdx < nodes.length ? activeIdx : 0;
  const current = nodes[idx] || nodes[0];
  if (!current) return '';

  return `
    <div class="flex flex-wrap items-center justify-center gap-1.5 lg:justify-start" role="tablist" aria-label="Catatan ilustrasi rempah">
      ${nodes
        .map((n, i) => {
          const active = i === idx;
          return `<button type="button" role="tab" aria-selected="${active ? 'true' : 'false'}" data-spice-node="${i}" class="rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
            active
              ? 'bg-pajoh-green text-pajoh-ivory shadow-sm'
              : 'bg-white/75 text-pajoh-green/75 hover:bg-white hover:text-pajoh-green'
          }">${escapeHtml(n.label)}</button>`;
        })
        .join('')}
    </div>
    <p class="mt-2 text-[12.5px] leading-relaxed text-pajoh-ink/75">
      <span class="font-semibold text-pajoh-green">${escapeHtml(current.label)}:</span>
      ${escapeHtml(current.note)}
    </p>`;
}

function heroStageHtml(list, product) {
  const soldOut = product.status === 'Habis';
  const dir = ui.heroDirection === 'prev' ? 'prev' : 'next';
  const spec = getDishIllustrationSpec(product);
  const activeSpiceIdx = ui.heroSpiceIdx % spec.nodes.length;

  const dots = list
    .map((item, i) => {
      const active = i === ui.heroIndex;
      return `<button type="button" data-hero-goto="${i}" aria-label="Tampilkan ${escapeHtml(item.name)}" class="rounded-full transition-all duration-300 cursor-pointer ${
        active ? 'bg-pajoh-green' : 'bg-pajoh-green/25 hover:bg-pajoh-green/55'
      }" style="width:10px;height:${active ? '28px' : '10px'}"></button>`;
    })
    .join('');

  const illustrationNodes = spec.nodes
    .map((node, idx) => {
      const active = idx === activeSpiceIdx;
      const posCls = NODE_POSITIONS[node.slot] || NODE_POSITIONS.tl;
      const followCls = dir === 'prev' ? 'illust-follow-prev' : 'illust-follow-next';
      return `<button
        type="button"
        data-trail-illust
        data-spice-node="${idx}"
        data-depth="${NODE_PARALLAX_DEPTH[idx] || 8}"
        data-motif="${escapeHtml(spec.motifKey)}"
        aria-label="Ilustrasi ${escapeHtml(node.label)}"
        aria-pressed="${active ? 'true' : 'false'}"
        title="${escapeHtml(node.label)}"
        style="animation-delay:${node.delayMs}ms"
        class="illust-node pointer-events-auto ${followCls} ${posCls} group absolute z-20 flex h-12 w-12 items-center justify-center rounded-full border bg-white/95 p-2 shadow-lg backdrop-blur-sm cursor-pointer sm:h-14 sm:w-14 ${
          active
            ? 'border-pajoh-gold text-pajoh-green ring-2 ring-pajoh-green/35 scale-105'
            : 'border-pajoh-gold/45 text-pajoh-green/80 hover:border-pajoh-gold hover:text-pajoh-green hover:scale-105'
        }">
        ${renderBotanicalGlyph(node.icon)}
      </button>`;
    })
    .join('');

  const thumbs = list
    .map((item, i) => {
      const active = i === ui.heroIndex;
      return `<button type="button" data-hero-goto="${i}" class="snap-start w-[160px] shrink-0 rounded-xl border p-2 text-left transition-all duration-200 cursor-pointer ${
        active
          ? 'border-pajoh-gold bg-white shadow-lg scale-[1.03]'
          : 'border-white/70 bg-white/60 hover:bg-white hover:border-pajoh-gold/50'
      }">
        <div class="flex items-center gap-2.5">
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-pajoh-gold/40">
            ${renderImgTag(item, 'h-full w-full object-cover')}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[12px] font-semibold text-pajoh-green">${escapeHtml(item.name)}</p>
            <p class="tabular-nums text-[10.5px] text-pajoh-ink/55">${formatRupiah(item.price)}</p>
          </div>
        </div>
      </button>`;
    })
    .join('');

  return `
  <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
    <div class="relative order-1 lg:col-span-5 xl:col-span-4">
      <div class="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-2.5 sm:flex">${dots}</div>
      <div class="relative mx-auto aspect-square w-[268px] sm:w-[340px] lg:w-[380px] xl:w-[420px]">
        <div class="spin-slow pointer-events-none absolute inset-0 rounded-full border border-dashed border-pajoh-gold/45"></div>
        <div class="trail-sweep-in pointer-events-none absolute inset-0">${renderSlideTrailSvg(dir)}</div>
        <div id="hero-aroma-ripple" class="pointer-events-none absolute inset-5 rounded-full"></div>
        <div class="pointer-events-none absolute inset-3 rounded-full bg-white/50 backdrop-blur-[2px]"></div>

        <div id="hero-platter-wrap" class="platter-in-${dir} absolute inset-6 overflow-hidden rounded-full shadow-[0_38px_70px_-28px_rgba(2,44,34,0.55)] ring-[7px] ring-white/85">
          <button type="button" id="hero-platter-btn" class="group relative block h-full w-full cursor-pointer overflow-hidden rounded-full" aria-label="Sentuh hidangan ${escapeHtml(product.name)} untuk melihat jejak aroma dan ilustrasi rempah">
            ${renderImgTag(product, 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105', { lazy: false, alt: `${product.name} — hidangan Pajôh` })}
            <span class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-4 pt-8 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-pajoh-ivory">Sentuh Piring · Jelajahi Rempah</span>
            </span>
          </button>
          <div class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-pajoh-gold/35"></div>
        </div>

        <div id="hero-illust-layer" class="pointer-events-none absolute inset-0" data-motif="${escapeHtml(spec.motifKey)}">
          ${illustrationNodes}
        </div>

        <div class="pointer-events-none absolute -right-1 top-2 z-20 flex h-[74px] w-[74px] rotate-6 flex-col items-center justify-center rounded-full bg-pajoh-green text-pajoh-gold shadow-xl ring-4 ring-white/75">
          <i data-lucide="wheat" class="h-4 w-4"></i>
          <span class="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-white/65">Resep</span>
          <span class="serif text-[15px] font-semibold leading-none text-white">Indatu</span>
        </div>
      </div>
    </div>

    <div class="order-2 text-center lg:col-span-4 xl:col-span-5 lg:text-left">
      <div id="hero-copy">
        <div class="line-in d1 flex items-center justify-center gap-3 lg:justify-start">
          <span class="h-px w-8 bg-pajoh-gold"></span>
          <span class="text-[11px] font-semibold uppercase tracking-[0.24em] text-pajoh-green/70">${ui.heroIndex + 1} · ${escapeHtml(product.kicker || state.settings.highlight)}</span>
        </div>
        <h1 class="mt-5" style="text-wrap:balance">
          <span class="reveal"><span class="line-in d2 block text-[13px] uppercase tracking-[0.34em] text-pajoh-green/70 sm:text-sm">${escapeHtml(product.eyebrow)}</span></span>
          <span class="reveal mt-1"><span class="line-in d3 block serif text-[42px] font-bold leading-[0.94] text-pajoh-green sm:text-6xl xl:text-[66px]">${escapeHtml(product.name)}</span></span>
        </h1>
        <p class="line-in d4 mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-pajoh-ink/70 lg:mx-0">${escapeHtml(product.desc)}</p>
        <div class="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          <button type="button" id="hero-story-btn" class="btn btn-outline">
            <i data-lucide="book-open" class="h-4 w-4"></i> Cerita Kuliner
          </button>
          <button type="button" data-hero-add="${escapeHtml(product.id)}" ${soldOut ? 'disabled' : ''} class="btn btn-primary">
            ${soldOut ? 'Stok Habis' : 'Pesan Sekarang'} <i data-lucide="shopping-bag" class="h-4 w-4"></i>
          </button>
        </div>

        <div id="hero-spice-bar" class="fade-up d2 mx-auto mt-6 max-w-lg rounded-2xl border border-pajoh-green/10 bg-white/75 p-3.5 text-left backdrop-blur-sm lg:mx-0">
          ${heroSpiceNoteHtml(spec, activeSpiceIdx)}
        </div>
      </div>
    </div>

    <div class="order-3 lg:col-span-3">
      <div id="hero-card" class="fade-up mx-auto w-full max-w-[350px] rounded-2xl bg-white p-5 shadow-xl ring-1 ring-pajoh-green/10 lg:max-w-none">
        ${heroCardInnerHtml(product)}
      </div>
    </div>
  </div>

  <div class="mt-10 lg:mt-12">
    <div class="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3">
      <button type="button" data-hero-step="-1" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pajoh-green/15 bg-white/80 text-pajoh-green transition hover:bg-white hover:border-pajoh-gold cursor-pointer" aria-label="Hidangan sebelumnya">
        <i data-lucide="chevron-left" class="h-4 w-4"></i>
      </button>
      <div class="no-scrollbar flex flex-1 snap-x gap-3 overflow-x-auto px-1 py-1">${thumbs}</div>
      <button type="button" data-hero-step="1" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pajoh-green/15 bg-white/80 text-pajoh-green transition hover:bg-white hover:border-pajoh-gold cursor-pointer" aria-label="Hidangan berikutnya">
        <i data-lucide="chevron-right" class="h-4 w-4"></i>
      </button>
    </div>
  </div>`;
}

function kitchenExplorerGridHtml(category) {
  const items = filterAndSortProducts(state.products, {
    cat: category,
    sort: 'Unggulan',
  }).slice(0, 3);

  if (!items.length) {
    return `<div class="col-span-full rounded-2xl border border-dashed border-pajoh-green/20 bg-white/70 p-10 text-center">
      <p class="serif text-2xl text-pajoh-green">Belum ada menu pada kategori ini</p>
      <a href="#/menu" class="btn btn-outline btn-sm mt-4">Lihat Semua Menu</a>
    </div>`;
  }

  return items.map((p) => productCardHtml(p)).join('');
}

function brandAndKitchenSectionHtml() {
  const items = [
    { icon: 'book-open', title: 'Resep Indatu', text: 'Ditulis ulang dari catatan dapur keluarga, takaran demi takaran.' },
    { icon: 'leaf', title: 'Rempah Asli Aceh', text: 'Asam sunti, temurui, dan cuka aren langsung dari petani tanah rencong.' },
    { icon: 'shield-check', title: 'Higienis & Fresh', text: 'Dimasak per pesanan di dapur kami di Banda Aceh, tanpa pengawet.' },
  ];

  const categories = ['Semua', ...state.categories];
  const activeCat = categories.includes(ui.homeCategory) ? ui.homeCategory : 'Semua';

  return `
  <section class="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
    <div class="grid gap-5 sm:grid-cols-3">
      ${items
        .map(
          (it, i) => `<div class="fade-up card-lift rounded-2xl border border-pajoh-green/10 bg-white/80 p-6" style="animation-delay:${i * 80}ms">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green">
              <i data-lucide="${it.icon}" class="h-5 w-5"></i>
            </span>
            <h3 class="serif mt-4 text-xl font-semibold text-pajoh-green">${it.title}</h3>
            <p class="mt-1.5 text-[13.5px] leading-relaxed text-pajoh-ink/65">${it.text}</p>
          </div>`
        )
        .join('')}
    </div>

    <div class="mt-14 border-t border-pajoh-green/10 pt-12">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          ${sectionEyebrow('Pilihan Dapur Pajôh')}
          <h2 class="serif mt-3 text-3xl font-semibold leading-tight text-pajoh-green sm:text-4xl" style="text-wrap:balance">Racikan Hari Ini</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap gap-1 rounded-xl bg-pajoh-sand p-1" role="tablist" aria-label="Filter cepat kategori beranda">
            ${categories
              .map((c) => {
                const active = activeCat === c;
                return `<button type="button" role="tab" aria-selected="${active ? 'true' : 'false'}" data-home-cat="${escapeHtml(c)}" class="rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-white text-pajoh-green shadow-sm'
                    : 'text-pajoh-green/65 hover:text-pajoh-green'
                }">${escapeHtml(c)}</button>`;
              })
              .join('')}
          </div>
          <a href="#/menu" class="btn btn-outline btn-sm">Semua Menu <i data-lucide="arrow-right" class="h-3.5 w-3.5"></i></a>
        </div>
      </div>

      <div id="home-menu-grid" class="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${kitchenExplorerGridHtml(activeCat)}
      </div>
    </div>
  </section>`;
}

function storyTeaserHtml() {
  const kitchenFallback = createDishFallbackDataUrl('Dapur Pajôh', 'Peunayong, Banda Aceh');
  return `
  <section class="relative bg-pajoh-sand/65">
    <div class="aceh-band"></div>
    <div class="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
      <div class="relative order-2 lg:order-1">
        <div class="absolute -left-4 -top-4 hidden h-24 w-24 rounded-full border border-pajoh-gold/40 sm:block"></div>
        <div class="overflow-hidden rounded-[2rem] shadow-soft">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80" data-fallback-src="${escapeHtml(kitchenFallback)}" alt="Dapur Pajôh di Banda Aceh" loading="lazy" referrerpolicy="no-referrer" class="h-[340px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[420px]" />
        </div>
        <div class="absolute -bottom-5 right-4 rounded-xl bg-white px-5 py-4 shadow-xl ring-1 ring-pajoh-green/10">
          <p class="serif text-2xl font-bold text-pajoh-green">Sejak 2016</p>
          <p class="text-[10px] uppercase tracking-[0.2em] text-[#8A6A1F]">Dapur Peunayong</p>
        </div>
      </div>
      <div class="order-1 lg:order-2">
        ${sectionEyebrow('Kisah Kuliner')}
        <h2 class="serif mt-4 text-4xl font-semibold leading-[1.06] text-pajoh-green sm:text-5xl" style="text-wrap:balance">Secangkir cuka aren,<br /><span class="italic text-[#8A6A1F]">seratus tahun</span> ketabahan.</h2>
        <p class="mt-4 max-w-lg text-[14.5px] leading-relaxed text-pajoh-ink/70">Sie Reuboh bukan sekadar lauk. Ia adalah bekal yang menemani para pejuang Aceh menembus hutan, cara nenek kami menjaga rumah tetap harum, dan alasan kami percaya bahwa masakan yang dimasak perlahan selalu punya cerita.</p>
        <p class="mt-3 max-w-lg text-[14.5px] leading-relaxed text-pajoh-ink/70">Baca empat kisah di balik rempah yang kami pakai setiap hari—tentang kesabaran, laut, dan doa yang dibungkus daun pisang.</p>
        <a href="#/story" class="btn btn-primary mt-7">Baca Kisah Kuliner <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
      </div>
    </div>
  </section>`;
}

function philosophyHtml() {
  return `
  <section class="relative overflow-hidden bg-pajoh-green py-16 text-pajoh-ivory lg:py-24">
    <svg class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]" viewBox="0 0 1440 500" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,80 C300,220 560,10 900,140 C1160,240 1300,60 1440,150" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
      <path d="M0,420 C320,300 640,520 980,380 C1200,290 1320,420 1440,360" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
      <circle cx="1180" cy="120" r="150" fill="none" stroke="#D4AF37" stroke-width="1"/>
      <circle cx="220" cy="400" r="110" fill="none" stroke="#D4AF37" stroke-width="1"/>
    </svg>
    <div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
      <div class="aceh-band mx-auto mb-8 max-w-[220px] opacity-70"></div>
      <i data-lucide="quote" class="mx-auto h-8 w-8 text-pajoh-gold/75"></i>
      <p class="serif mt-5 text-2xl font-normal italic leading-snug sm:text-4xl" style="text-wrap:balance">“Di Aceh, makanan tidak pernah sekadar mengenyangkan. Ia adalah doa yang dihidangkan, cerita yang diwariskan, dan cara paling hangat untuk mengatakan: kami peduli.”</p>
      <p class="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-pajoh-gold">Filosofi Dapur Pajôh</p>
      <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
        <a href="#/menu" class="btn btn-gold">Jelajahi Menu <i data-lucide="utensils" class="h-4 w-4"></i></a>
        <a href="#/contact" class="btn border border-white/25 text-pajoh-ivory hover:bg-white/10">Kunjungi Dapur</a>
      </div>
    </div>
  </section>`;
}

export function renderHomePage() {
  return `
  <section id="hero-section" class="relative overflow-hidden transition-colors duration-700" style="background:#ECF2ED">
    ${heroBackgroundHtml()}
    <div id="hero-stage" class="relative mx-auto flex max-w-[1400px] flex-col justify-center px-4 pb-14 pt-10 sm:px-6 lg:min-h-[calc(100vh-96px)] lg:px-10 lg:pb-12 lg:pt-14"></div>
  </section>
  ${brandAndKitchenSectionHtml()}
  ${storyTeaserHtml()}
  ${philosophyHtml()}`;
}

export function mountHomePage() {
  renderHeroStage();
  mountHeroParallax();
  mountKitchenExplorer();
}

function renderHeroStage() {
  const list = getFeaturedProducts(state.products, 4);
  const stage = document.getElementById('hero-stage');
  if (!stage) return;

  if (!list.length) {
    stage.innerHTML = `<div class="py-24 text-center">
      <p class="serif text-3xl text-pajoh-green">Belum ada hidangan unggulan</p>
      <p class="mt-2 text-sm text-pajoh-ink/65">Tambahkan produk melalui Admin Dashboard.</p>
      <a href="#/admin" class="btn btn-primary mt-6">Buka Admin</a>
    </div>`;
    renderIcons();
    return;
  }

  if (ui.heroIndex >= list.length) ui.heroIndex = 0;
  const product = list[ui.heroIndex];
  const theme = HERO_THEMES[ui.heroIndex % HERO_THEMES.length];

  const sec = document.getElementById('hero-section');
  if (sec) sec.style.backgroundColor = theme.bg;
  const ribbonA = document.getElementById('ribbonA');
  if (ribbonA) ribbonA.style.fill = theme.ribbonA;
  const ribbonB = document.getElementById('ribbonB');
  if (ribbonB) ribbonB.style.fill = theme.ribbonB;
  const glowA = document.getElementById('hero-glow-a');
  if (glowA) glowA.style.backgroundColor = theme.swatch;
  const glowB = document.getElementById('hero-glow-b');
  if (glowB) glowB.style.backgroundColor = theme.swatch2;

  stage.innerHTML = heroStageHtml(list, product);
  bindImageFallbacks(stage);
  bindHeroListeners(stage, list, product);
  renderIcons();
}

function triggerAromaRipple() {
  const host = document.getElementById('hero-aroma-ripple');
  if (!host) return;
  const ring = document.createElement('span');
  ring.className = 'aroma-ripple absolute inset-0 rounded-full border-2 border-pajoh-gold/60';
  host.appendChild(ring);
  setTimeout(() => ring.remove(), 750);
}

function pulseIllustrationWave(targetIndex = null) {
  const nodes = document.querySelectorAll('[data-trail-illust]');
  nodes.forEach((el, idx) => {
    const matches = targetIndex === null || idx === targetIndex;
    if (!matches) return;
    el.classList.remove('is-beat');
    void el.offsetWidth;
    if (targetIndex === null) {
      el.style.animationDelay = `${idx * 65}ms`;
    } else {
      el.style.animationDelay = '0ms';
    }
    el.classList.add('is-beat');
  });
}

function setActiveSpiceNode(product, idx) {
  const spec = getDishIllustrationSpec(product);
  const safeIdx = ((idx % spec.nodes.length) + spec.nodes.length) % spec.nodes.length;
  ui.heroSpiceIdx = safeIdx;

  document.querySelectorAll('[data-trail-illust]').forEach((el, i) => {
    const active = i === safeIdx;
    el.setAttribute('aria-pressed', active ? 'true' : 'false');
    el.classList.toggle('border-pajoh-gold', active);
    el.classList.toggle('ring-2', active);
    el.classList.toggle('ring-pajoh-green/35', active);
    el.classList.toggle('scale-105', active);
    el.classList.toggle('border-pajoh-gold/45', !active);
  });

  const spiceBar = document.getElementById('hero-spice-bar');
  if (spiceBar) {
    spiceBar.innerHTML = heroSpiceNoteHtml(spec, safeIdx);
    bindSpiceControls(spiceBar, product);
  }

  triggerAromaRipple();
  pulseIllustrationWave(safeIdx);
}

function bindSpiceControls(scope, product) {
  scope.querySelectorAll('[data-spice-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.spiceNode);
      setActiveSpiceNode(product, idx);
    });
  });
}

function refreshHeroCardOnly(product) {
  const card = document.getElementById('hero-card');
  if (!card) return;
  card.classList.remove('fade-up');
  card.innerHTML = heroCardInnerHtml(product);
  void card.offsetWidth;
  card.classList.add('fade-up');
  bindHeroCardListeners(card, product);
  renderIcons();
}

function bindHeroCardListeners(card, product) {
  const likeBtn = card.querySelector('[data-hero-like]');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      toggleLike(product.id);
      refreshHeroCardOnly(product);
    });
  }

  const checkoutBtn = card.querySelector('[data-hero-checkout]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (product.status === 'Habis') {
        showToast(`Maaf, ${product.name} sedang habis.`, 'error');
        return;
      }
      if (!state.cart[product.id]) {
        const res = addToCart(product.id, 1);
        if (!res.ok) {
          showToast(res.reason, 'error');
          return;
        }
        updateCartBadge();
      }
      location.hash = '#/checkout';
    });
  }
}

function bindHeroListeners(stage, list, product) {
  stage.querySelectorAll('[data-hero-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.heroGoto);
      heroGoto(idx, list);
    });
  });

  stage.querySelectorAll('[data-hero-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.heroStep);
      heroGoto(ui.heroIndex + delta, list);
    });
  });

  const platterBtn = document.getElementById('hero-platter-btn');
  if (platterBtn) {
    platterBtn.addEventListener('click', () => {
      const spec = getDishIllustrationSpec(product);
      const nextSpice = (ui.heroSpiceIdx + 1) % spec.nodes.length;
      setActiveSpiceNode(product, nextSpice);
      pulseIllustrationWave(null);
    });
  }

  bindSpiceControls(stage, product);

  const storyBtn = document.getElementById('hero-story-btn');
  if (storyBtn) {
    storyBtn.addEventListener('click', () => {
      const storyMap = {
        'sie-reuboh': 'sie-reuboh',
        'keumamah-tumis': 'keumamah',
        'timphan-srikaya': 'timphan',
      };
      if (storyMap[product.id]) {
        location.hash = `#/story?s=${storyMap[product.id]}`;
      } else {
        location.hash = `#/product/${encodeURIComponent(product.id)}`;
      }
    });
  }

  const copyAddBtn = document.querySelector('#hero-copy [data-hero-add]');
  if (copyAddBtn) {
    copyAddBtn.addEventListener('click', () => handleHeroAdd(product.id));
  }

  const card = document.getElementById('hero-card');
  if (card) bindHeroCardListeners(card, product);
}

function mountHeroParallax() {
  const section = document.getElementById('hero-section');
  if (!section || section.dataset.parallaxBound === '1') return;
  section.dataset.parallaxBound = '1';

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let raf = 0;
  let lastX = 0;
  let lastY = 0;

  section.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const rect = section.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    lastX = (e.clientX - rect.left) / rect.width - 0.5;
    lastY = (e.clientY - rect.top) / rect.height - 0.5;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      document.querySelectorAll('[data-trail-illust]').forEach((el) => {
        const depth = Number(el.dataset.depth) || 8;
        el.style.setProperty('--px', `${(lastX * depth).toFixed(1)}px`);
        el.style.setProperty('--py', `${(lastY * depth).toFixed(1)}px`);
      });
    });
  });

  section.addEventListener('pointerleave', () => {
    document.querySelectorAll('[data-trail-illust]').forEach((el) => {
      el.style.setProperty('--px', '0px');
      el.style.setProperty('--py', '0px');
    });
  });
}

function mountKitchenExplorer() {
  const app = document.getElementById('app');
  if (!app) return;

  const bindCards = () => {
    const grid = document.getElementById('home-menu-grid');
    if (!grid) return;
    bindImageFallbacks(grid);
    grid.querySelectorAll('[data-add-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        handleHeroAdd(btn.dataset.addCart);
      });
    });
    renderIcons();
  };

  app.querySelectorAll('[data-home-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.homeCat || 'Semua';
      ui.homeCategory = cat;
      app.querySelectorAll('[data-home-cat]').forEach((b) => {
        const active = b.dataset.homeCat === cat;
        b.setAttribute('aria-selected', active ? 'true' : 'false');
        b.className = `rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
          active
            ? 'bg-white text-pajoh-green shadow-sm'
            : 'text-pajoh-green/65 hover:text-pajoh-green'
        }`;
      });
      const grid = document.getElementById('home-menu-grid');
      if (grid) {
        grid.innerHTML = kitchenExplorerGridHtml(cat);
        bindCards();
      }
    });
  });

  bindCards();
}

function handleHeroAdd(productId) {
  const res = addToCart(productId, 1);
  if (!res.ok) {
    showToast(res.reason, 'error');
    return;
  }
  updateCartBadge();
  showToast(`${res.product.name} (1) ditambahkan ke keranjang.`);
}

function heroGoto(index, list) {
  if (!list.length || ui.heroBusy) return;
  const next = ((index % list.length) + list.length) % list.length;
  if (next === ui.heroIndex) return;

  const dir = getSlideDirection(ui.heroIndex, next, list.length);
  ui.heroDirection = dir;
  ui.heroBusy = true;

  const platter = document.getElementById('hero-platter-wrap');
  const copy = document.getElementById('hero-copy');
  const card = document.getElementById('hero-card');
  const spiceBar = document.getElementById('hero-spice-bar');

  if (platter) platter.classList.add(dir === 'prev' ? 'is-out-prev' : 'is-out-next');
  if (copy) copy.classList.add('is-out');
  if (card) card.classList.add('is-out');
  if (spiceBar) spiceBar.classList.add('is-out');

  document.querySelectorAll('[data-trail-illust]').forEach((el) => {
    el.classList.add(dir === 'prev' ? 'is-out-prev' : 'is-out');
  });

  setTimeout(() => {
    ui.heroIndex = next;
    ui.heroTab = 'overview';
    ui.heroSpiceIdx = 0;
    ui.heroBusy = false;
    renderHeroStage();
  }, 260);
}
