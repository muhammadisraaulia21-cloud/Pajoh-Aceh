import { findProduct, state } from '../state/store.js';
import { emptyStateHtml } from '../components/ui.js';
import { escapeHtml } from '../utils/format.js';
import { bindImageFallbacks, createDishFallbackDataUrl } from '../utils/image.js';

function storyArticleHtml(article, index) {
  const reversed = index % 2 === 1;
  const fallback = createDishFallbackDataUrl(article.title, article.tag);
  const imgSrc =
    article.image && article.image.trim() ? article.image.trim() : fallback;
  const linkedProduct = article.productId ? findProduct(article.productId) : null;
  const ctaLabel =
    article.cta && article.cta.trim()
      ? article.cta.trim()
      : linkedProduct
        ? `Pesan ${linkedProduct.name}`
        : 'Lihat Hidangan';

  return `
  <article id="story-${escapeHtml(article.id)}" class="scroll-mt-28 grid gap-8 border-t border-pajoh-green/10 py-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-16">
    <div class="lg:col-span-5 ${reversed ? 'lg:order-2' : ''}">
      <div class="relative">
        <div class="aspect-square overflow-hidden rounded-[2rem] shadow-soft bg-pajoh-sand">
          <img src="${escapeHtml(imgSrc)}" data-fallback-src="${escapeHtml(fallback)}" alt="${escapeHtml(article.title)}" loading="lazy" referrerpolicy="no-referrer" class="h-full w-full object-cover transition duration-700 hover:scale-105" />
        </div>
        <span class="absolute -bottom-3 ${reversed ? 'right-6' : 'left-6'} rounded-lg bg-pajoh-green px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-pajoh-gold shadow-lg">${escapeHtml(article.tag)}</span>
      </div>
    </div>
    <div class="lg:col-span-7 ${reversed ? 'lg:order-1' : ''}">
      <h2 class="serif text-3xl font-semibold leading-tight text-pajoh-green sm:text-[34px]">${escapeHtml(article.title)}</h2>
      <div class="mt-4 space-y-3 text-[14px] leading-relaxed text-pajoh-ink/75">
        ${(article.paragraphs || [])
          .map((t, i) => `<p class="${i === 0 ? 'drop-cap' : ''}">${escapeHtml(t)}</p>`)
          .join('')}
      </div>
      ${
        article.quote
          ? `<blockquote class="serif mt-6 border-y border-pajoh-gold/40 py-4 text-xl italic leading-snug text-pajoh-green/85">“${escapeHtml(article.quote)}”</blockquote>`
          : ''
      }
      ${
        linkedProduct
          ? `<a href="#/product/${encodeURIComponent(linkedProduct.id)}" class="btn btn-outline mt-6">${escapeHtml(ctaLabel)} <i data-lucide="arrow-up-right" class="h-4 w-4"></i></a>`
          : ''
      }
    </div>
  </article>`;
}

export function renderStoryPage() {
  const s = state.settings;
  const stories = state.stories || [];
  const heroFallback = createDishFallbackDataUrl('Kisah Kuliner', 'Warisan Aceh');
  const heroImg =
    s.storyHeroImage && s.storyHeroImage.trim()
      ? s.storyHeroImage.trim()
      : heroFallback;

  const navChips = stories
    .map((story, i) => {
      const num = String(i + 1).padStart(2, '0');
      const shortLabel =
        story.shortTitle ||
        story.id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `<a href="#/story?s=${escapeHtml(story.id)}" class="rounded-full border border-white/20 px-4 py-2 text-[11.5px] font-semibold text-pajoh-ivory/80 transition hover:border-pajoh-gold hover:text-pajoh-gold whitespace-nowrap">${num} · ${escapeHtml(shortLabel)}</a>`;
    })
    .join('');

  return `
  <section class="relative overflow-hidden bg-pajoh-green text-pajoh-ivory">
    <div class="pointer-events-none absolute inset-0 opacity-[0.16]">
      <svg class="h-full w-full" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,120 C320,260 720,20 1120,180 C1280,244 1380,120 1440,160" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M0,400 C360,260 760,520 1100,360 C1260,290 1360,380 1440,340" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
        <circle cx="1120" cy="380" r="170" fill="none" stroke="#D4AF37" stroke-width="1"/>
      </svg>
    </div>
    <div class="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-20">
      <div>
        <div class="flex items-center gap-3"><span class="h-px w-8 bg-pajoh-gold"></span><span class="text-[11px] font-bold uppercase tracking-[0.28em] text-pajoh-gold">Culinary Story</span></div>
        <h1 class="serif mt-5 text-4xl font-semibold leading-[1.02] sm:text-6xl">${escapeHtml(s.storyHeroTitle || 'Kisah dari')}<br /><span class="italic text-pajoh-gold">${escapeHtml(s.storyHeroAccent || 'dapur indatu.')}</span></h1>
        <p class="mt-5 max-w-lg text-[14px] leading-relaxed text-pajoh-ivory/70">${escapeHtml(s.storyHeroDesc || '')}</p>
        <div class="mt-7 flex flex-wrap gap-2">${navChips}</div>
      </div>
      <div class="relative">
        <div class="overflow-hidden rounded-[2rem] shadow-2xl bg-pajoh-forest">
          <img src="${escapeHtml(heroImg)}" data-fallback-src="${escapeHtml(heroFallback)}" alt="Meja makan dengan hidangan Aceh" loading="lazy" referrerpolicy="no-referrer" class="h-[300px] w-full object-cover sm:h-[400px]" />
        </div>
        <div class="absolute -bottom-4 left-6 rounded-xl bg-pajoh-ivory px-5 py-3 text-pajoh-green shadow-xl">
          <p class="text-[10px] uppercase tracking-[0.18em] text-[#8A6A1F]">Edisi Kehormatan</p>
          <p class="serif text-lg font-semibold leading-tight">${escapeHtml(s.storyHeroBadge || 'Warisan Rasa Aceh')}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-10">
    <div class="py-8">
      ${
        stories.length
          ? stories.map(storyArticleHtml).join('')
          : emptyStateHtml(
              'book-open',
              'Belum ada kisah kuliner',
              'Tambahkan kisah kuliner atau bab cerita melalui halaman Admin Dashboard.',
              '#/admin',
              'Kelola di Admin'
            )
      }
    </div>

    <div class="mt-6 rounded-[2rem] bg-pajoh-sand/75 p-8 text-center sm:p-12">
      <div class="aceh-band mx-auto mb-6 max-w-[180px]"></div>
      <p class="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8A6A1F]">Rasakan Kisahnya</p>
      <h2 class="serif mx-auto mt-3 max-w-2xl text-3xl font-semibold leading-tight text-pajoh-green sm:text-4xl" style="text-wrap:balance">Setiap hidangan punya cerita. Sekarang giliran Anda mencicipinya.</h2>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#/menu" class="btn btn-primary">Lihat Semua Menu <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
        <a href="#/about" class="btn btn-outline">Tentang Dapur Kami</a>
      </div>
    </div>
  </section>`;
}

export function mountStoryPage(params) {
  bindImageFallbacks(document.getElementById('app'));
  const anchor = params?.get('s');
  if (anchor) {
    setTimeout(() => {
      const el = document.getElementById(`story-${anchor}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}
