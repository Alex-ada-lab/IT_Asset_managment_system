'use client';

import React from 'react';

type BadgeVariant =
  | 'available'
  | 'assigned'
  | 'maintenance'
  | 'lost'
  | 'retired'
  | 'disposed'
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  available: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  lost: 'bg-red-100 text-red-800',
  retired: 'bg-gray-100 text-gray-700',
  disposed: 'bg-gray-100 text-gray-700',
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

/** Map an AssetStatus string to a badge variant */
export function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Available: 'available',
    Assigned: 'assigned',
    'Under Maintenance': 'maintenance',
    Lost: 'lost',
    Retired: 'retired',
    Disposed: 'disposed',
  };
  return map[status] ?? 'default';
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
