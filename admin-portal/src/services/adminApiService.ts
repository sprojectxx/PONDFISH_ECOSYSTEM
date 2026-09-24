import { getAdminApiBaseUrl } from '../config/apiConfig';
import { AdminAuthStorageService } from './authStorage';

export async function adminApiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = AdminAuthStorageService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getAdminApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    AdminAuthStorageService.clearToken();
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || data.message || `Request failed (${response.status})`);
  }

  return data.data;
}

export function buildBookingSearchQueryUrl(search?: string, status?: string): string {
  let query = '/admin/bookings?';
  const params: string[] = [];
  if (search && search.trim().length > 0) {
    params.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (status && status.trim().length > 0) {
    params.push(`status=${encodeURIComponent(status.trim())}`);
  }
  return query + params.join('&');
}

export async function receiveInventoryBatch(payload: { fishId: string; batchCode: string; receivedQty: number; expiryHours?: number }) {
  return adminApiFetch('/admin/inventory/receive', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createWorkerAccount(payload: { name: string; email: string; password: string }) {
  return adminApiFetch('/admin/workers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
