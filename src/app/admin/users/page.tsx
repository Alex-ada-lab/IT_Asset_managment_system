'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Table, { TableColumn } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { admin as adminApi } from '@/lib/api';
import type { User } from '@/types';

const ROLES = [
  { id: 1, name: 'Administrator' },
  { id: 2, name: 'IT Staff' },
  { id: 3, name: 'Read-Only User' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await adminApi.users.list();
      setUsers(Array.isArray(r.data) ? r.data as User[] : []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: number, roleId: number) => {
    setUpdating(userId);
    try {
      await adminApi.assignRole(userId, roleId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roleId, roleName: ROLES.find((r) => r.id === roleId)?.name as User['roleName'] }
            : u
        )
      );
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const roleBadgeVariant = (role: string) => {
    if (role === 'Administrator') return 'danger';
    if (role === 'IT Staff') return 'info';
    return 'default';
  };

  const columns: TableColumn<User>[] = [
    { key: 'id', header: 'ID' },
    { key: 'email', header: 'Email' },
    {
      key: 'roleName',
      header: 'Current Role',
      render: (r) => <Badge variant={roleBadgeVariant(r.roleName ?? '')}>{r.roleName}</Badge>,
    },
    {
      key: 'actions',
      header: 'Assign Role',
      render: (r) => (
        <select
          value={r.roleId}
          disabled={updating === r.id}
          onChange={(e) => handleRoleChange(r.id, Number(e.target.value))}
          className="rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ROLES.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <AppLayout title="User Management">
      <div className="space-y-4">
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}
        <Table<User>
          columns={columns}
          data={users}
          isLoading={loading}
          emptyMessage="No users found."
          keyExtractor={(row) => row.id}
        />
      </div>
    </AppLayout>
  );
}
