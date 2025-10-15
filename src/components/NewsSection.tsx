import { NewsSlider } from './NewsSlider';

export function NewsSection() {
  return (
    <section id="berita" className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FCFF 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {/* News Slider */}
          <NewsSlider />
        </div>
      </div>
    </section>
  );
}
