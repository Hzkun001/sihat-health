import { Mail, MapPin, Phone, Linkedin, Twitter, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#0a0a0b' }}
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
              className="text-white mb-4"
              style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}
            >
              Let's Talk Health
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.25, 0.8, 0.25, 1] }}
              viewport={{ once: true }}
              className="leading-relaxed" 
              style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}
            >
              Platform data lingkungan terpadu untuk mewujudkan Banjarbaru yang lebih sehat dan sejahtera.
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
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Sistem Informasi Kesehatan Lingkungan Terpadu.</div>
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className="lg:col-span-2">
            <h4
              className="text-white mb-6"
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              PARTNERS
            </h4>
            <ul className="space-y-3">
              {['Geoportal Kota Banjarbaru', 'Dinkes Banjarbaru', 'BPS Kalsel', 'WHO Indonesia'].map(
                (partner) => (
                  <li key={partner}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
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
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              CONTACT
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} style={{ color: 'var(--brand-green)' }} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Jl. Panglima Batur Barat No.5, Banjarbaru, Kalimantan Selatan 70711
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} style={{ color: 'var(--brand-green)' }} className="flex-shrink-0" />
                <a
                  href="mailto:sihat@banjarbaru.go.id"
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  sihat@banjarbaru.go.id
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} style={{ color: 'var(--brand-green)' }} className="flex-shrink-0" />
                <a
                  href="tel:+62511234567"
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  +62 511 234 567
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 mt-6">
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
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.06,
                    ease: [0.25, 0.8, 0.25, 1]
                  }}
                  viewport={{ once: true }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-green)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                  aria-label={label}
                >
                  <Icon size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <h4
              className="text-white mb-6"
              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              DETAILS
            </h4>
            <ul className="space-y-3">
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>SDG 3 - Good Health & Well-Being</li>
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Open Data Initiative</li>
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>BPS 2024 Data</li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-8">
            <p className="text-sm text-right w-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
              &copy; {currentYear} SIHAT. All Rights Reserved
            </p>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
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
