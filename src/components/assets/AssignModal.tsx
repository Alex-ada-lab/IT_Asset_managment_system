'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select, { SelectOption } from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { employees as employeesApi, assets as assetsApi } from '@/lib/api';
import type { Employee } from '@/types';

interface AssignModalProps {
  assetId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignModal({ assetId, onClose, onSuccess }: AssignModalProps) {
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    employeesApi.list({ isActive: true, pageSize: 200 }).then((r) => {
      const list: Employee[] = Array.isArray(r.data)
        ? (r.data as unknown as Employee[])
        : (r.data.data ?? []);
      setEmployeeOptions(
        list.map((emp) => ({
          value: emp.id,
          label: `${emp.firstName} ${emp.lastName} (${emp.employeeId})`,
        }))
      );
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await assetsApi.assign(assetId, {
        employeeId: Number(employeeId),
        location: location || undefined,
        notes: notes || undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Failed to assign asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Assign Asset"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </p>
        )}
        <Select
          label="Employee"
          required
          options={employeeOptions}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Select employee..."
        />
        <Input
          label="Location"
          placeholder="e.g. Office 3B"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Input
          label="Notes"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}
