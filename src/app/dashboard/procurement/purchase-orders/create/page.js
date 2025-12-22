import { Suspense } from 'react';
import CreatePurchaseOrderClient from './CreatePurchaseOrderClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreatePurchaseOrderClient />
    </Suspense>
  );
}
