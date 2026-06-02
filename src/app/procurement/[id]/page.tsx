'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { purchaseOrders as poApi } from '@/lib/api';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  );
}

function poStatusVariant(status: PurchaseOrderStatus) {
  const m: Record<PurchaseOrderStatus, 'warning' | 'info' | 'success' | 'danger'> = {
    Pending: 'warning',
    Approved: 'info',
    Received: 'success',
    Cancelled: 'danger',
  };
  return m[status] ?? 'default';
}

export default function ProcurementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    poApi.get(id)
      .then((r) => setOrder(r.data))
      .catch(() => setError('Failed to load purchase order.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReceive = async () => {
    if (!confirm('Mark this order as received?')) return;
    try {
      await poApi.receive(id!);
      const r = await poApi.get(id!);
      setOrder(r.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to receive order.');
    }
  };

  if (loading) {
    return (
      <AppLayout title="Purchase Order">
        <div className="flex h-64 justify-center items-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout title="Purchase Order">
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error || 'Order not found.'}
        </p>
      </AppLayout>
    );
  }

  const canReceive = order.status === 'Pending' || order.status === 'Approved';

  return (
    <AppLayout title={`Purchase Order #${order.id}`}>
      <div className="mb-4 flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => router.push('/procurement')}>
          ← Back
        </Button>
        {canReceive && (
          <Button variant="primary" size="sm" onClick={handleReceive}>
            Mark as Received
          </Button>
        )}
      </div>

      <div className="max-w-2xl">
        <Card title="Order Details">
          <dl>
            <DetailRow label="Order #" value={order.id} />
            <DetailRow
              label="Status"
              value={
                <Badge variant={poStatusVariant(order.status as PurchaseOrderStatus)}>
                  {order.status}
                </Badge>
              }
            />
            <DetailRow label="Vendor" value={order.vendorName} />
            <DetailRow label="Item Type" value={order.itemType} />
            <DetailRow label="Item Description" value={order.itemDescription} />
            <DetailRow label="Quantity" value={order.quantity} />
            <DetailRow label="Unit Cost" value={`$${Number(order.unitCost).toFixed(2)}`} />
            <DetailRow label="Total Cost" value={`$${Number(order.totalCost).toFixed(2)}`} />
            <DetailRow
              label="Order Date"
              value={order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
            />
            <DetailRow label="Invoice Reference" value={order.invoiceReference} />
            <DetailRow
              label="Received Date"
              value={order.receivedDate ? new Date(order.receivedDate).toLocaleDateString() : '—'}
            />
            <DetailRow label="Notes" value={order.notes} />
          </dl>
        </Card>
      </div>
    </AppLayout>
  );
}
