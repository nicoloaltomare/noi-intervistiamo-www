export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  hasHRAccess: boolean;
  hasTechnicalAccess: boolean;
  hasAdminAccess: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface RoleFilters {
  searchText?: string;
  isActive?: boolean;
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  showDeleted?: boolean;
}

export interface PaginatedRolesResult {
  roles: Role[];
  total: number;
  totalPages: number;
  currentPage: number;
}