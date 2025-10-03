export interface Department {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface DepartmentFilters {
  searchText?: string;
  isActive?: boolean;
  showDeleted?: boolean;
}

export interface PaginatedDepartmentsResult {
  departments: Department[];
  total: number;
  totalPages: number;
  currentPage: number;
}
