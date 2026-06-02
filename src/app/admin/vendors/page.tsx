'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { vendors as vendorsApi } from '@/lib/api';
import type { Vendor } from '@/types';

export default function VendorsPage() {
  const [vendorList, setVendorList] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await vendorsApi.list();
      setVendorList(Array.isArray(r.data) ? r.data as Vendor[] : []);
    } catch {
      setError('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setContactPerson(''); setEmail(''); setPhone(''); setAddress('');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    setName(v.name); setContactPerson(v.contactPerson); setEmail(v.email); setPhone(v.phone); setAddress(v.address ?? '');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !contactPerson.trim() || !email.trim() || !phone.trim()) {
      setFormError('Name, contact, email, and phone are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const data = { name: name.trim(), contactPerson: contactPerson.trim(), email: email.trim(), phone: phone.trim(), address: address || undefined };
      if (editing) {
        await vendorsApi.update(editing.id, data);
      } else {
        await vendorsApi.create(data);
      }
      setShowModal(false);
      fetchVendors();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(msg ?? 'Failed to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this vendor?')) return;
    try {
      await vendorsApi.delete(id);
      fetchVendors();
    } catch { /* ignore */ }
  };

  const columns: TableColumn<Vendor>[] = [
    { key: 'name', header: 'Name' },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Remove</Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Vendors">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={openCreate}>+ Add Vendor</Button>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}
        <Table<Vendor>
          columns={columns}
          data={vendorList}
          isLoading={loading}
          emptyMessage="No vendors found."
          keyExtractor={(row) => row.id}
        />
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Vendor' : 'Add Vendor'}
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
            <Input label="Contact Person" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
