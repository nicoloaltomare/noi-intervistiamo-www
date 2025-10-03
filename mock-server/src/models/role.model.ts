export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  hasHRAccess: boolean;
  hasTechnicalAccess: boolean;
  hasAdminAccess: boolean;
  hasCandidateAccess: boolean;
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface RoleFilters {
  searchText?: string;
  isActive?: boolean;
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  hasCandidateAccess?: boolean;
  showDeleted?: boolean;
}

export interface PaginatedRolesResult {
  roles: Role[];
  total: number;
  totalPages: number;
  currentPage: number;
}
