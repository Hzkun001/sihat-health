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
          setTimeout(onComplete, 500); // Reduced from 700ms to 500ms
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05,
        filter: 'blur(10px)',
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.43, 0.13, 0.23, 0.96],
        opacity: { duration: 0.6 },
        scale: { duration: 0.8 },
        filter: { duration: 0.5 },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
        willChange: 'opacity, transform, filter',
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
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            exit: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }
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
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.3,
            exit: { duration: 0.35, delay: 0.05, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="text-white/90"
          style={{ 
            fontSize: 'clamp(18px, 2.5vw, 28px)', 
            fontWeight: 400, 
            letterSpacing: '0.02em',
            willChange: 'opacity, transform',
          }}
        >
          Membangun masyarakat yang Lebih Sehat
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            duration: 0.4, 
            delay: 0.5,
            exit: { duration: 0.3, delay: 0.1, ease: [0.43, 0.13, 0.23, 0.96] }
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
