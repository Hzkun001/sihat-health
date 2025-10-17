import { SectionReveal } from './SectionReveal';
import { motion } from 'motion/react';
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

export function TeamSection() {
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

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
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
                    {/* WebP lebih kecil */}
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
                  {/* LinkedIn Button */}
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

                  {/* Gradient overlay on hover */}
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

                {/* Content */}
                <div className="p-6 md:p-8">
                  {/* Name */}
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

                  {/* Role */}
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

                  {/* Description */}
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

                {/* Hover ring effect (optional) */}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
