'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { auditLogs as auditLogsApi } from '@/lib/api';
import type { AuditLog } from '@/types';

const ENTITY_TYPES = [
  { value: '', label: 'All Entity Types' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Employee', label: 'Employee' },
  { value: 'User', label: 'User' },
  { value: 'MaintenanceRecord', label: 'Maintenance' },
  { value: 'License', label: 'License' },
  { value: 'PurchaseOrder', label: 'Purchase Order' },
  { value: 'Department', label: 'Department' },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const PAGE_SIZE = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await auditLogsApi.list({
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      const d = resp.data;
      if (Array.isArray(d)) {
        setLogs(d as AuditLog[]);
        setTotal((d as AuditLog[]).length);
      } else {
        setLogs(d.data ?? []);
        setTotal(d.pagination?.total ?? 0);
      }
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, startDate, endDate, page]);

  useEffect(() => { setPage(1); }, [entityType, entityId, startDate, endDate]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns: TableColumn<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (r) => <span>{new Date(r.timestamp).toLocaleString()}</span>,
    },
    { key: 'entityType', header: 'Entity Type' },
    { key: 'entityId', header: 'Entity ID' },
    { key: 'action', header: 'Action' },
    {
      key: 'actingUserEmail',
      header: 'User',
      render: (r) => <span>{r.actingUserEmail ?? String(r.actingUserId)}</span>,
    },
    {
      key: 'changedFields',
      header: 'Changes',
      render: (r) => (
        <span className="text-xs text-slate-500 truncate max-w-xs block">
          {r.changedFields ? JSON.stringify(r.changedFields).slice(0, 60) + '...' : '—'}
        </span>
      ),
    },
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppLayout title="Audit Logs">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Entity Type"
            options={ENTITY_TYPES}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-44"
          />
          <Input
            label="Entity ID"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="e.g. 42"
            className="w-28"
          />
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
          <Button variant="primary" size="sm" onClick={fetchLogs} disabled={loading}>
            Filter
          </Button>
        </div>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}

        <Table<AuditLog>
          columns={columns}
          data={logs}
          isLoading={loading}
          emptyMessage="No audit log entries found."
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
