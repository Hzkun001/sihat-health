import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // Reduced from 2500ms to 2000ms
    const interval = 50; // Increased from 20ms to 50ms for better performance
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400); // Adjusted timing for swipe transition
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      exit={{ 
        y: '-100%',
        opacity: 0.8, // Slight fade for smoothness
      }}
      transition={{ 
        duration: 0.9, 
        ease: [0.25, 0.8, 0.25, 1], // Custom cubic-bezier for smooth swipe
        y: { duration: 0.9 },
        opacity: { duration: 0.6, delay: 0.1 },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
          }}
          className="text-white tracking-tight"
          style={{ 
            fontSize: 'clamp(72px, 10vw, 128px)', 
            fontWeight: 700, 
            lineHeight: 1,
            willChange: 'opacity, transform',
          }}
        >
          SIHAT
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.3,
          }}
          className="text-white/90 text-center px-6"
          style={{ 
            fontSize: 'clamp(18px, 2.5vw, 28px)', 
            fontWeight: 400, 
            letterSpacing: '0.02em',
            willChange: 'opacity, transform',
            maxWidth: '90vw',
          }}
        >
          <span className="inline md:inline">Membangun masyarakat</span>
          <br className="block md:hidden" />
          <span className="inline md:inline"> yang Lebih Sehat</span>
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ 
            duration: 0.4, 
            delay: 0.5,
          }}
          className="relative"
          style={{ width: 'clamp(160px, 20vw, 220px)', height: '2px' }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #1BA351 0%, #5AC8FA 100%)',
              width: `${progress}%`,
              boxShadow: '0 0 20px rgba(255,255,255,0.5)',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
