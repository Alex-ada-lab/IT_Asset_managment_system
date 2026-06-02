'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { maintenance as maintenanceApi } from '@/lib/api';
import type { MaintenanceRecord, MaintenanceStatus } from '@/types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  );
}

function statusBadgeVariant(status: MaintenanceStatus) {
  const m: Record<MaintenanceStatus, 'info' | 'warning' | 'success' | 'danger'> = {
    Requested: 'info',
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return m[status] ?? 'default';
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().slice(0, 10));
  const [actualCost, setActualCost] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    maintenanceApi
      .get(id)
      .then((r) => setRecord(r.data))
      .catch(() => setError('Failed to load maintenance record.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    if (!completedDate) {
      setCompleteError('Completion date is required.');
      return;
    }
    setCompleteLoading(true);
    setCompleteError('');
    try {
      await maintenanceApi.complete(id!, {
        completedDate,
        actualCost: actualCost ? Number(actualCost) : undefined,
        resolutionNotes: resolutionNotes || undefined,
      });
      setShowComplete(false);
      // Reload record
      const r = await maintenanceApi.get(id!);
      setRecord(r.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setCompleteError(msg ?? 'Failed to mark as complete.');
    } finally {
      setCompleteLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Maintenance Detail">
        <div className="flex h-64 justify-center items-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !record) {
    return (
      <AppLayout title="Maintenance Detail">
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error || 'Record not found.'}
        </p>
      </AppLayout>
    );
  }

  const canComplete = record.status === 'Requested' || record.status === 'In Progress';

  return (
    <AppLayout title={`Maintenance #${record.id}`}>
      <div className="mb-4 flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => router.push('/maintenance')}>
          ← Back
        </Button>
        {canComplete && (
          <Button variant="primary" size="sm" onClick={() => setShowComplete(true)}>
            Mark Complete
          </Button>
        )}
      </div>

      <div className="max-w-2xl">
        <Card title="Maintenance Details">
          <dl>
            <DetailRow
              label="Status"
              value={
                <Badge variant={statusBadgeVariant(record.status as MaintenanceStatus)}>
                  {record.status}
                </Badge>
              }
            />
            <DetailRow label="Asset" value={record.assetName ?? String(record.assetId)} />
            <DetailRow label="Issue" value={record.issueDescription} />
            <DetailRow label="Vendor" value={record.vendorName} />
            <DetailRow
              label="Requested Date"
              value={record.requestedDate ? new Date(record.requestedDate).toLocaleDateString() : '—'}
            />
            <DetailRow
              label="Scheduled Date"
              value={record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : '—'}
            />
            <DetailRow
              label="Completed Date"
              value={record.completedDate ? new Date(record.completedDate).toLocaleDateString() : '—'}
            />
            <DetailRow
              label="Estimated Cost"
              value={record.estimatedCost != null ? `$${Number(record.estimatedCost).toFixed(2)}` : '—'}
            />
            <DetailRow
              label="Actual Cost"
              value={record.actualCost != null ? `$${Number(record.actualCost).toFixed(2)}` : '—'}
            />
            <DetailRow label="Resolution Notes" value={record.resolutionNotes} />
          </dl>
        </Card>
      </div>

      {showComplete && (
        <Modal
          title="Mark Maintenance Complete"
          onClose={() => setShowComplete(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowComplete(false)} disabled={completeLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleComplete} loading={completeLoading}>
                Mark Complete
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {completeError && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {completeError}
              </p>
            )}
            <Input
              label="Completion Date"
              type="date"
              required
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
            />
            <Input
              label="Actual Cost ($)"
              type="number"
              min="0"
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
            />
            <Input
              label="Resolution Notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
