'use client';

import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        hover && 'transition-all hover:shadow-md hover:border-gray-300 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'primary', size = 'sm' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size])}>
      {children}
    </span>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBar({ label, score, size = 'md' }: ScoreBarProps) {
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={clsx('text-gray-600', size === 'lg' ? 'text-sm font-semibold' : 'text-xs')}>
          {label}
        </span>
        <span className={clsx('text-gray-900 font-medium', size === 'lg' ? 'text-sm font-bold' : 'text-xs')}>
          {Math.round(score)}%
        </span>
      </div>
      <div className={clsx('bg-gray-200 rounded-full', heights[size])}>
        <div
          className={clsx(getColor(score), 'rounded-full transition-all duration-500', heights[size])}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}
