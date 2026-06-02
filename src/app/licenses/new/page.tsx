'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { licenses as licensesApi } from '@/lib/api';

const LICENSE_TYPES = ['Perpetual', 'Subscription', 'OEM', 'Volume', 'Trial', 'Open Source', 'Other'];

export default function NewLicensePage() {
  const router = useRouter();

  const [softwareName, setSoftwareName] = useState('');
  const [vendor, setVendor] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [totalSeats, setTotalSeats] = useState('1');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!softwareName.trim()) e.softwareName = 'Software name is required.';
    if (!vendor.trim()) e.vendor = 'Vendor is required.';
    if (!licenseKey.trim()) e.licenseKey = 'License key is required.';
    if (!licenseType) e.licenseType = 'License type is required.';
    if (!totalSeats || Number(totalSeats) < 1) e.totalSeats = 'Total seats must be at least 1.';
    if (!purchaseDate) e.purchaseDate = 'Purchase date is required.';
    if (!expiryDate) e.expiryDate = 'Expiry date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const resp = await licensesApi.create({
        softwareName: softwareName.trim(),
        vendor: vendor.trim(),
        licenseKey: licenseKey.trim(),
        licenseType,
        totalSeats: Number(totalSeats),
        purchaseDate,
        expiryDate,
        cost: cost ? Number(cost) : undefined,
        notes: notes || undefined,
      });
      router.push(`/licenses/${resp.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSubmitError(msg ?? 'Failed to create license.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Register License">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <Card title="License Details">
            {submitError && (
              <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {submitError}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Software Name" required value={softwareName} onChange={(e) => setSoftwareName(e.target.value)} error={errors.softwareName} />
              <Input label="Vendor" required value={vendor} onChange={(e) => setVendor(e.target.value)} error={errors.vendor} />
              <Input label="License Key" required value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} error={errors.licenseKey} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  License Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select type...</option>
                  {LICENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.licenseType && <p className="text-xs text-red-600">{errors.licenseType}</p>}
              </div>
              <Input label="Total Seats" type="number" min="1" required value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} error={errors.totalSeats} />
              <Input label="Cost ($)" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
              <Input label="Purchase Date" type="date" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} error={errors.purchaseDate} />
              <Input label="Expiry Date" type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} error={errors.expiryDate} />
              <div className="sm:col-span-2">
                <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>Register License</Button>
              <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>Cancel</Button>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
