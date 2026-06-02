'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Table, { TableColumn } from '@/components/ui/Table';
import { licenses as licensesApi } from '@/lib/api';
import type { SoftwareLicense, LicenseInstallation } from '@/types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function LicenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [license, setLicense] = useState<SoftwareLicense | null>(null);
  const [installations, setInstallations] = useState<LicenseInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    licensesApi
      .list({ pageSize: 1 })
      .then(() => {})
      .catch(() => {});

    // Get this specific license
    licensesApi.compliance().then((r) => {
      const allLicenses = Array.isArray(r.data) ? r.data as SoftwareLicense[] : [];
      const found = allLicenses.find((l) => String(l.id) === String(id));
      if (found) setLicense(found);
    }).catch(() => {});

    // Also try direct fetch
    licensesApi.list({ pageSize: 200 }).then((r) => {
      const list: SoftwareLicense[] = Array.isArray(r.data)
        ? r.data as SoftwareLicense[]
        : r.data.data ?? [];
      const found = list.find((l) => String(l.id) === String(id));
      if (found) setLicense(found);
    }).catch(() => setError('Failed to load license.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUninstall = async (installId: number) => {
    if (!confirm('Remove this installation?')) return;
    try {
      await licensesApi.uninstall(id!, installId);
      setInstallations((prev) => prev.filter((i) => i.id !== installId));
    } catch {
      // ignore
    }
  };

  const installColumns: TableColumn<LicenseInstallation>[] = [
    { key: 'assetName', header: 'Asset', render: (r) => <span>{r.assetName ?? r.assetId}</span> },
    {
      key: 'installedDate',
      header: 'Installed',
      render: (r) => <span>{r.installedDate ? new Date(r.installedDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button variant="danger" size="sm" onClick={() => handleUninstall(r.id)}>
          Uninstall
        </Button>
      ),
    },
  ];

  const daysLeft = license
    ? Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <AppLayout title="License Detail">
        <div className="flex h-64 justify-center items-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !license) {
    return (
      <AppLayout title="License Detail">
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error || 'License not found.'}
        </p>
      </AppLayout>
    );
  }

  const usagePercent = license.totalSeats > 0 ? (license.usedSeats / license.totalSeats) * 100 : 0;

  return (
    <AppLayout title={license.softwareName}>
      <div className="mb-4 flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => router.push('/licenses')}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="License Details">
          <dl>
            <DetailRow label="Software" value={license.softwareName} />
            <DetailRow label="Vendor" value={license.vendor} />
            <DetailRow label="License Type" value={license.licenseType} />
            <DetailRow label="License Key" value={<code className="text-xs">{license.licenseKey}</code>} />
            <DetailRow
              label="Purchase Date"
              value={new Date(license.purchaseDate).toLocaleDateString()}
            />
            <DetailRow
              label="Expiry Date"
              value={
                <span className="flex items-center gap-2">
                  {new Date(license.expiryDate).toLocaleDateString()}
                  {daysLeft < 0 ? (
                    <Badge variant="danger">Expired</Badge>
                  ) : daysLeft <= 30 ? (
                    <Badge variant="warning">Expires in {daysLeft}d</Badge>
                  ) : (
                    <Badge variant="available">Active</Badge>
                  )}
                </span>
              }
            />
            <DetailRow label="Notes" value={license.notes} />
          </dl>
        </Card>

        <Card title="Compliance">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{license.totalSeats}</p>
                <p className="text-xs text-slate-500">Total Seats</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{license.usedSeats}</p>
                <p className="text-xs text-slate-500">Used</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {license.availableSeats ?? license.totalSeats - license.usedSeats}
                </p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Seat Usage</span>
                <span>{usagePercent.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={[
                    'h-full rounded-full',
                    usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500',
                  ].join(' ')}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {usagePercent >= 90 && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                ⚠ Seat usage is critically high. Consider purchasing additional seats.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Installations">
          <Table<LicenseInstallation>
            columns={installColumns}
            data={installations}
            emptyMessage="No installations recorded."
            keyExtractor={(row) => row.id}
          />
        </Card>
      </div>
    </AppLayout>
  );
}
