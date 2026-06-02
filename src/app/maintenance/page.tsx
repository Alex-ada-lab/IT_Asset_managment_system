'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { maintenance as maintenanceApi } from '@/lib/api';
import type { MaintenanceRecord, MaintenanceStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Requested', label: 'Requested' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

function statusBadge(status: MaintenanceStatus) {
  const map: Record<MaintenanceStatus, 'info' | 'warning' | 'success' | 'danger'> = {
    Requested: 'info',
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return map[status] ?? 'default';
}

export default function MaintenancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PAGE_SIZE = 20;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await maintenanceApi.list({
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const d = resp.data;
      if (Array.isArray(d)) {
        setRecords(d as MaintenanceRecord[]);
        setTotal((d as MaintenanceRecord[]).length);
      } else {
        setRecords(d.data ?? []);
        setTotal(d.pagination?.total ?? 0);
      }
    } catch {
      setError('Failed to load maintenance records.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const columns: TableColumn<MaintenanceRecord>[] = [
    { key: 'id', header: 'ID' },
    { key: 'assetName', header: 'Asset', render: (r) => <span>{r.assetName ?? r.assetId}</span> },
    { key: 'issueDescription', header: 'Issue', render: (r) => <span className="truncate max-w-xs block">{r.issueDescription}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={statusBadge(r.status as MaintenanceStatus)}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'estimatedCost',
      header: 'Est. Cost',
      render: (r) => <span>{r.estimatedCost != null ? `$${Number(r.estimatedCost).toFixed(2)}` : '—'}</span>,
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled',
      render: (r) => <span>{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/maintenance/${r.id}`); }}>
          View
        </Button>
      ),
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout title="Maintenance">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
          <Button variant="primary" onClick={() => router.push('/maintenance/new')}>
            + New Request
          </Button>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>
        )}

        <Table<MaintenanceRecord>
          columns={columns}
          data={records}
          isLoading={loading}
          emptyMessage="No maintenance records found."
          onRowClick={(row) => router.push(`/maintenance/${row.id}`)}
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
