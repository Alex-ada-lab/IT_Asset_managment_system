'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge, { statusToBadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { assets as assetsApi } from '@/lib/api';
import type { Asset } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Retired', label: 'Retired' },
  { value: 'Disposed', label: 'Disposed' },
];

export default function AssetsPage() {
  const router = useRouter();

  const [data, setData] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PAGE_SIZE = 20;

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await assetsApi.list({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const respData = resp.data;
      // Handle both paginated and plain array responses
      if (Array.isArray(respData)) {
        setData(respData as Asset[]);
        setTotal((respData as Asset[]).length);
      } else {
        setData(respData.data ?? []);
        setTotal(respData.pagination?.total ?? 0);
      }
    } catch {
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const columns: TableColumn<Asset>[] = [
    { key: 'assetId', header: 'Asset ID' },
    { key: 'name', header: 'Name' },
    { key: 'assetType', header: 'Type' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={statusToBadgeVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (row) => <span>{row.departmentName ?? '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/assets/${row.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout title="Assets">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name, ID, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            />
          </div>
          <Button variant="primary" onClick={() => router.push('/assets/new')}>
            + Add Asset
          </Button>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </p>
        )}

        <Table<Asset>
          columns={columns}
          data={data}
          isLoading={loading}
          emptyMessage="No assets found."
          onRowClick={(row) => router.push(`/assets/${row.id}`)}
          keyExtractor={(row) => row.id}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
