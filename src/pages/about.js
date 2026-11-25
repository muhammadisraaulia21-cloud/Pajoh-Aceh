import { sectionEyebrow } from '../components/ui.js';
import { escapeHtml } from '../utils/format.js';
import { bindImageFallbacks, createDishFallbackDataUrl } from '../utils/image.js';

export function renderAboutPage() {
  const kitchenFallback = createDishFallbackDataUrl('Dapur Pajôh', 'Peunayong, Banda Aceh');
  const values = [
    {
      icon: 'scroll-text',
      title: 'Resep yang tidak diubah',
      text: 'Takaran kami ikut catatan keluarga, bukan tren. Bila resep membutuhkan empat jam, kami memasak empat jam.',
    },
    {
      icon: 'sprout',
      title: 'Rempah dari tetangga',
      text: 'Asam sunti, temurui, dan cuka aren dibeli langsung dari petani dan pembuat di Aceh Besar dan Pidie.',
    },
    {
      icon: 'flame',
      title: 'Dimasak per pesanan',
      text: 'Tidak ada lauk yang dipanaskan berkali-kali. Pesanan Anda masuk dapur, lalu keluar dalam keadaan terbaik.',
    },
  ];

  const standards = [
    'Bahan segar dibeli setiap dua hari, tidak menumpuk stok.',
    'Talenan daging dan sayur dipisah, sterilisasi harian.',
    'Kemasan food grade dengan segel dan label tanggal masak.',
    'Pengiriman memakai ice gel untuk lauk berkuah.',
  ];

  return `
  <section class="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
    <div class="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
      <div class="lg:col-span-6">
        ${sectionEyebrow('Tentang Kami')}
        <h1 class="serif mt-4 text-4xl font-semibold leading-[1.02] text-pajoh-green sm:text-6xl">Pajôh berarti<br /><span class="italic text-[#8A6A1F]">makan.</span></h1>
        <p class="mt-5 text-[14.5px] leading-relaxed text-pajoh-ink/75">Sesederhana itu namanya. Dalam bahasa Aceh, <em>pajôh</em> adalah kata yang diucapkan ibu ketika mangkuk sudah di atas meja—bukan panggilan, melainkan ajakan: mari makan, sebelum dingin.</p>
        <p class="mt-3 text-[14.5px] leading-relaxed text-pajoh-ink/75">Kami memilih kata itu karena kami tidak ingin menjadi restoran yang rumit. Kami ingin menjadi dapur yang mengingatkan Anda pada rumah: rempahnya jelas, porsinya jujur, dan tidak ada bahan yang tidak bisa Anda sebutkan namanya.</p>
        <div class="mt-7 grid grid-cols-3 gap-3">
          <div class="rounded-xl bg-white/80 p-4 text-center ring-1 ring-pajoh-green/10">
            <p class="serif tabular-nums text-2xl font-bold text-pajoh-green">2016</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Berdiri</p>
          </div>
          <div class="rounded-xl bg-white/80 p-4 text-center ring-1 ring-pajoh-green/10">
            <p class="serif tabular-nums text-2xl font-bold text-pajoh-green">24</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Resep Indatu</p>
          </div>
          <div class="rounded-xl bg-white/80 p-4 text-center ring-1 ring-pajoh-green/10">
            <p class="serif tabular-nums text-2xl font-bold text-pajoh-green">12rb+</p>
            <p class="text-[10px] uppercase tracking-[0.14em] text-pajoh-ink/50">Porsi Tersaji</p>
          </div>
        </div>
      </div>
      <div class="lg:col-span-6">
        <div class="relative">
          <div class="overflow-hidden rounded-[2rem] shadow-soft bg-pajoh-sand">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80" data-fallback-src="${escapeHtml(kitchenFallback)}" alt="Dapur Pajôh di Peunayong, Banda Aceh" loading="lazy" referrerpolicy="no-referrer" class="h-[360px] w-full object-cover sm:h-[460px]" />
          </div>
          <div class="absolute -bottom-5 -left-2 max-w-[220px] rounded-2xl bg-pajoh-green p-5 text-pajoh-ivory shadow-xl sm:left-6">
            <i data-lucide="map-pin" class="h-4 w-4 text-pajoh-gold"></i>
            <p class="serif mt-2 text-lg font-semibold leading-tight">Peunayong,<br />Banda Aceh</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-pajoh-ivory/60">Dapur &amp; titik ambil</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
    <div class="grid gap-5 sm:grid-cols-3">
      ${values
        .map(
          (v, i) => `<div class="fade-up rounded-2xl border border-pajoh-green/10 bg-white p-6" style="animation-delay:${i * 80}ms">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-pajoh-gold/15 text-[#8A6A1F]">
              <i data-lucide="${v.icon}" class="h-5 w-5"></i>
            </span>
            <h3 class="serif mt-4 text-xl font-semibold text-pajoh-green">${v.title}</h3>
            <p class="mt-1.5 text-[13.5px] leading-relaxed text-pajoh-ink/65">${v.text}</p>
          </div>`
        )
        .join('')}
    </div>
  </section>

  <section class="bg-pajoh-sand/65">
    <div class="aceh-band"></div>
    <div class="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-20">
      <div>
        ${sectionEyebrow('Standar Dapur')}
        <h2 class="serif mt-3 text-3xl font-semibold leading-tight text-pajoh-green sm:text-4xl">Bersih bukan nilai tambah.<br />Itu syarat pertama.</h2>
        <p class="mt-4 text-[14px] leading-relaxed text-pajoh-ink/70">Dapur kami di Peunayong buka setiap pagi pukul enam. Sebelum apa pun dimasak, rempah dicuci, talenan dipisah, dan suhu kulkas dicatat. Kami kecil, jadi kami bisa memastikan setiap prosesnya.</p>
        <ul class="mt-6 space-y-3">
          ${standards
            .map(
              (t) => `<li class="flex items-start gap-2.5 text-[13.5px] text-pajoh-ink/75">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pajoh-green/10 text-pajoh-green">
                  <i data-lucide="check" class="h-3 w-3"></i>
                </span>
                ${t}
              </li>`
            )
            .join('')}
        </ul>
      </div>
      <div class="relative flex items-center">
        <div class="rounded-[2rem] bg-pajoh-forest p-8 text-pajoh-ivory sm:p-10">
          <i data-lucide="quote" class="h-7 w-7 text-pajoh-gold/75"></i>
          <p class="serif mt-4 text-2xl font-normal italic leading-snug sm:text-3xl">“Kami tidak ingin dikenal sebagai yang paling ramai. Kami ingin dikenal sebagai dapur yang resepnya tidak pernah berubah karena tergesa-gesa.”</p>
          <p class="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-pajoh-gold">Tim Dapur Pajôh</p>
          <a href="#/contact" class="btn btn-gold mt-7">Hubungi Kami <i data-lucide="message-circle" class="h-4 w-4"></i></a>
        </div>
      </div>
    </div>
  </section>`;
}

export function mountAboutPage() {
  bindImageFallbacks(document.getElementById('app'));
}
