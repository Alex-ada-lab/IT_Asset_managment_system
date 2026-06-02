'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { reports } from '@/lib/api';
import type { DashboardReport } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Available: '#22c55e',
  Assigned: '#3b82f6',
  'Under Maintenance': '#f59e0b',
  Lost: '#ef4444',
  Retired: '#94a3b8',
  Disposed: '#64748b',
};

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

function StatCard({ label, value, color = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reports
      .dashboard()
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const content = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      );
    }
    if (error) {
      return (
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
          {error}
        </p>
      );
    }
    if (!data) return null;

    const statusPieData = Object.entries(data.byStatus ?? {}).map(([name, value]) => ({
      name,
      value,
    }));

    const deptBarData = (data.byDepartment ?? []).map((d) => ({
      name: d.department ?? 'Unknown',
      count: d.count,
    }));

    return (
      <>
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Total Assets" value={data.totalAssets ?? 0} />
          <StatCard
            label="Assigned"
            value={data.byStatus?.['Assigned'] ?? 0}
            color="text-blue-600"
          />
          <StatCard
            label="Available"
            value={data.byStatus?.['Available'] ?? 0}
            color="text-green-600"
          />
          <StatCard
            label="Under Maintenance"
            value={data.byStatus?.['Under Maintenance'] ?? 0}
            color="text-yellow-600"
          />
          <StatCard
            label="Warranty Expiring"
            value={data.warrantyExpiringSoon ?? 0}
            color="text-orange-600"
          />
          <StatCard
            label="Licenses Expiring"
            value={data.licensesExpiringSoon ?? 0}
            color="text-purple-600"
          />
          <StatCard
            label="Monthly Maint. Cost"
            value={`$${(data.monthlyMaintenanceCost ?? 0).toFixed(2)}`}
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar chart: by department */}
          <Card title="Assets by Department">
            {deptBarData.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No department data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptBarData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Pie chart: by status */}
          <Card title="Assets by Status">
            {statusPieData.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No status data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {statusPieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </>
    );
  };

  return <AppLayout title="Dashboard">{content()}</AppLayout>;
}
