export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  managerName?: string;
  managerId?: string;
  employeeCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface DepartmentFilters {
  searchText?: string;
  status?: boolean;
  showDeleted?: boolean;
}

export interface PaginatedDepartmentsResult {
  departments: Department[];
  total: number;
  totalPages: number;
  currentPage: number;
}