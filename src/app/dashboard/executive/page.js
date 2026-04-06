"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard'); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: '#B8960A' }}></div>
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
