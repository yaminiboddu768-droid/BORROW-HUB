import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'ink' | 'moss' | 'marigold' | 'clay' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'moss',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-data font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    ink: 'bg-ink text-paper',
    moss: 'bg-moss/15 text-moss border border-moss/30',
    marigold: 'bg-marigold/20 text-ink border border-marigold/40',
    clay: 'bg-clay/15 text-clay border border-clay/30',
    slate: 'bg-slate/15 text-slate border border-slate/30',
    outline: 'border border-ink/20 text-ink/80 bg-paper',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
