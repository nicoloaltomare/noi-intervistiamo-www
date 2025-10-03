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
  status: 'Attivo' | 'Inattivo' | 'In attesa' | 'Sospeso';
  isActive: boolean;
  avatarId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  // Access areas
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  hasCandidateAccess?: boolean;
  // Area colors
  accessAreaColors?: Record<string, string>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    admin: number;
    hr: number;
    interviewer: number;
    candidate: number;
  };
}