import React, { ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#000000] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const variants = {
    primary:
      'bg-[#ff6b35] text-white hover:bg-[#e45525] active:bg-[#d44819] shadow-sm',
    secondary:
      'bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c] active:bg-[#dddddf] dark:active:bg-[#48484a]',
    dark:
      'bg-[#1d1d1f] dark:bg-[#2c2c2e] text-white hover:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] active:bg-[#3a3a3c] shadow-sm',
    outline:
      'border border-[#d2d2d7] dark:border-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] bg-white dark:bg-[#1d1d1f] hover:bg-[#fafafa] dark:hover:bg-[#262629] active:bg-[#f2f2f5] dark:active:bg-[#2c2c2e]',
    ghost:
      'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10',
  };

  const sizes = {
    sm: 'text-[13px] px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-[15px] px-5 py-2.5 gap-2 h-11',
    lg: 'text-[17px] px-7 py-3.5 gap-2.5 h-13',
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
