import axios from 'axios';
import type {
  Asset,
  AssetHistory,
  AssetListParams,
  AssetStatus,
  AuditLog,
  AuditLogListParams,
  Category,
  Department,
  DashboardReport,
  Employee,
  LicenseInstallation,
  LicenseListParams,
  MaintenanceListParams,
  MaintenanceRecord,
  NotificationConfig,
  NotificationListParams,
  Notification,
  PaginatedResponse,
  PurchaseOrder,
  PurchaseOrderListParams,
  ReportParams,
  SoftwareLicense,
  SystemConfig,
  User,
  Vendor,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request interceptor: attach JWT from localStorage ----
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---- Response interceptor: handle 401 ----
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============================================================
// Auth
// ============================================================
export const auth = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>('/api/auth/login', { email, password }),

  logout: () => apiClient.post('/api/auth/logout'),
};

// ============================================================
// Assets
// ============================================================
export const assets = {
  list: (params?: AssetListParams) =>
    apiClient.get<PaginatedResponse<Asset>>('/api/assets', { params }),

  get: (id: number | string) =>
    apiClient.get<Asset>(`/api/assets/${id}`),

  create: (data: Partial<Asset>) =>
    apiClient.post<Asset>('/api/assets', data),

  update: (id: number | string, data: Partial<Asset>) =>
    apiClient.put<Asset>(`/api/assets/${id}`, data),

  delete: (id: number | string) =>
    apiClient.delete(`/api/assets/${id}`),

  assign: (id: number | string, data: { employeeId: number; departmentId?: number; location?: string; notes?: string }) =>
    apiClient.post(`/api/assets/${id}/assign`, data),

  checkin: (id: number | string) =>
    apiClient.post(`/api/assets/${id}/checkin`),

  updateStatus: (id: number | string, status: AssetStatus, notes?: string) =>
    apiClient.put(`/api/assets/${id}/status`, { status, notes }),

  getHistory: (id: number | string) =>
    apiClient.get<AssetHistory[]>(`/api/assets/${id}/history`),
};

// ============================================================
// Employees
// ============================================================
export const employees = {
  list: (params?: { search?: string; departmentId?: number; isActive?: boolean; page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Employee>>('/api/employees', { params }),

  get: (id: number | string) =>
    apiClient.get<Employee>(`/api/employees/${id}`),

  create: (data: Partial<Employee>) =>
    apiClient.post<Employee>('/api/employees', data),

  update: (id: number | string, data: Partial<Employee>) =>
    apiClient.put<Employee>(`/api/employees/${id}`, data),

  deactivate: (id: number | string) =>
    apiClient.put(`/api/employees/${id}/deactivate`),
};

// ============================================================
// Departments
// ============================================================
export const departments = {
  list: () =>
    apiClient.get<Department[]>('/api/departments'),

  create: (data: Partial<Department>) =>
    apiClient.post<Department>('/api/departments', data),

  update: (id: number | string, data: Partial<Department>) =>
    apiClient.put<Department>(`/api/departments/${id}`, data),

  delete: (id: number | string) =>
    apiClient.delete(`/api/departments/${id}`),
};

// ============================================================
// Maintenance
// ============================================================
export const maintenance = {
  list: (params?: MaintenanceListParams) =>
    apiClient.get<PaginatedResponse<MaintenanceRecord>>('/api/maintenance', { params }),

  get: (id: number | string) =>
    apiClient.get<MaintenanceRecord>(`/api/maintenance/${id}`),

  create: (data: Partial<MaintenanceRecord>) =>
    apiClient.post<MaintenanceRecord>('/api/maintenance', data),

  complete: (id: number | string, data: { completedDate: string; actualCost?: number; resolutionNotes?: string }) =>
    apiClient.put(`/api/maintenance/${id}/complete`, data),

  upcoming: () =>
    apiClient.get<MaintenanceRecord[]>('/api/maintenance/upcoming'),
};

// ============================================================
// Software Licenses
// ============================================================
export const licenses = {
  list: (params?: LicenseListParams) =>
    apiClient.get<PaginatedResponse<SoftwareLicense>>('/api/licenses', { params }),

  compliance: () =>
    apiClient.get<SoftwareLicense[]>('/api/licenses/compliance'),

  create: (data: Partial<SoftwareLicense>) =>
    apiClient.post<SoftwareLicense>('/api/licenses', data),

  install: (id: number | string, assetId: number) =>
    apiClient.post<LicenseInstallation>(`/api/licenses/${id}/install`, { assetId }),

  uninstall: (id: number | string, installId: number | string) =>
    apiClient.delete(`/api/licenses/${id}/install/${installId}`),
};

// ============================================================
// Vendors
// ============================================================
export const vendors = {
  list: () =>
    apiClient.get<Vendor[]>('/api/vendors'),

  create: (data: Partial<Vendor>) =>
    apiClient.post<Vendor>('/api/vendors', data),

  update: (id: number | string, data: Partial<Vendor>) =>
    apiClient.put<Vendor>(`/api/vendors/${id}`, data),

  delete: (id: number | string) =>
    apiClient.delete(`/api/vendors/${id}`),
};

// ============================================================
// Purchase Orders
// ============================================================
export const purchaseOrders = {
  list: (params?: PurchaseOrderListParams) =>
    apiClient.get<PaginatedResponse<PurchaseOrder>>('/api/purchase-orders', { params }),

  get: (id: number | string) =>
    apiClient.get<PurchaseOrder>(`/api/purchase-orders/${id}`),

  create: (data: Partial<PurchaseOrder>) =>
    apiClient.post<PurchaseOrder>('/api/purchase-orders', data),

  receive: (id: number | string) =>
    apiClient.put(`/api/purchase-orders/${id}/receive`),
};

// ============================================================
// Notifications
// ============================================================
export const notifications = {
  list: (params?: NotificationListParams) =>
    apiClient.get<{ data: Notification[]; unreadCount?: number }>('/api/notifications', { params }),

  markRead: (id: number | string) =>
    apiClient.put(`/api/notifications/${id}/read`),
};

// ============================================================
// Reports
// ============================================================
export const reports = {
  dashboard: () =>
    apiClient.get<DashboardReport>('/api/reports/dashboard'),

  inventory: (format?: 'csv') =>
    apiClient.get('/api/reports/inventory', { params: { format }, responseType: format === 'csv' ? 'blob' : 'json' }),

  maintenance: (params?: ReportParams) =>
    apiClient.get('/api/reports/maintenance', { params, responseType: params?.format === 'csv' ? 'blob' : 'json' }),

  utilization: (params?: ReportParams) =>
    apiClient.get('/api/reports/utilization', { params, responseType: params?.format === 'csv' ? 'blob' : 'json' }),

  disposal: (format?: 'csv') =>
    apiClient.get('/api/reports/disposal', { params: { format }, responseType: format === 'csv' ? 'blob' : 'json' }),

  procurement: (params?: ReportParams) =>
    apiClient.get('/api/reports/procurement', { params, responseType: params?.format === 'csv' ? 'blob' : 'json' }),
};

// ============================================================
// Audit Logs
// ============================================================
export const auditLogs = {
  list: (params?: AuditLogListParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/api/audit-logs', { params }),
};

// ============================================================
// Admin
// ============================================================
export const admin = {
  // Users
  users: {
    list: () =>
      apiClient.get<User[]>('/api/admin/users'),
  },

  assignRole: (userId: number | string, roleId: number | string) =>
    apiClient.put(`/api/admin/users/${userId}/role`, { roleId }),

  // Categories
  categories: {
    list: () =>
      apiClient.get<Category[]>('/api/admin/categories'),

    create: (data: Partial<Category>) =>
      apiClient.post<Category>('/api/admin/categories', data),

    update: (id: number | string, data: Partial<Category>) =>
      apiClient.put<Category>(`/api/admin/categories/${id}`, data),

    delete: (id: number | string) =>
      apiClient.delete(`/api/admin/categories/${id}`),
  },

  // System config
  config: {
    get: () =>
      apiClient.get<SystemConfig>('/api/admin/config'),

    put: (data: Partial<SystemConfig>) =>
      apiClient.put('/api/admin/config', data),
  },

  // Notification config
  notificationConfig: {
    get: () =>
      apiClient.get<NotificationConfig>('/api/admin/notification-config'),

    put: (data: Partial<NotificationConfig>) =>
      apiClient.put('/api/admin/notification-config', data),
  },
};
