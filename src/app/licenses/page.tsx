'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { licenses as licensesApi } from '@/lib/api';
import type { SoftwareLicense } from '@/types';

function ExpiryBadge({ date }: { date: string }) {
  const daysLeft = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return <Badge variant="danger">Expired</Badge>;
  if (daysLeft <= 30) return <Badge variant="warning">Expires in {daysLeft}d</Badge>;
  return <Badge variant="available">Active</Badge>;
}

function SeatProgress({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">
        {used}/{total}
      </span>
    </div>
  );
}

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const PAGE_SIZE = 20;

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await licensesApi.list({ page, pageSize: PAGE_SIZE });
      const d = resp.data;
      if (Array.isArray(d)) {
        setLicenses(d as SoftwareLicense[]);
        setTotal((d as SoftwareLicense[]).length);
      } else {
        setLicenses(d.data ?? []);
        setTotal(d.pagination?.total ?? 0);
      }
    } catch {
      setError('Failed to load licenses.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const columns: TableColumn<SoftwareLicense>[] = [
    { key: 'softwareName', header: 'Software' },
    { key: 'vendor', header: 'Vendor' },
    { key: 'licenseType', header: 'Type' },
    {
      key: 'seats',
      header: 'Seats',
      render: (r) => <SeatProgress used={r.usedSeats ?? 0} total={r.totalSeats} />,
    },
    {
      key: 'expiryDate',
      header: 'Expiry',
      render: (r) => <ExpiryBadge date={r.expiryDate} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); router.push(`/licenses/${r.id}`); }}
        >
          View
        </Button>
      ),
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout title="Software Licenses">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => router.push('/licenses/new')}>
            + Register License
          </Button>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>
        )}

        <Table<SoftwareLicense>
          columns={columns}
          data={licenses}
          isLoading={loading}
          emptyMessage="No licenses found."
          onRowClick={(row) => router.push(`/licenses/${row.id}`)}
          keyExtractor={(row) => row.id}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
