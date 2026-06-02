'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { assets as assetsApi, admin as adminApi, departments as depsApi } from '@/lib/api';
import type { Asset, Category, Department } from '@/types';

interface AssetFormProps {
  initialData?: Partial<Asset>;
  assetId?: number;
}

const ASSET_TYPES = [
  'Laptop', 'Desktop', 'Monitor', 'Server', 'Network Equipment',
  'Printer', 'Phone', 'Tablet', 'Other',
];

export default function AssetForm({ initialData, assetId }: AssetFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [depsList, setDepsList] = useState<Department[]>([]);

  const [name, setName] = useState(initialData?.name ?? '');
  const [assetType, setAssetType] = useState(initialData?.assetType ?? '');
  const [categoryId, setCategoryId] = useState(String(initialData?.categoryId ?? ''));
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber ?? '');
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer ?? '');
  const [model, setModel] = useState(initialData?.model ?? '');
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchaseDate ? initialData.purchaseDate.slice(0, 10) : ''
  );
  const [purchaseCost, setPurchaseCost] = useState(
    initialData?.purchaseCost != null ? String(initialData.purchaseCost) : ''
  );
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState(
    initialData?.warrantyExpiryDate ? initialData.warrantyExpiryDate.slice(0, 10) : ''
  );
  const [departmentId, setDepartmentId] = useState(
    String(initialData?.departmentId ?? '')
  );
  const [location, setLocation] = useState(initialData?.location ?? '');
  const [barcode, setBarcode] = useState(initialData?.barcode ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.categories.list().catch(() => ({ data: [] })),
      depsApi.list().catch(() => ({ data: [] })),
    ]).then(([catResp, depResp]) => {
      setCategories(catResp.data as Category[]);
      const deps = depResp.data;
      setDepsList(Array.isArray(deps) ? deps : []);
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!assetType) e.assetType = 'Asset type is required.';
    if (!serialNumber.trim()) e.serialNumber = 'Serial number is required.';
    if (!manufacturer.trim()) e.manufacturer = 'Manufacturer is required.';
    if (!model.trim()) e.model = 'Model is required.';
    if (!purchaseDate) e.purchaseDate = 'Purchase date is required.';
    if (!purchaseCost || isNaN(Number(purchaseCost))) e.purchaseCost = 'Valid purchase cost is required.';
    if (!warrantyExpiryDate) e.warrantyExpiryDate = 'Warranty expiry date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    const payload: Partial<Asset> = {
      name: name.trim(),
      assetType,
      categoryId: categoryId ? Number(categoryId) : undefined,
      serialNumber: serialNumber.trim(),
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      purchaseDate,
      purchaseCost: Number(purchaseCost),
      warrantyExpiryDate,
      departmentId: departmentId ? Number(departmentId) : undefined,
      location: location || undefined,
      barcode: barcode || undefined,
      notes: notes || undefined,
    };

    try {
      if (assetId) {
        await assetsApi.update(assetId, payload);
        router.push(`/assets/${assetId}`);
      } else {
        const resp = await assetsApi.create(payload);
        router.push(`/assets/${resp.data.id}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSubmitError(msg ?? 'Failed to save asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card title="Asset Information">
        {submitError && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {submitError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Select
            label="Asset Type"
            required
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            options={ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Select type..."
            error={errors.assetType}
          />
          <Input
            label="Serial Number"
            required
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            error={errors.serialNumber}
          />
          <Input
            label="Manufacturer"
            required
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            error={errors.manufacturer}
          />
          <Input
            label="Model"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            error={errors.model}
          />
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category..."
          />
          <Input
            label="Purchase Date"
            type="date"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            error={errors.purchaseDate}
          />
          <Input
            label="Purchase Cost ($)"
            type="number"
            min="0"
            step="0.01"
            required
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            error={errors.purchaseCost}
          />
          <Input
            label="Warranty Expiry Date"
            type="date"
            required
            value={warrantyExpiryDate}
            onChange={(e) => setWarrantyExpiryDate(e.target.value)}
            error={errors.warrantyExpiryDate}
          />
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={depsList.map((d) => ({ value: d.id, label: d.name }))}
            placeholder="Select department..."
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Barcode / QR Code"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" variant="primary" loading={loading}>
            {assetId ? 'Save Changes' : 'Create Asset'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </form>
  );
}
