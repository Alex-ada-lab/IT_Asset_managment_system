'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { TableColumn } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';
import { reports as reportsApi } from '@/lib/api';

type ReportType = 'inventory' | 'maintenance' | 'utilization' | 'disposal' | 'procurement';

const REPORT_TITLES: Record<ReportType, string> = {
  inventory: 'Inventory Report',
  maintenance: 'Maintenance Report',
  utilization: 'Utilization Report',
  disposal: 'Disposal Report',
  procurement: 'Procurement Report',
};

const REPORT_COLUMNS: Record<ReportType, TableColumn<Record<string, unknown>>[]> = {
  inventory: [
    { key: 'assetId', header: 'Asset ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'assignedEmployee', header: 'Assigned To', render: (r) => <span>{(r.assignedEmployee as string) ?? '—'}</span> },
    { key: 'department', header: 'Department', render: (r) => <span>{(r.department as string) ?? '—'}</span> },
    { key: 'location', header: 'Location', render: (r) => <span>{(r.location as string) ?? '—'}</span> },
    {
      key: 'warrantyExpiry',
      header: 'Warranty Expiry',
      render: (r) => <span>{r.warrantyExpiry ? new Date(r.warrantyExpiry as string).toLocaleDateString() : '—'}</span>,
    },
  ],
  maintenance: [
    { key: 'assetName', header: 'Asset' },
    { key: 'vendor', header: 'Vendor', render: (r) => <span>{(r.vendor as string) ?? '—'}</span> },
    {
      key: 'cost',
      header: 'Cost',
      render: (r) => <span>{r.cost != null ? `$${Number(r.cost).toFixed(2)}` : '—'}</span>,
    },
    { key: 'resolution', header: 'Resolution', render: (r) => <span>{(r.resolution as string) ?? '—'}</span> },
    {
      key: 'completedDate',
      header: 'Completed',
      render: (r) => <span>{r.completedDate ? new Date(r.completedDate as string).toLocaleDateString() : '—'}</span>,
    },
  ],
  utilization: [
    { key: 'assetId', header: 'Asset ID' },
    { key: 'assetName', header: 'Asset Name' },
    {
      key: 'utilizationPercent',
      header: 'Utilization %',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden w-24">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${Math.min(100, Number(r.utilizationPercent ?? 0))}%` }}
            />
          </div>
          <span className="text-xs">{Number(r.utilizationPercent ?? 0).toFixed(1)}%</span>
        </div>
      ),
    },
  ],
  disposal: [
    { key: 'assetId', header: 'Asset ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    {
      key: 'disposalDate',
      header: 'Disposal Date',
      render: (r) => <span>{r.disposalDate ? new Date(r.disposalDate as string).toLocaleDateString() : '—'}</span>,
    },
    { key: 'reason', header: 'Reason', render: (r) => <span>{(r.reason as string) ?? '—'}</span> },
  ],
  procurement: [
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (r) => <span>{r.orderDate ? new Date(r.orderDate as string).toLocaleDateString() : '—'}</span>,
    },
    { key: 'vendor', header: 'Vendor' },
    { key: 'itemDescription', header: 'Item' },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'totalCost',
      header: 'Total Cost',
      render: (r) => <span>{r.totalCost != null ? `$${Number(r.totalCost).toFixed(2)}` : '—'}</span>,
    },
    { key: 'status', header: 'Status' },
  ],
};

export default function ReportPage() {
  const { type } = useParams<{ type: string }>();
  const router = useRouter();
  const reportType = type as ReportType;

  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const title = REPORT_TITLES[reportType] ?? 'Report';
  const columns = REPORT_COLUMNS[reportType] ?? [];

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      let resp;
      switch (reportType) {
        case 'inventory': resp = await reportsApi.inventory(); break;
        case 'maintenance': resp = await reportsApi.maintenance(params); break;
        case 'utilization': resp = await reportsApi.utilization(params); break;
        case 'disposal': resp = await reportsApi.disposal(); break;
        case 'procurement': resp = await reportsApi.procurement(params); break;
        default:
          setError('Unknown report type.');
          setLoading(false);
          return;
      }
      const rows = Array.isArray(resp.data) ? resp.data : (resp.data as { data?: unknown[] })?.data ?? [];
      setData(rows as Record<string, unknown>[]);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { startDate: startDate || undefined, endDate: endDate || undefined, format: 'csv' as const };
      let resp;
      switch (reportType) {
        case 'inventory': resp = await reportsApi.inventory('csv'); break;
        case 'maintenance': resp = await reportsApi.maintenance(params); break;
        case 'utilization': resp = await reportsApi.utilization(params); break;
        case 'disposal': resp = await reportsApi.disposal('csv'); break;
        case 'procurement': resp = await reportsApi.procurement(params); break;
        default: return;
      }
      // Trigger download
      const blob = new Blob([resp.data as BlobPart], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  if (!REPORT_TITLES[reportType]) {
    return (
      <AppLayout title="Report Not Found">
        <p className="text-slate-500">Unknown report type: {type}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/reports')}>
          Back to Reports
        </Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={title}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => router.push('/reports')}>
            ← Back
          </Button>
          {(reportType === 'maintenance' || reportType === 'utilization' || reportType === 'procurement') && (
            <>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
          <Button variant="primary" size="sm" onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Run Report'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} loading={exporting}>
            Export CSV
          </Button>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>
        )}

        {loading ? (
          <div className="flex h-64 justify-center items-center">
            <Spinner size="lg" className="text-primary-600" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={data}
            emptyMessage="No data found for this report."
            keyExtractor={(_, i) => i}
          />
        )}
      </div>
    </AppLayout>
  );
}
