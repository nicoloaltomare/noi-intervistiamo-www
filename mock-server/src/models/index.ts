export * from './user.model';
export * from './interview.model';
export * from './dashboard.model';
export * from './auth.model';
export * from './candidate.model';
export * from './notification.model';
export * from './file.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}