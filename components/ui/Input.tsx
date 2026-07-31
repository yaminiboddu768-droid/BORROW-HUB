import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="font-display font-medium text-sm text-ink">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-xl border bg-white text-ink text-sm transition-all duration-200 placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent disabled:bg-paper disabled:text-slate',
              error ? 'border-red-500 focus:ring-red-500' : 'border-ink/20',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
