import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  error,
  hint,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-between"
        >
          <span>{label}</span>
          {hint && <span className="text-[12px] font-normal text-[#86868b] dark:text-[#a1a1a6]">{hint}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#86868b] dark:text-[#a1a1a6] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          className={`w-full bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]/60 dark:placeholder:text-[#a1a1a6]/50 text-[16px] rounded-xl border ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-[#e8e8ed] dark:border-[#333336] focus:border-[#ff6b35] dark:focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 dark:focus:ring-[#ff6b35]/30'
          } ${
            leftIcon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 transition-all duration-150 outline-none ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="text-[14px] text-red-500 font-medium pl-0.5">
          {error}
        </p>
      )}
    </div>
  );
};
