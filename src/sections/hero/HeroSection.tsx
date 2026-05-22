import { motion } from 'motion/react';
import { ArrowRight, MapPin, MessageSquareWarning } from 'lucide-react';

const insightItems = [
  '47 fasilitas kesehatan',
  'Peta risiko warga',
  'Laporan berbasis koordinat',
] as const;

const HERO_IMAGE = '/assets/banjarbaru-monument.jpg';
const FEATURED_IMAGE = '/assets/lansia.jpeg';

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#f1f0ea] px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[18px] bg-white shadow-[0_22px_80px_rgba(41,48,44,0.16)]">
        <div className="flex h-7 items-center gap-2 bg-white px-5 sm:h-8">
          <span className="h-2 w-2 rounded-full bg-[#b9a9f5]" />
          <span className="h-2 w-2 rounded-full bg-[#b9a9f5]" />
          <span className="h-2 w-2 rounded-full bg-[#b9a9f5]" />
        </div>

        <div className="relative min-h-[calc(100svh-3rem)] overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Pelayanan kesehatan masyarakat"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: '52% 48%' }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(241,241,233,0.94)_0%,rgba(241,241,233,0.72)_30%,rgba(241,241,233,0.18)_62%,rgba(241,241,233,0)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(220,225,216,0.62)_0%,rgba(220,225,216,0.16)_36%,rgba(255,255,255,0.04)_100%)]" />
          <div className="absolute left-0 top-0 h-full w-[42%] bg-white/16 backdrop-blur-[3px]" />
          <div className="absolute -left-16 top-28 hidden h-48 w-96 rotate-6 rounded-[2rem] bg-white/24 blur-2xl lg:block" />

          <div className="relative z-10 flex min-h-[calc(100svh-3rem)] flex-col justify-end px-4 pb-5 pt-28 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
              className="max-w-[620px]"
            >
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {insightItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#52594f]/10 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase text-[#4d574e] shadow-[0_6px_24px_rgba(58,66,57,0.07)] backdrop-blur-xl sm:text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <h1 className="max-w-[560px] text-5xl font-normal leading-[0.95] tracking-normal text-[#424b45] sm:text-6xl lg:text-7xl xl:text-8xl">
                Buka Peta
                <br />
                Kesehatan
                <br />
                Kota
              </h1>

              <p className="mt-5 max-w-[440px] text-sm font-medium leading-snug text-[#263129] sm:text-base">
                SIHAT membantu warga Banjarbaru melihat fasilitas kesehatan, membaca data wilayah, dan mengirim laporan langsung dari titik lokasi.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <motion.a
                  href="#laporan"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#303832] shadow-[0_14px_36px_rgba(49,58,52,0.15)] transition-colors hover:bg-[#f8faf5]"
                >
                  Mulai Lapor
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </motion.a>

                <motion.a
                  href="#peta"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-[#465047]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(49,58,52,0.18)] backdrop-blur-xl transition-colors hover:bg-[#303832]/90"
                >
                  <MapPin size={15} />
                  Lihat Peta
                </motion.a>
              </div>

              <FeaturedPost className="mt-7 md:hidden" />
            </motion.div>
          </div>

          <FeaturedPost className="absolute bottom-5 right-20 z-20 hidden md:flex lg:bottom-7 lg:right-24" />
        </div>
      </div>
    </section>
  );
}

function FeaturedPost({ className = '' }: { className?: string }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
      className={`flex w-full max-w-[390px] items-center gap-3 rounded-[8px] border border-white/70 bg-white/80 p-2.5 text-[#303832] shadow-[0_18px_48px_rgba(39,45,40,0.18)] backdrop-blur-2xl ${className}`}
    >
      <img
        src={FEATURED_IMAGE}
        alt="Perawatan lansia di rumah"
        className="h-24 w-28 shrink-0 rounded-[5px] object-cover sm:h-28 sm:w-32"
      />

      <div className="min-w-0 py-1 pr-1">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#435047] text-white">
          <MessageSquareWarning size={16} />
        </div>
        <p className="text-base font-semibold leading-tight">Featured Insight</p>
        <p className="mt-2 text-sm font-medium leading-tight text-[#343d36]/80">
          Pantau kebutuhan layanan warga dari laporan titik lokasi.
        </p>
      </div>
    </motion.aside>
  );
}
