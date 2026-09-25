import { API_CONFIG } from '@/config/api';
import { EmployeeUser, StoredAccount } from '@/context/auth-context';
import { DocumentReaderItem } from '@/components/document-reader';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  offline?: boolean;
  data?: T;
  [key: string]: any;
}

// Timeout fetch wrapper
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Helper for HTTP requests
async function request<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetchWithTimeout(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        error: data.message || `Request failed with status ${res.status}`,
        ...data,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (err: any) {
    // Backend unreachable or network error
    return {
      success: false,
      offline: true,
      error: 'Backend is currently offline or unreachable',
      message: 'Backend is currently offline or unreachable',
    };
  }
}

// Check backend health
export async function apiCheckHealth(): Promise<boolean> {
  try {
    const res = await request('/api/health');
    return res.success && res.database === 'connected';
  } catch {
    return false;
  }
}

// Auth API Calls
export async function apiLogin(email: string, password?: string): Promise<ApiResponse<{ user: EmployeeUser; token: string }>> {
  return request('/api/auth/login', 'POST', { email, password });
}

export async function apiRegister(accountData: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role?: string;
  department?: string;
}): Promise<ApiResponse<{ user: EmployeeUser; token: string }>> {
  return request('/api/auth/register', 'POST', accountData);
}

export async function apiFetchUsers(): Promise<ApiResponse<{ users: StoredAccount[] }>> {
  return request('/api/auth/users', 'GET');
}

export async function apiApproveUser(email: string): Promise<ApiResponse> {
  return request(`/api/auth/users/${encodeURIComponent(email)}/approve`, 'PUT');
}

export async function apiRejectUser(email: string): Promise<ApiResponse> {
  return request(`/api/auth/users/${encodeURIComponent(email)}/reject`, 'PUT');
}

export async function apiDeleteUser(email: string): Promise<ApiResponse> {
  return request(`/api/auth/users/${encodeURIComponent(email)}`, 'DELETE');
}

export async function apiUpdateProfile(data: Partial<EmployeeUser>, newPassword?: string): Promise<ApiResponse<{ user: EmployeeUser }>> {
  return request('/api/auth/profile', 'PUT', { ...data, newPassword });
}

// Documents API Calls
export async function apiFetchDocuments(email?: string): Promise<ApiResponse<{ documents: DocumentReaderItem[] }>> {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  return request(`/api/documents${query}`, 'GET');
}

export async function apiCreateDocument(doc: DocumentReaderItem): Promise<ApiResponse<{ document: DocumentReaderItem }>> {
  return request('/api/documents', 'POST', doc);
}

export async function apiDeleteDocument(id: string): Promise<ApiResponse> {
  return request(`/api/documents/${encodeURIComponent(id)}`, 'DELETE');
}

export interface DocumentStatsData {
  totalDocuments: number;
  countsByType: {
    article: number;
    pdf: number;
    docx: number;
    image: number;
    video: number;
    link: number;
    other: number;
  };
  signedCount: number;
  unsignedCount: number;
  signedPercentage: number;
  activeStaffCount: number;
  pendingStaffCount: number;
  recentDocuments?: Partial<DocumentReaderItem>[];
}

export async function apiFetchDocumentStats(): Promise<ApiResponse<{ stats: DocumentStatsData }>> {
  return request('/api/documents/stats', 'GET');
}
