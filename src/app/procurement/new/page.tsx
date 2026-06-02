'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { purchaseOrders as poApi, vendors as vendorsApi } from '@/lib/api';
import type { Vendor } from '@/types';

export default function NewProcurementPage() {
  const router = useRouter();
  const [vendorOptions, setVendorOptions] = useState<{ value: string | number; label: string }[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [itemType, setItemType] = useState<'Asset' | 'License'>('Asset');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceReference, setInvoiceReference] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    vendorsApi.list().then((r) => {
      const list: Vendor[] = Array.isArray(r.data) ? r.data as Vendor[] : [];
      setVendorOptions(list.map((v) => ({ value: v.id, label: v.name })));
    }).catch(() => {});
  }, []);

  const totalCost =
    quantity && unitCost && !isNaN(Number(quantity)) && !isNaN(Number(unitCost))
      ? Number(quantity) * Number(unitCost)
      : 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!vendorId) e.vendorId = 'Vendor is required.';
    if (!itemDescription.trim()) e.itemDescription = 'Item description is required.';
    if (!quantity || Number(quantity) < 1) e.quantity = 'Quantity must be at least 1.';
    if (!unitCost || Number(unitCost) < 0) e.unitCost = 'Unit cost is required.';
    if (!orderDate) e.orderDate = 'Order date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const resp = await poApi.create({
        vendorId: Number(vendorId),
        itemType,
        itemDescription: itemDescription.trim(),
        quantity: Number(quantity),
        unitCost: Number(unitCost),
        totalCost,
        orderDate,
        invoiceReference: invoiceReference || undefined,
        notes: notes || undefined,
      });
      router.push(`/procurement/${resp.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSubmitError(msg ?? 'Failed to create purchase order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="New Purchase Order">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <Card title="Purchase Order Details">
            {submitError && (
              <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {submitError}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Vendor"
                required
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                options={vendorOptions}
                placeholder="Select vendor..."
                error={errors.vendorId}
              />
              <Select
                label="Item Type"
                required
                value={itemType}
                onChange={(e) => setItemType(e.target.value as 'Asset' | 'License')}
                options={[{ value: 'Asset', label: 'Asset' }, { value: 'License', label: 'License' }]}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Item Description"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  error={errors.itemDescription}
                />
              </div>
              <Input
                label="Quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={errors.quantity}
              />
              <Input
                label="Unit Cost ($)"
                type="number"
                min="0"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                error={errors.unitCost}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-500">Total Cost</label>
                <p className="text-lg font-semibold text-slate-900">${totalCost.toFixed(2)}</p>
              </div>
              <Input
                label="Order Date"
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                error={errors.orderDate}
              />
              <Input
                label="Invoice Reference"
                value={invoiceReference}
                onChange={(e) => setInvoiceReference(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>Create Order</Button>
              <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>Cancel</Button>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
