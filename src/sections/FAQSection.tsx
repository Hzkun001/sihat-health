import { SectionReveal } from '@/components/shared/SectionReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowUpRight, CircleHelp } from 'lucide-react';

const faqItems = [
  {
    question: 'Apa itu SIHAT?',
    answer:
      'SIHAT adalah platform informasi kesehatan lingkungan Banjarmasin–Banjarbaru yang menyatukan data geospasial, fasilitas kesehatan, indikator wilayah, dan laporan warga dalam satu tempat.',
  },
  {
    question: 'Data apa saja yang tersedia di SIHAT?',
    answer:
      'Anda dapat melihat sebaran fasilitas kesehatan, data kependudukan, stunting, balita, lansia, disabilitas, serta beberapa lapisan lingkungan dan layanan publik melalui peta interaktif.',
  },
  {
    question: 'Dari mana sumber data yang ditampilkan?',
    answer:
      'Data SIHAT berasal dari sumber pemerintah dan mitra data terkait untuk Banjarmasin dan Banjarbaru, termasuk geoportal, dinas terkait, dan BPS. Tahun serta cakupan setiap dataset perlu diperhatikan karena jadwal pembaruannya berbeda.',
  },
  {
    question: 'Seberapa sering data diperbarui?',
    answer:
      'Pembaruan mengikuti ketersediaan rilis dari masing-masing sumber data. Karena setiap dataset memiliki jadwal berbeda, gunakan informasi tahun dan sumber pada data sebagai acuan saat membaca hasilnya.',
  },
  {
    question: 'Bagaimana cara melaporkan masalah lingkungan?',
    answer:
      'Buka halaman Laporan Warga, tuliskan kondisi yang ditemukan, lalu tambahkan koordinat lokasi. Anda juga dapat menyertakan foto agar laporan lebih mudah dipahami.',
  },
  {
    question: 'Apakah SIHAT dapat diakses melalui ponsel?',
    answer:
      'Ya. Tampilan SIHAT dirancang responsif agar peta, statistik, dan formulir laporan dapat digunakan melalui ponsel, tablet, maupun komputer.',
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{ backgroundColor: 'var(--surface-alt)' }}
    >
      <div
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(185, 169, 245, 0.16)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--surface-200)' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <SectionReveal>
            <div className="lg:sticky lg:top-32">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--surface-200)',
                }}
              >
                <CircleHelp size={15} style={{ color: 'var(--brand-green)' }} />
                <span
                  style={{
                    color: 'var(--brand-green)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Pertanyaan Umum
                </span>
              </div>

              <h2
                className="max-w-xl"
                style={{
                  color: 'var(--ink-900)',
                  fontSize: 'clamp(32px, 4.6vw, 54px)',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: 0,
                }}
              >
                Hal yang sering ditanyakan tentang SIHAT.
              </h2>

              <p
                className="mt-5 max-w-lg leading-relaxed"
                style={{ color: 'var(--ink-500)', fontSize: '17px' }}
              >
                Temukan jawaban singkat seputar data, peta, dan pelaporan warga sebelum
                mulai menjelajahi platform.
              </p>

              <a
                href="#/kontak"
                className="group mt-7 inline-flex items-center gap-2 font-bold"
                style={{ color: 'var(--brand-green)', fontSize: '14px' }}
              >
                Masih punya pertanyaan?
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.12}>
            <div
              className="h-[700px] overflow-y-auto rounded-2xl px-5 sm:h-[620px] sm:px-7 lg:h-[550px]"
              style={{
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--surface-200)',
                boxShadow: '0 18px 50px rgba(48, 56, 50, 0.07)',
                scrollbarGutter: 'stable',
              }}
            >
              <Accordion type="single" collapsible defaultValue="faq-0">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={item.question}
                    value={`faq-${index}`}
                    className="border-surface-200"
                  >
                    <AccordionTrigger
                      className="py-5 text-base font-bold leading-6 text-ink-900 hover:no-underline sm:py-6 sm:text-[17px]"
                    >
                      <span className="pr-3">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="max-w-2xl pb-5 pr-8 text-[15px] leading-7 text-ink-500 sm:pb-6">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
