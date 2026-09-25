import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean;
  dark?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  dark = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={
        hoverable
          ? {
              y: -4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      className={`rounded-[16px] transition-shadow ${
        dark
          ? 'bg-[#1d1d1f] text-white border border-white/10'
          : 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#d2d2d7] dark:border-[#333336] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none'
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
