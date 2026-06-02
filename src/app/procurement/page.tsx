'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { purchaseOrders as poApi } from '@/lib/api';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Received', label: 'Received' },
  { value: 'Cancelled', label: 'Cancelled' },
];

function poStatusVariant(status: PurchaseOrderStatus) {
  const m: Record<PurchaseOrderStatus, 'warning' | 'info' | 'success' | 'danger'> = {
    Pending: 'warning',
    Approved: 'info',
    Received: 'success',
    Cancelled: 'danger',
  };
  return m[status] ?? 'default';
}

export default function ProcurementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const PAGE_SIZE = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await poApi.list({
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const d = resp.data;
      if (Array.isArray(d)) {
        setOrders(d as PurchaseOrder[]);
        setTotal((d as PurchaseOrder[]).length);
      } else {
        setOrders(d.data ?? []);
        setTotal(d.pagination?.total ?? 0);
      }
    } catch {
      setError('Failed to load purchase orders.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleReceive = async (id: number) => {
    if (!confirm('Mark this order as received?')) return;
    try {
      await poApi.receive(id);
      fetchOrders();
    } catch {
      // ignore
    }
  };

  const columns: TableColumn<PurchaseOrder>[] = [
    { key: 'id', header: 'PO #' },
    { key: 'vendorName', header: 'Vendor', render: (r) => <span>{r.vendorName ?? '—'}</span> },
    { key: 'itemDescription', header: 'Item' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (r) => <span>{r.totalCost != null ? `$${Number(r.totalCost).toFixed(2)}` : '—'}</span>,
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (r) => <span>{r.orderDate ? new Date(r.orderDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={poStatusVariant(r.status as PurchaseOrderStatus)}>{r.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/procurement/${r.id}`); }}>View</Button>
          {r.status === 'Pending' || r.status === 'Approved' ? (
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleReceive(r.id); }}>Receive</Button>
          ) : null}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout title="Procurement">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push('/admin/vendors')}>
              Manage Vendors
            </Button>
            <Button variant="primary" onClick={() => router.push('/procurement/new')}>
              + New Order
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>
        )}

        <Table<PurchaseOrder>
          columns={columns}
          data={orders}
          isLoading={loading}
          emptyMessage="No purchase orders found."
          onRowClick={(row) => router.push(`/procurement/${row.id}`)}
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
