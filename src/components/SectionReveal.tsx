import { motion, useReducedMotion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, ReactNode } from 'react';
import { useResponsiveMotion, MOTION_TOKENS } from './ResponsiveMotion';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function SectionReveal({ children, className = '', delay = 0, amount = 0.3 }: SectionRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });
  const shouldReduceMotion = useReducedMotion();
  const { y } = useResponsiveMotion();

  // Reduced motion: fade only, 300ms
  if (shouldReduceMotion) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: MOTION_TOKENS.reducedMotion.duration, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // Full motion: fade + slide + scale (Token Global)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y, scale: 0.98 }}
      transition={{
        duration: MOTION_TOKENS.duration.reveal,
        delay,
        ease: MOTION_TOKENS.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
