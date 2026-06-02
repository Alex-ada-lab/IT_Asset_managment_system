'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { departments as depsApi } from '@/lib/api';
import type { Department } from '@/types';

export default function DepartmentsPage() {
  const [depList, setDepList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchDeps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await depsApi.list();
      setDepList(Array.isArray(r.data) ? r.data as Department[] : []);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeps(); }, [fetchDeps]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setDescription('');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    setName(d.name); setDescription(d.description ?? '');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Department name is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const data = { name: name.trim(), description: description || undefined };
      if (editing) {
        await depsApi.update(editing.id, data);
      } else {
        await depsApi.create(data);
      }
      setShowModal(false);
      fetchDeps();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(msg ?? 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this department?')) return;
    try {
      await depsApi.delete(id);
      fetchDeps();
    } catch { /* ignore */ }
  };

  const columns: TableColumn<Department>[] = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (r) => <span>{r.description ?? '—'}</span> },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => <Badge variant={r.isActive ? 'available' : 'retired'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          {r.isActive && (
            <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Deactivate</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Departments">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={openCreate}>+ Add Department</Button>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}
        <Table<Department>
          columns={columns}
          data={depList}
          isLoading={loading}
          emptyMessage="No departments found."
          keyExtractor={(row) => row.id}
        />
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Department' : 'Add Department'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            {formError && <p className="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">{formError}</p>}
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
