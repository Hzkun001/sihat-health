import { useState } from 'react';
import { SectionReveal } from './SectionReveal';
import { AnimatePresence, motion } from 'motion/react';
import { Linkedin } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Akhmad Hafidz Ardianto',
      role: 'Front-End | Back-End Development',
      description: 'Membangun struktur proyek, mencakup API, serta integrasi data antar sistem.',
    image: 'assets/hafidz.webp',
    linkedin: 'https://www.linkedin.com/in/akhmad-hafidz-ardianto/',
  },
  {
    id: 2,
    name: 'Muhammad Riduwan',
    role: 'Geospatial Analyst | Front-End | UI/UX',
    description: 'Memadukan analisis spasial dan pengembangan UI responsif, mencakup pengolahan data serta perancangan UI/UX.',
    image: 'assets/uway.webp',
    linkedin: 'https://www.linkedin.com/in/muhammad-riduwan-abb636372/',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 160 : -160,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 160 : -160,
    opacity: 0,
    scale: 0.95,
  }),
};

export function TeamSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const membersCount = teamMembers.length;
  const activeMember = teamMembers[activeIndex];

  const paginate = (step: number) => {
    if (!membersCount) return;
    setDirection(step);
    setActiveIndex((prev) => {
      const next = (prev + step + membersCount) % membersCount;
      return next;
    });
  };

  const goTo = (index: number) => {
    if (index === activeIndex) return;
    const step = index > activeIndex ? 1 : -1;
    setDirection(step);
    setActiveIndex(index);
  };

  return (
    <section id="tim" className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F9FCFF 0%, #FFFFFF 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-16 lg:px-[120px]">
        {/* Header */}
        <SectionReveal>
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4"
            >
              <span className="text-brand-green" style={{ fontSize: '14px', fontWeight: 600 }}>
                Tim Kami
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.04 }}
              viewport={{ once: true }}
              className="text-ink-900 tracking-tight mb-4"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Tim SIHAT
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              viewport={{ once: true }}
              className="text-ink-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontSize: '18px' }}
            >
              Mereka di balik SIHAT Banjarbaru—menghubungkan data kesehatan, lingkungan, dan kebijakan publik.
            </motion.p>
          </div>
        </SectionReveal>

        {/* Team Slider (mobile & tablet) */}
        <div className="lg:hidden">
          <div className="relative max-w-[360px] sm:max-w-md mx-auto">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeMember.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) paginate(1);
                  else if (info.offset.x > 60) paginate(-1);
                }}
              >
                <TeamCard member={activeMember} />
              </motion.div>
            </AnimatePresence>

            {membersCount > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Anggota sebelumnya"
                  onClick={() => paginate(-1)}
                  className="absolute left-[-12px] top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg w-10 h-10 flex items-center justify-center border border-white/40 text-ink-500 active:scale-95 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Anggota selanjutnya"
                  onClick={() => paginate(1)}
                  className="absolute right-[-12px] top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg w-10 h-10 flex items-center justify-center border border-white/40 text-ink-500 active:scale-95 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {membersCount > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {teamMembers.map((member, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={member.id}
                    type="button"
                    aria-label={`Tampilkan ${member.name}`}
                    onClick={() => goTo(index)}
                    className={`h-2.5 rounded-full transition-all duration-200 ${isActive ? 'bg-brand-green w-6' : 'bg-ink-200 w-2.5'}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Team Grid */}
        <div className="hidden lg:grid grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.25, 0.8, 0.25, 1],
              }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <TeamCard member={member} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}
      className="group relative bg-white rounded-2xl overflow-hidden w-full max-w-[460px]"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Photo Container */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <picture>
          <source srcSet={member.image.replace('.jpg', '.webp')} type="image/webp" />
          <motion.img
            src={member.image}
            alt={member.name}
            loading="lazy"
            decoding="async"
            width={920}
            height={1150}
            className="w-full h-full object-cover transition-all duration-[280ms]"
            style={{ filter: 'grayscale(100%)', opacity: 0.9 }}
            whileHover={{ filter: 'grayscale(0%)', scale: 1.02, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}
          />
        </picture>
        <motion.a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-[280ms]"
          style={{
            backgroundColor: '#0A66C2',
            boxShadow: '0 4px 12px rgba(10, 102, 194, 0.3)',
          }}
          whileHover={{
            backgroundColor: '#1BA351',
            scale: 1.1,
            boxShadow: '0 6px 16px rgba(27, 163, 81, 0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.25, 0.8, 0.25, 1] }}
        >
          <Linkedin size={18} className="text-white" strokeWidth={2.5} />
        </motion.a>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 40%)',
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
        />
      </div>

      <div className="p-6 md:p-8">
        <h3
          className="text-ink-900 mb-2 group-hover:text-brand-green transition-colors duration-[280ms]"
          style={{
            fontSize: 'clamp(20px, 3vw, 22px)',
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {member.name}
        </h3>

        <p
          className="mb-3"
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: 500,
            color: '#475569',
            lineHeight: 1.4,
          }}
        >
          {member.role}
        </p>

        <p
          className="leading-relaxed line-clamp-2"
          style={{
            fontSize: 'clamp(12px, 2vw, 13.5px)',
            fontWeight: 400,
            color: '#64748B',
          }}
        >
          {member.description}
        </p>
      </div>

      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: '2px solid rgba(27, 163, 81, 0)',
        }}
        whileHover={{
          borderColor: 'rgba(27, 163, 81, 0.16)',
        }}
        transition={{ duration: 0.28 }}
      />
    </motion.article>
  );
}
