'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AssetForm from '@/components/assets/AssetForm';
import Spinner from '@/components/ui/Spinner';
import { assets as assetsApi } from '@/lib/api';
import type { Asset } from '@/types';

export default function EditAssetPage() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    assetsApi
      .get(id)
      .then((r) => setAsset(r.data))
      .catch(() => setError('Failed to load asset.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout title="Edit Asset">
      {loading && (
        <div className="flex h-64 justify-center items-center">
          <Spinner size="lg" className="text-primary-600" />
        </div>
      )}
      {error && (
        <p className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">{error}</p>
      )}
      {asset && (
        <div className="max-w-3xl">
          <AssetForm initialData={asset} assetId={asset.id} />
        </div>
      )}
    </AppLayout>
  );
}
