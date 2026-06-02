'use client';

import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { admin as adminApi } from '@/lib/api';
import type { Category, NotificationConfig, SystemConfig } from '@/types';

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cfgResp, notifResp, catResp] = await Promise.all([
        adminApi.config.get(),
        adminApi.notificationConfig.get(),
        adminApi.categories.list(),
      ]);
      setConfig(cfgResp.data);
      setNotifConfig(notifResp.data);
      setCategories(Array.isArray(catResp.data) ? catResp.data as Category[] : []);
    } catch {
      setError('Failed to load configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      await adminApi.config.put(config);
      setSuccessMsg('System configuration saved.');
    } catch {
      setError('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifConfig = async () => {
    if (!notifConfig) return;
    setSavingNotif(true);
    setSuccessMsg('');
    try {
      await adminApi.notificationConfig.put(notifConfig);
      setSuccessMsg('Notification settings saved.');
    } catch {
      setError('Failed to save notification settings.');
    } finally {
      setSavingNotif(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="System Configuration">
        <p className="text-slate-500">Loading configuration...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="System Configuration">
      <div className="max-w-2xl space-y-6">
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</p>}
        {successMsg && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">{successMsg}</p>}

        {/* System Config */}
        {config && (
          <Card
            title="System Settings"
            actions={
              <Button variant="primary" size="sm" onClick={handleSaveConfig} loading={saving}>
                Save
              </Button>
            }
          >
            <div className="space-y-4">
              <Input
                label="Asset Return Period (days)"
                type="number"
                min="1"
                value={String(config.assetReturnPeriodDays ?? 30)}
                onChange={(e) =>
                  setConfig({ ...config, assetReturnPeriodDays: Number(e.target.value) })
                }
              />
            </div>
          </Card>
        )}

        {/* Notification Config */}
        {notifConfig && (
          <Card
            title="Notification Settings"
            actions={
              <Button variant="primary" size="sm" onClick={handleSaveNotifConfig} loading={savingNotif}>
                Save
              </Button>
            }
          >
            <div className="space-y-3">
              {(
                [
                  ['warrantyExpiry', 'Warranty Expiry Alerts'],
                  ['licenseExpiry', 'License Expiry Alerts'],
                  ['maintenanceReminders', 'Maintenance Reminders'],
                  ['assetReturnReminders', 'Asset Return Reminders'],
                  ['lowInventory', 'Low Inventory Alerts'],
                ] as [keyof NotificationConfig, string][]
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!notifConfig[key]}
                    onChange={(e) =>
                      setNotifConfig({ ...notifConfig, [key]: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        {/* Categories */}
        <Card title="Asset Categories">
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">No categories found.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                    {cat.lowInventoryThreshold != null && (
                      <span className="ml-2 text-xs text-slate-500">
                        Low threshold: {cat.lowInventoryThreshold}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
