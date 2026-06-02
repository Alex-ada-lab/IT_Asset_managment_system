'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Badge, { statusToBadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Table, { TableColumn } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import AssignModal from '@/components/assets/AssignModal';
import { assets as assetsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset, AssetHistory, AssetStatus, MaintenanceRecord } from '@/types';

const STATUS_TRANSITIONS: Record<string, AssetStatus[]> = {
  Available: ['Assigned', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'],
  Assigned: ['Available', 'Under Maintenance', 'Retired', 'Disposed'],
  'Under Maintenance': ['Available', 'Retired', 'Disposed'],
  Lost: ['Retired', 'Disposed'],
  Retired: ['Disposed'],
  Disposed: [],
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<AssetStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const canEdit = user?.roleName === 'Administrator' || user?.roleName === 'IT Staff';
  const isAdmin = user?.roleName === 'Administrator';

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [assetResp, histResp] = await Promise.all([
        assetsApi.get(id),
        assetsApi.getHistory(id),
      ]);
      setAsset(assetResp.data);
      setHistory(Array.isArray(histResp.data) ? histResp.data : []);
    } catch {
      setError('Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCheckin = async () => {
    if (!asset) return;
    try {
      await assetsApi.checkin(asset.id);
      fetchAll();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to check in asset.');
    }
  };

  const handleArchive = async () => {
    if (!asset) return;
    if (!confirm('Archive this asset? This will set status to Retired.')) return;
    try {
      await assetsApi.delete(asset.id);
      router.push('/assets');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to archive asset.');
    }
  };

  const handleStatusChange = async () => {
    if (!asset || !newStatus) return;
    setStatusLoading(true);
    setStatusError('');
    try {
      await assetsApi.updateStatus(asset.id, newStatus, statusNotes || undefined);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchAll();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setStatusError(msg ?? 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const historyColumns: TableColumn<AssetHistory>[] = [
    { key: 'employeeName', header: 'Employee', render: (r) => <span>{r.employeeName ?? '—'}</span> },
    { key: 'departmentName', header: 'Department', render: (r) => <span>{r.departmentName ?? '—'}</span> },
    { key: 'location', header: 'Location', render: (r) => <span>{r.location ?? '—'}</span> },
    {
      key: 'assignedDate',
      header: 'Assigned',
      render: (r) => <span>{r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'returnDate',
      header: 'Returned',
      render: (r) => <span>{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}</span>,
    },
  ];

  const allowedTransitions = asset ? (STATUS_TRANSITIONS[asset.status] ?? []) : [];

  if (loading) {
    return (
      <AppLayout title="Asset Detail">
        <div className="flex h-64 justify-center items-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !asset) {
    return (
      <AppLayout title="Asset Detail">
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error || 'Asset not found.'}
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={asset.name}>
      {/* Action bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => router.push('/assets')}>
          ← Back
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/assets/${id}/edit`)}
          >
            Edit
          </Button>
        )}
        {canEdit && asset.status === 'Available' && (
          <Button variant="primary" size="sm" onClick={() => setShowAssign(true)}>
            Assign
          </Button>
        )}
        {canEdit && asset.status === 'Assigned' && (
          <Button variant="secondary" size="sm" onClick={handleCheckin}>
            Check In
          </Button>
        )}
        {canEdit && allowedTransitions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStatusModal(true)}
          >
            Change Status
          </Button>
        )}
        {isAdmin && asset.status !== 'Retired' && asset.status !== 'Disposed' && (
          <Button variant="danger" size="sm" onClick={handleArchive}>
            Archive
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Details */}
        <Card title="Asset Details">
          <dl>
            <DetailRow label="Asset ID" value={asset.assetId} />
            <DetailRow
              label="Status"
              value={
                <Badge variant={statusToBadgeVariant(asset.status)}>
                  {asset.status}
                </Badge>
              }
            />
            <DetailRow label="Name" value={asset.name} />
            <DetailRow label="Type" value={asset.assetType} />
            <DetailRow label="Category" value={asset.categoryName} />
            <DetailRow label="Serial Number" value={asset.serialNumber} />
            <DetailRow label="Manufacturer" value={asset.manufacturer} />
            <DetailRow label="Model" value={asset.model} />
            <DetailRow
              label="Purchase Date"
              value={asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
            />
            <DetailRow
              label="Purchase Cost"
              value={asset.purchaseCost != null ? `$${Number(asset.purchaseCost).toFixed(2)}` : '—'}
            />
            <DetailRow
              label="Warranty Expiry"
              value={
                asset.warrantyExpiryDate
                  ? new Date(asset.warrantyExpiryDate).toLocaleDateString()
                  : '—'
              }
            />
            <DetailRow label="Location" value={asset.location} />
            <DetailRow label="Department" value={asset.departmentName} />
            <DetailRow label="Assigned To" value={asset.assignedEmployeeName} />
            <DetailRow label="Barcode" value={asset.barcode} />
            <DetailRow label="Notes" value={asset.notes} />
          </dl>
        </Card>

        {/* Assignment history */}
        <div className="space-y-6">
          <Card title="Assignment History">
          <Table<AssetHistory>
              columns={historyColumns}
              data={history}
              emptyMessage="No assignment history."
              keyExtractor={(row) => row.id}
            />
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <AssignModal
          assetId={asset.id}
          onClose={() => setShowAssign(false)}
          onSuccess={() => {
            setShowAssign(false);
            fetchAll();
          }}
        />
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <Modal
          title="Change Asset Status"
          onClose={() => {
            setShowStatusModal(false);
            setStatusError('');
          }}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowStatusModal(false)} disabled={statusLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStatusChange} loading={statusLoading} disabled={!newStatus}>
                Update Status
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {statusError && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {statusError}
              </p>
            )}
            <Select
              label="New Status"
              required
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AssetStatus)}
              options={allowedTransitions.map((s) => ({ value: s, label: s }))}
              placeholder="Select new status..."
            />
            <Input
              label="Notes"
              placeholder="Reason for status change..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
