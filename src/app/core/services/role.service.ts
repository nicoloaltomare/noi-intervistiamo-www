import { Injectable, signal } from '@angular/core';
import { Role } from '../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roles = signal<Role[]>([
    {
      id: '1',
      name: 'Amministratore',
      description: 'Accesso completo al sistema',
      color: '#dc3545',
      isActive: true,
      hasHRAccess: true,
      hasTechnicalAccess: true,
      hasAdminAccess: true,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '2',
      name: 'HR Manager',
      description: 'Gestione completa delle risorse umane',
      color: '#17a2b8',
      isActive: true,
      hasHRAccess: true,
      hasTechnicalAccess: false,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '3',
      name: 'Tech Lead',
      description: 'Gestione interviste tecniche e team',
      color: '#007bff',
      isActive: true,
      hasHRAccess: false,
      hasTechnicalAccess: true,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '4',
      name: 'Senior Developer',
      description: 'Interviste tecniche avanzate',
      color: '#28a745',
      isActive: true,
      hasHRAccess: false,
      hasTechnicalAccess: true,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '5',
      name: 'HR Specialist',
      description: 'Screening iniziale e gestione candidati',
      color: '#6f42c1',
      isActive: true,
      hasHRAccess: true,
      hasTechnicalAccess: false,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '6',
      name: 'HR Recruiter',
      description: 'Ricerca e selezione candidati',
      color: '#fd7e14',
      isActive: true,
      hasHRAccess: true,
      hasTechnicalAccess: false,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '7',
      name: 'Frontend Developer',
      description: 'Interviste frontend e UI/UX',
      color: '#20c997',
      isActive: true,
      hasHRAccess: false,
      hasTechnicalAccess: true,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    },
    {
      id: '8',
      name: 'Candidato',
      description: 'Accesso limitato per candidati',
      color: '#ffc107',
      isActive: true,
      hasHRAccess: false,
      hasTechnicalAccess: false,
      hasAdminAccess: false,
      createdAt: new Date('2023-01-01T00:00:00'),
      updatedAt: new Date('2023-01-01T00:00:00')
    }
  ]);

  getAllRoles(): Role[] {
    return this.roles().filter(role => !role.deletedAt);
  }

  getActiveRoles(): Role[] {
    return this.roles().filter(role => role.isActive && !role.deletedAt);
  }

  getRoleById(id: string): Role | undefined {
    return this.roles().find(role => role.id === id);
  }
}