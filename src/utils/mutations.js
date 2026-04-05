// src/utils/mutations.js
// Centralized mutation helpers with automatic cache invalidation.
// Use these instead of raw fetch/axios calls for write operations.

import { queryCache } from './queryCache.js';

const API = process.env.NEXT_PUBLIC_API_URL;

async function apiCall(method, path, data) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include',
  };
  if (data && method !== 'GET') opts.body = JSON.stringify(data);
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const mutations = {

  async createPO(data) {
    const result = await apiCall('POST', '/api/purchase-orders', data);
    queryCache.invalidatePrefix('/api/purchase-orders');
    queryCache.invalidatePrefix('/api/dashboard');
    queryCache.invalidatePrefix('/api/budget');
    return result;
  },

  async updatePOStatus(poId, status, payload = {}) {
    const result = await apiCall('PATCH', `/api/purchase-orders/${poId}/status`, { status, ...payload });
    queryCache.invalidate(`/api/purchase-orders/${poId}`);
    queryCache.invalidatePrefix('/api/purchase-orders');
    queryCache.invalidatePrefix('/api/dashboard');
    queryCache.invalidatePrefix('/api/budget');
    return result;
  },

  async updateVendorStatus(vendorId, action, payload = {}) {
    const result = await apiCall('POST', `/api/vendors/${vendorId}/qualification/admin-action`, { action, ...payload });
    queryCache.invalidate(`/api/vendors/${vendorId}`);
    queryCache.invalidatePrefix('/api/vendors');
    queryCache.invalidatePrefix('/api/dashboard');
    queryCache.invalidatePrefix('/api/supplier-performance');
    return result;
  },

  async completeTask(taskId, progress) {
    const result = await apiCall('PATCH', `/api/tasks/${taskId}/status`, progress);
    queryCache.invalidatePrefix('/api/tasks');
    queryCache.invalidatePrefix('/api/dashboard');
    return result;
  },

  async updateIPCStatus(ipcId, status, payload = {}) {
    const result = await apiCall('PATCH', `/api/ipcs/${ipcId}/status`, { status, ...payload });
    queryCache.invalidatePrefix('/api/ipcs');
    queryCache.invalidatePrefix('/api/dashboard');
    queryCache.invalidatePrefix('/api/budget');
    return result;
  },

  async submittalStatusChange(submittalId, status, payload = {}) {
    const result = await apiCall('PATCH', `/api/submittals/${submittalId}/status`, { status, ...payload });
    queryCache.invalidate(`/api/submittals/${submittalId}`);
    queryCache.invalidatePrefix('/api/submittals');
    queryCache.invalidatePrefix('/api/dashboard');
    return result;
  },

  async createMaterial(formData) {
    // FormData — use fetch directly (no JSON body)
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const res = await fetch(`${API}/api/materials`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
    const result = await res.json();
    queryCache.invalidatePrefix('/api/materials');
    return result;
  },

  async addPriceEntry(data) {
    const result = await apiCall('POST', '/api/price-entries', data);
    queryCache.invalidatePrefix('/api/materials');
    queryCache.invalidatePrefix('/api/price-entries');
    return result;
  },
};
