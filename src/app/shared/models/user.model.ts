export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName?: string;
  department?: string;
  status: UserStatus;
  isActive: boolean;
  avatarId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  INTERVIEWER = 'INTERVIEWER',
  CANDIDATE = 'CANDIDATE'
}

export const AVAILABLE_ROLES = Object.values(UserRole);

export const AVAILABLE_DEPARTMENTS = [
  'Sviluppo Software',
  'Risorse Umane',
  'Marketing',
  'Vendite',
  'Amministrazione',
  'IT',
  'Prodotto',
  'Customer Success'
];

export interface UserFilters {
  searchText?: string;
  roleId?: string;
  status?: UserStatus;
  department?: string;
  showDeleted?: boolean;
}

export interface PaginatedUsersResult {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}