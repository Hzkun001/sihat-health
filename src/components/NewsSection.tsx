import { NewsSlider } from './Berita';

export function NewsSection() {
  return (
    <section id="berita" className="relative py-16 md:py-20 lg:py-24 overflow-hidden" style={{ backgroundColor: 'var(--surface-alt)' }}>
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <NewsSlider />
        </div>
      </div>
    </section>
  );
}
