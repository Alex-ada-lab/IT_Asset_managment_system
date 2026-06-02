'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AssetForm from '@/components/assets/AssetForm';

export default function NewAssetPage() {
  return (
    <AppLayout title="New Asset">
      <div className="max-w-3xl">
        <AssetForm />
      </div>
    </AppLayout>
  );
}
