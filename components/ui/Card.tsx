import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'interactive' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const baseStyles = 'bg-white/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 shadow-sm border';

  const variants = {
    default: 'border-ink/10 text-ink hover:shadow-md',
    outline: 'border-2 border-ink/20 text-ink bg-transparent',
    interactive: 'border-ink/15 text-ink hover:border-moss hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
    dark: 'bg-ink text-paper border-ink/80 shadow-md',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
};
