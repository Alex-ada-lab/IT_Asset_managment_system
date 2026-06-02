'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { maintenance as maintenanceApi, assets as assetsApi, vendors as vendorsApi } from '@/lib/api';
import type { Asset, Vendor } from '@/types';

export default function NewMaintenancePage() {
  const router = useRouter();

  const [assetOptions, setAssetOptions] = useState<{ value: string | number; label: string }[]>([]);
  const [vendorOptions, setVendorOptions] = useState<{ value: string | number; label: string }[]>([]);

  const [assetId, setAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([
      assetsApi.list({ pageSize: 200 }).catch(() => ({ data: { data: [] } })),
      vendorsApi.list().catch(() => ({ data: [] })),
    ]).then(([ar, vr]) => {
      const aList: Asset[] = Array.isArray(ar.data) ? ar.data as Asset[] : ar.data.data ?? [];
      setAssetOptions(aList.map((a) => ({ value: a.id, label: `${a.assetId} - ${a.name}` })));
      const vList: Vendor[] = Array.isArray(vr.data) ? vr.data as Vendor[] : [];
      setVendorOptions(vList.map((v) => ({ value: v.id, label: v.name })));
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!assetId) e.assetId = 'Asset is required.';
    if (!issueDescription.trim()) e.issueDescription = 'Issue description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const resp = await maintenanceApi.create({
        assetId: Number(assetId),
        issueDescription: issueDescription.trim(),
        vendorId: vendorId ? Number(vendorId) : undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        scheduledDate: scheduledDate || undefined,
        requestedDate: new Date().toISOString().slice(0, 10),
      });
      router.push(`/maintenance/${resp.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSubmitError(msg ?? 'Failed to create maintenance request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="New Maintenance Request">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <Card title="Maintenance Details">
            {submitError && (
              <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {submitError}
              </p>
            )}
            <div className="space-y-4">
              <Select
                label="Asset"
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                options={assetOptions}
                placeholder="Select asset..."
                error={errors.assetId}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe the issue..."
                />
                {errors.issueDescription && (
                  <p className="mt-1 text-xs text-red-600">{errors.issueDescription}</p>
                )}
              </div>
              <Select
                label="Vendor"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                options={vendorOptions}
                placeholder="Select vendor (optional)..."
              />
              <Input
                label="Estimated Cost ($)"
                type="number"
                min="0"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
              <Input
                label="Scheduled Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                Create Request
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
