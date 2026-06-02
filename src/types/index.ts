// ============================================================
// Shared TypeScript types for the ITAM frontend
// ============================================================

export type Role = 'Administrator' | 'IT Staff' | 'Read-Only User';

export interface User {
  id: number;
  email: string;
  roleId: number;
  roleName: Role;
  firstName?: string;
  lastName?: string;
}

export type AssetStatus =
  | 'Available'
  | 'Assigned'
  | 'Under Maintenance'
  | 'Lost'
  | 'Retired'
  | 'Disposed';

export interface Asset {
  id: number;
  assetId: string;
  name: string;
  categoryId?: number;
  categoryName?: string;
  assetType: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  status: AssetStatus;
  departmentId?: number;
  departmentName?: string;
  location?: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetHistory {
  id: number;
  assetId: number;
  employeeId?: number;
  employeeName?: string;
  departmentId?: number;
  departmentName?: string;
  location?: string;
  assignedDate?: string;
  returnDate?: string;
  assignedByUserId?: number;
  notes?: string;
}

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  jobTitle: string;
  managerId?: number;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type MaintenanceStatus = 'Requested' | 'In Progress' | 'Completed' | 'Cancelled';

export interface MaintenanceRecord {
  id: number;
  assetId: number;
  assetName?: string;
  issueDescription: string;
  status: MaintenanceStatus;
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  vendorId?: number;
  vendorName?: string;
  estimatedCost?: number;
  actualCost?: number;
  resolutionNotes?: string;
  createdByUserId?: number;
  createdAt: string;
}

export interface SoftwareLicense {
  id: number;
  softwareName: string;
  vendor: string;
  licenseKey: string;
  licenseType: string;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  purchaseDate: string;
  expiryDate: string;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export interface LicenseInstallation {
  id: number;
  licenseId: number;
  assetId: number;
  assetName?: string;
  installedDate: string;
  installedByUserId?: number;
}

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export type PurchaseOrderStatus = 'Pending' | 'Approved' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
  id: number;
  vendorId: number;
  vendorName?: string;
  itemType: 'Asset' | 'License';
  itemDescription: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderDate: string;
  invoiceReference?: string;
  status: PurchaseOrderStatus;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  entityType: string;
  entityId: string;
  action: string;
  actingUserId: number;
  actingUserEmail?: string;
  changedFields?: Record<string, unknown>;
  timestamp: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  lowInventoryThreshold?: number;
  isActive: boolean;
}

export interface SystemConfig {
  assetReturnPeriodDays: number;
  lowInventoryThresholds: Record<string, number>;
}

export interface NotificationConfig {
  warrantyExpiry: boolean;
  licenseExpiry: boolean;
  maintenanceReminders: boolean;
  assetReturnReminders: boolean;
  lowInventory: boolean;
}

// ---- Report types ----
export interface DashboardReport {
  totalAssets: number;
  byStatus: Record<string, number>;
  byDepartment: Array<{ department: string; count: number }>;
  warrantyExpiringSoon: number;
  licensesExpiringSoon: number;
  monthlyMaintenanceCost: number;
}

export interface InventoryReportRow {
  assetId: string;
  name: string;
  status: string;
  assignedEmployee?: string;
  department?: string;
  location?: string;
  warrantyExpiry?: string;
}

export interface MaintenanceReportRow {
  assetName: string;
  vendor?: string;
  cost?: number;
  resolution?: string;
  completedDate?: string;
}

export interface UtilizationReportRow {
  assetId: string;
  assetName: string;
  utilizationPercent: number;
}

export interface DisposalReportRow {
  assetId: string;
  name: string;
  status: string;
  disposalDate?: string;
  reason?: string;
}

export interface ProcurementReportRow {
  orderDate: string;
  vendor: string;
  itemDescription: string;
  quantity: number;
  totalCost: number;
  status: string;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ---- API query params ----
export interface AssetListParams {
  search?: string;
  status?: string;
  departmentId?: number;
  categoryId?: number;
  assetType?: string;
  page?: number;
  pageSize?: number;
}

export interface MaintenanceListParams {
  status?: string;
  assetId?: number;
  page?: number;
  pageSize?: number;
}

export interface LicenseListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PurchaseOrderListParams {
  status?: string;
  vendorId?: number;
  page?: number;
  pageSize?: number;
}

export interface NotificationListParams {
  isRead?: boolean;
  limit?: number;
  page?: number;
}

export interface AuditLogListParams {
  entityType?: string;
  entityId?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  vendorId?: number;
  categoryId?: number;
  format?: 'json' | 'csv';
}
