export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName?: string;
  roleColor?: string;
  department?: string;
  departmentColor?: string;
  status: string;
  isActive: boolean;
  avatarId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  hasCandidateAccess?: boolean;
  accessAreaColors?: Record<string, string>;
}

export interface UserFilters {
  searchText?: string;
  roleId?: string;
  status?: string;
  department?: string;
  showDeleted?: boolean;
}

export interface PaginatedUsersResult {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}
