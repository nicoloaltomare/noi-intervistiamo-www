import { Injectable, signal } from '@angular/core';
import { User, UserStatus, UserRole, UserFilters, PaginatedUsersResult } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@noiintervistiamo.com',
      firstName: 'Mario',
      lastName: 'Rossi',
      role: UserRole.ADMIN,
      roleName: 'Amministratore',
      department: 'Amministrazione',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-15T09:30:00'),
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2024-01-15T09:30:00')
    },
    {
      id: '2',
      username: 'hr.manager',
      email: 'sara.bianchi@noiintervistiamo.com',
      firstName: 'Sara',
      lastName: 'Bianchi',
      role: UserRole.HR,
      roleName: 'HR Manager',
      department: 'Risorse Umane',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-14T14:20:00'),
      createdAt: new Date('2023-02-15T00:00:00'),
      updatedAt: new Date('2024-01-14T14:20:00')
    },
    {
      id: '3',
      username: 'tech.lead',
      email: 'luca.verdi@noiintervistiamo.com',
      firstName: 'Luca',
      lastName: 'Verdi',
      role: UserRole.INTERVIEWER,
      roleName: 'Tech Lead',
      department: 'Sviluppo Software',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-15T11:45:00'),
      createdAt: new Date('2023-03-10T00:00:00'),
      updatedAt: new Date('2024-01-15T11:45:00')
    },
    {
      id: '4',
      username: 'anna.neri',
      email: 'anna.neri@noiintervistiamo.com',
      firstName: 'Anna',
      lastName: 'Neri',
      role: UserRole.INTERVIEWER,
      roleName: 'Senior Developer',
      department: 'Sviluppo Software',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-13T16:30:00'),
      createdAt: new Date('2023-04-20T00:00:00'),
      updatedAt: new Date('2024-01-13T16:30:00')
    },
    {
      id: '5',
      username: 'giulio.blu',
      email: 'giulio.blu@noiintervistiamo.com',
      firstName: 'Giulio',
      lastName: 'Blu',
      role: UserRole.HR,
      roleName: 'HR Specialist',
      department: 'Risorse Umane',
      status: UserStatus.INACTIVE,
      isActive: false,
      avatarId: undefined,
      lastLogin: new Date('2023-12-20T10:15:00'),
      createdAt: new Date('2023-05-15T00:00:00'),
      updatedAt: new Date('2023-12-20T10:15:00')
    },
    {
      id: '6',
      username: 'marco.giallo',
      email: 'marco.giallo@noiintervistiamo.com',
      firstName: 'Marco',
      lastName: 'Giallo',
      role: UserRole.INTERVIEWER,
      roleName: 'Frontend Developer',
      department: 'Sviluppo Software',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-14T08:45:00'),
      createdAt: new Date('2023-06-01T00:00:00'),
      updatedAt: new Date('2024-01-14T08:45:00')
    },
    {
      id: '7',
      username: 'elena.viola',
      email: 'elena.viola@noiintervistiamo.com',
      firstName: 'Elena',
      lastName: 'Viola',
      role: UserRole.HR,
      roleName: 'HR Recruiter',
      department: 'Risorse Umane',
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-15T12:00:00'),
      createdAt: new Date('2023-07-10T00:00:00'),
      updatedAt: new Date('2024-01-15T12:00:00')
    },
    {
      id: '8',
      username: 'francesco.arancione',
      email: 'francesco.arancione@noiintervistiamo.com',
      firstName: 'Francesco',
      lastName: 'Arancione',
      role: UserRole.CANDIDATE,
      roleName: 'Candidato',
      department: undefined,
      status: UserStatus.ACTIVE,
      isActive: true,
      avatarId: undefined,
      lastLogin: new Date('2024-01-12T15:30:00'),
      createdAt: new Date('2024-01-10T00:00:00'),
      updatedAt: new Date('2024-01-12T15:30:00')
    },
    {
      id: '9',
      username: 'deleted.user',
      email: 'deleted@noiintervistiamo.com',
      firstName: 'Utente',
      lastName: 'Eliminato',
      role: UserRole.CANDIDATE,
      roleName: 'Candidato',
      department: undefined,
      status: UserStatus.INACTIVE,
      isActive: false,
      avatarId: undefined,
      lastLogin: new Date('2023-11-01T10:00:00'),
      createdAt: new Date('2023-10-01T00:00:00'),
      updatedAt: new Date('2023-11-15T00:00:00'),
      deletedAt: new Date('2023-11-15T00:00:00')
    }
  ]);

  getAllUsers(): User[] {
    return this.users();
  }

  getPaginatedUsers(
    page: number = 1,
    pageSize: number = 10,
    filters?: UserFilters
  ): PaginatedUsersResult {
    let filteredUsers = this.users();

    // Apply filters
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.username.toLowerCase().includes(search) ||
          (user.roleName && user.roleName.toLowerCase().includes(search))
        );
      }

      if (filters.roleId) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.roleId);
      }

      if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }

      if (filters.department) {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }

      if (!filters.showDeleted) {
        filteredUsers = filteredUsers.filter(user => !user.deletedAt);
      }
    } else {
      // Default: hide deleted users
      filteredUsers = filteredUsers.filter(user => !user.deletedAt);
    }

    const total = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const users = filteredUsers.slice(startIndex, endIndex);

    return {
      users,
      total,
      totalPages,
      currentPage: page
    };
  }

  getUserById(id: string): User | undefined {
    return this.users().find(user => user.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.update(users => [...users, newUser]);
    return newUser;
  }

  updateUser(id: string, userData: Partial<User>): User | null {
    const userIndex = this.users().findIndex(user => user.id === id);
    if (userIndex === -1) {
      return null;
    }

    const updatedUser = {
      ...this.users()[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    this.users.update(users => {
      const newUsers = [...users];
      newUsers[userIndex] = updatedUser;
      return newUsers;
    });

    return updatedUser;
  }

  deleteUser(id: string): boolean {
    const userIndex = this.users().findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.update(users => {
      const newUsers = [...users];
      newUsers[userIndex] = {
        ...newUsers[userIndex],
        deletedAt: new Date(),
        isActive: false,
        status: UserStatus.INACTIVE,
        updatedAt: new Date()
      };
      return newUsers;
    });

    return true;
  }

  toggleUserStatus(id: string): boolean {
    const userIndex = this.users().findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    const user = this.users()[userIndex];
    const newStatus = user.isActive ? UserStatus.INACTIVE : UserStatus.ACTIVE;

    this.users.update(users => {
      const newUsers = [...users];
      newUsers[userIndex] = {
        ...newUsers[userIndex],
        isActive: !user.isActive,
        status: newStatus,
        updatedAt: new Date()
      };
      return newUsers;
    });

    return true;
  }

  restoreUser(id: string): boolean {
    const userIndex = this.users().findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.update(users => {
      const newUsers = [...users];
      newUsers[userIndex] = {
        ...newUsers[userIndex],
        deletedAt: undefined,
        isActive: true,
        status: UserStatus.ACTIVE,
        updatedAt: new Date()
      };
      return newUsers;
    });

    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}