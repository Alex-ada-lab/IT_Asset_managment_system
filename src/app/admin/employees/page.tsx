'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { employees as empApi, departments as depsApi } from '@/lib/api';
import type { Employee, Department } from '@/types';

export default function EmployeesPage() {
  const [empList, setEmpList] = useState<Employee[]>([]);
  const [depList, setDepList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [er, dr] = await Promise.all([
        empApi.list({ pageSize: 200 }),
        depsApi.list(),
      ]);
      const empData = er.data;
      setEmpList(Array.isArray(empData) ? empData as Employee[] : empData.data ?? []);
      setDepList(Array.isArray(dr.data) ? dr.data as Department[] : []);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setFirstName(''); setLastName(''); setEmployeeId(''); setEmail(''); setJobTitle(''); setDepartmentId('');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setFirstName(e.firstName); setLastName(e.lastName); setEmployeeId(e.employeeId);
    setEmail(e.email); setJobTitle(e.jobTitle); setDepartmentId(String(e.departmentId ?? ''));
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !employeeId.trim() || !email.trim() || !jobTitle.trim()) {
      setFormError('All required fields must be filled in.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        employeeId: employeeId.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim(),
        departmentId: departmentId ? Number(departmentId) : undefined,
      };
      if (editing) {
        await empApi.update(editing.id, data);
      } else {
        await empApi.create(data);
      }
      setShowModal(false);
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(msg ?? 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this employee?')) return;
    try {
      await empApi.deactivate(id);
      fetchData();
    } catch { /* ignore */ }
  };

  const columns: TableColumn<Employee>[] = [
    { key: 'employeeId', header: 'Employee ID' },
    {
      key: 'name',
      header: 'Name',
      render: (r) => <span>{r.firstName} {r.lastName}</span>,
    },
    { key: 'email', header: 'Email' },
    { key: 'jobTitle', header: 'Job Title' },
    { key: 'departmentName', header: 'Department', render: (r) => <span>{r.departmentName ?? '—'}</span> },
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
            <Button variant="danger" size="sm" onClick={() => handleDeactivate(r.id)}>Deactivate</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Employees">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={openCreate}>+ Add Employee</Button>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}
        <Table<Employee>
          columns={columns}
          data={empList}
          isLoading={loading}
          emptyMessage="No employees found."
          keyExtractor={(row) => row.id}
        />
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Employee' : 'Add Employee'}
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
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Employee ID" required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Job Title" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Select
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={depList.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Select department..."
            />
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
