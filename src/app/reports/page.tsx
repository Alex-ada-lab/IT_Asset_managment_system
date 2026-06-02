'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

interface ReportCard {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const REPORT_CARDS: ReportCard[] = [
  {
    type: 'inventory',
    title: 'Inventory Report',
    description: 'List all active assets with status, assignments, and location.',
    icon: (
      <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    type: 'maintenance',
    title: 'Maintenance Report',
    description: 'Maintenance records by date range with cost and resolution details.',
    icon: (
      <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  },
  {
    type: 'utilization',
    title: 'Utilization Report',
    description: 'Asset utilization rates — percentage of time spent in Assigned status.',
    icon: (
      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    type: 'disposal',
    title: 'Disposal Report',
    description: 'Retired and disposed assets with disposal dates and reasons.',
    icon: (
      <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    type: 'procurement',
    title: 'Procurement Report',
    description: 'Purchase order history filtered by vendor, date, or category.',
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function ReportsPage() {
  const router = useRouter();

  return (
    <AppLayout title="Reports">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.type}
            onClick={() => router.push(`/reports/${card.type}`)}
            className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0">{card.icon}</div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </AppLayout>
  );
}
