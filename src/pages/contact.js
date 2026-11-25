import { state } from '../state/store.js';
import { sectionEyebrow } from '../components/ui.js';
import { buildWhatsAppUrl, escapeHtml, formatWaDisplay } from '../utils/format.js';

export function renderContactPage() {
  const s = state.settings;
  const waDirectHref = buildWhatsAppUrl(
    s.wa,
    'Halo Pajôh, saya ingin bertanya tentang menu dan jadwal pengiriman. Terima kasih!'
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;
  const emailAddr = s.email || 'muhammadisraaulia21@gmail.com';
  const igHref = s.instagram || 'https://www.instagram.com/mhdsraa/';
  const igHandle = igHref.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/+$/, '');

  const notes = [
    {
      icon: 'users',
      title: 'Pesanan katering',
      text: 'Minimal 20 porsi, konfirmasi H-3 untuk lauk berkuah dan kue tradisional.',
    },
    {
      icon: 'package',
      title: 'Pengiriman',
      text: 'Banda Aceh gratis di atas Rp 250.000. Luar kota via kurir instan, ongkir menyusul.',
    },
    {
      icon: 'heart-handshake',
      title: 'Reseller & hadiah',
      text: 'Kemasan hampers tersedia untuk hari raya, kelahiran, dan acara kantor.',
    },
  ];

  return `
  <section class="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
    <div class="max-w-2xl">
      ${sectionEyebrow('Hubungi Kami')}
      <h1 class="serif mt-3 text-4xl font-semibold leading-tight text-pajoh-green sm:text-5xl">Mampir ke dapur,<br />atau sapa kami dulu.</h1>
      <p class="mt-4 text-[14px] leading-relaxed text-pajoh-ink/65">Kami di Peunayong, tidak jauh dari Masjid Raya Baiturrahman. Untuk pesanan besar, katering, atau pertanyaan bahan, WhatsApp adalah jalur tercepat.</p>
    </div>

    <div class="mt-9 grid gap-6 lg:grid-cols-12">
      <div class="space-y-3 lg:col-span-5">
        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green"><i data-lucide="map-pin" class="h-5 w-5"></i></span>
            <div>
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-green/55">Alamat Dapur</p>
              <p class="mt-1 text-[14px] font-semibold leading-relaxed text-pajoh-green">${escapeHtml(s.address)}</p>
              <a href="${escapeHtml(mapsHref)}" target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#8A6A1F] hover:text-pajoh-green">
                Buka di Google Maps <i data-lucide="external-link" class="h-3.5 w-3.5"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green"><i data-lucide="clock" class="h-5 w-5"></i></span>
            <div>
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-green/55">Jam Operasional</p>
              <p class="mt-1 text-[14px] font-semibold text-pajoh-green">${escapeHtml(s.hours)}</p>
              <p class="mt-1 text-[12px] text-pajoh-ink/55">Minggu &amp; hari besar: pre-order saja. Pesanan terakhir 18.00 WIB.</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-pajoh-green p-5 text-pajoh-ivory">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-pajoh-gold"><i data-lucide="message-circle" class="h-5 w-5"></i></span>
            <div class="min-w-0">
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-gold/85">WhatsApp Dapur</p>
              <p class="tabular-nums mt-1 text-[15px] font-semibold">${escapeHtml(formatWaDisplay(s.wa))}</p>
              <a href="${escapeHtml(waDirectHref)}" target="_blank" rel="noopener" class="btn btn-gold btn-sm mt-3">
                Chat Sekarang <i data-lucide="arrow-up-right" class="h-3.5 w-3.5"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green"><i data-lucide="mail" class="h-5 w-5"></i></span>
            <div class="min-w-0">
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-green/55">Surel</p>
              <a href="mailto:${escapeHtml(emailAddr)}" class="mt-1 block break-all text-[14px] font-semibold text-pajoh-green hover:text-[#8A6A1F]">${escapeHtml(emailAddr)}</a>
              <p class="mt-1 text-[12px] text-pajoh-ink/55">Untuk kerja sama, katering, dan reseller.</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-pajoh-green/10 bg-white p-5">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pajoh-green/[0.08] text-pajoh-green" aria-hidden="true">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </span>
            <div class="min-w-0">
              <p class="text-[10.5px] font-bold uppercase tracking-[0.18em] text-pajoh-green/55">Instagram</p>
              <a href="${escapeHtml(igHref)}" target="_blank" rel="noopener" class="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-pajoh-green hover:text-[#8A6A1F]">
                @${escapeHtml(igHandle || 'mhdsraa')} <i data-lucide="external-link" class="h-3.5 w-3.5"></i>
              </a>
              <p class="mt-1 text-[12px] text-pajoh-ink/55">Kabar menu harian, proses masak, dan jadwal pre-order.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="relative h-full min-h-[380px] overflow-hidden rounded-[2rem] border border-pajoh-green/10 bg-pajoh-sand/75">
          <svg class="absolute inset-0 h-full w-full opacity-55" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="600" height="480" fill="#F3EFE7"/>
            <g stroke="#C9D6CC" stroke-width="10" fill="none">
              <path d="M-20 120h640"/><path d="M-20 300h640"/><path d="M120 -20v520"/><path d="M430 -20v520"/>
            </g>
            <g stroke="#D4AF37" stroke-width="3" fill="none" opacity=".55">
              <path d="M-20 205h640"/><path d="M270 -20v520"/>
            </g>
            <g fill="#B7C9BD">
              <rect x="150" y="140" width="90" height="120" rx="6"/>
              <rect x="320" y="140" width="80" height="60" rx="6"/>
              <rect x="150" y="330" width="70" height="40" rx="6"/>
              <rect x="320" y="330" width="90" height="90" rx="6"/>
            </g>
            <circle cx="270" cy="205" r="16" fill="#064E3B"/>
            <circle cx="270" cy="205" r="34" fill="#064E3B" opacity=".12"/>
          </svg>
          <div class="absolute left-1/2 top-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-5 shadow-xl sm:w-[70%]">
            <p class="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#8A6A1F]">Titik Ambil Pesanan</p>
            <p class="serif mt-1 text-2xl font-semibold text-pajoh-green">Dapur Pajôh Peunayong</p>
            <p class="mt-2 text-[12.5px] leading-relaxed text-pajoh-ink/65">${escapeHtml(s.address)}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <a href="${escapeHtml(mapsHref)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Rute Perjalanan <i data-lucide="navigation" class="h-3.5 w-3.5"></i></a>
              <a href="${escapeHtml(waDirectHref)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Tanya Dulu</a>
            </div>
            <p class="mt-4 border-t border-dashed border-pajoh-green/15 pt-3 text-[11px] leading-relaxed text-pajoh-ink/50">Parkir tersedia di depan dapur. Mohon konfirmasi kedatangan agar pesanan dipanaskan tepat waktu.</p>
          </div>
          <div class="absolute bottom-4 left-4 rounded-full bg-pajoh-green/90 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-pajoh-ivory">Banda Aceh · 5.5483° N, 95.3238° E</div>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
    <div class="grid gap-5 rounded-[2rem] bg-pajoh-sand/75 p-6 sm:grid-cols-3 sm:p-8">
      ${notes
        .map(
          (v) => `<div class="flex gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-pajoh-green">
              <i data-lucide="${v.icon}" class="h-4 w-4"></i>
            </span>
            <div>
              <p class="text-[13px] font-bold text-pajoh-green">${v.title}</p>
              <p class="mt-0.5 text-[12px] leading-relaxed text-pajoh-ink/60">${v.text}</p>
            </div>
          </div>`
        )
        .join('')}
    </div>
  </section>`;
}
