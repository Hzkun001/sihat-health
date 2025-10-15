import { Mail, MapPin, Phone, Linkedin, Twitter, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0B1C4A 0%, #0F2E1C 100%)',
      }}
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Left - Headline */}
          <div className="lg:col-span-5">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
              viewport={{ once: true }}
              className="text-white mb-4 tracking-tight"
              style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2 }}
            >
              Let's Talk Health
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.25, 0.8, 0.25, 1] }}
              viewport={{ once: true }}
              className="text-white/70 leading-relaxed" 
              style={{ fontSize: '16px' }}
            >
              Platform data kesehatan terpadu untuk mewujudkan Banjarbaru yang lebih sehat dan sejahtera.
            </motion.p>

            {/* Logo */}
            <div className="flex items-center space-x-3 mt-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'white' }}
              >
              <img src="assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>
                  SIHAT
                </div>
                <div className="text-white/60 text-xs">Sistem Informasi Kesehatan Terpadu.</div>
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className="lg:col-span-2">
            <h4
              className="text-white mb-6"
              style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              PARTNERS
            </h4>
            <ul className="space-y-3">
              {['Pemkot Banjarbaru', 'Dinkes Banjarbaru', 'BPS Kalsel', 'WHO Indonesia'].map(
                (partner) => (
                  <li key={partner}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-brand-green transition-colors text-sm"
                    >
                      {partner}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4
              className="text-white mb-6"
              style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              CONTACT
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-brand-green flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm leading-relaxed">
                  Jl. Panglima Batur Barat No.5, Banjarbaru, Kalimantan Selatan 70711
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-brand-green flex-shrink-0" />
                <a
                  href="mailto:sihat@banjarbaru.go.id"
                  className="text-white/70 hover:text-brand-green transition-colors text-sm"
                >
                  sihat@banjarbaru.go.id
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-brand-green flex-shrink-0" />
                <a
                  href="tel:+62511234567"
                  className="text-white/70 hover:text-brand-green transition-colors text-sm"
                >
                  +62 511 234 567
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center space-x-4 mt-6">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }, index) => (
                <motion.a
                  key={label}
                  href="#"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, backgroundColor: '#1BA351' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.06,
                    ease: [0.25, 0.8, 0.25, 1]
                  }}
                  viewport={{ once: true }}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group"
                  aria-label={label}
                >
                  <Icon size={18} className="text-white/70 group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <h4
              className="text-white mb-6"
              style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              DETAILS
            </h4>
            <ul className="space-y-3">
              <li className="text-white/70 text-sm">SDG 3 - Good Health & Well-Being</li>
              <li className="text-white/70 text-sm">Open Data Initiative</li>
              <li className="text-white/70 text-sm">BPS 2024 Data</li>
              <li>
                <a href="#" className="text-white/70 hover:text-brand-green transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-8">
            <p className="text-white/50 text-sm text-right w-full">
              © {currentYear} sihat.health — All Rights Reserved
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-white/50 hover:text-brand-green transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-brand-green transition-colors text-sm"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
