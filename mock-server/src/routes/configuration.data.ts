import { AccessArea, UserStatusConfig, ColorPalette } from '../models/configuration.model';

// Mock data for access areas
export const accessAreas: AccessArea[] = [
  { id: 'hasHRAccess', label: 'Area HR', icon: 'fas fa-users', color: '#2563eb', order: 1, isActive: true },
  { id: 'hasTechnicalAccess', label: 'Area Tecnica', icon: 'fas fa-code', color: '#7c3aed', order: 2, isActive: true },
  { id: 'hasAdminAccess', label: 'Area Admin', icon: 'fas fa-cog', color: '#dc2626', order: 3, isActive: true },
  { id: 'hasCandidateAccess', label: 'Area Candidato', icon: 'fas fa-user', color: '#059669', order: 4, isActive: true }
];

// Mock data for user statuses
export const userStatuses: UserStatusConfig[] = [
  { value: 'Attivo', label: 'Attivo', icon: 'fas fa-check-circle', color: '#10b981', order: 1, isActive: true },
  { value: 'Inattivo', label: 'Inattivo', icon: 'fas fa-times-circle', color: '#ef4444', order: 2, isActive: true },
  { value: 'In attesa', label: 'In attesa', icon: 'fas fa-clock', color: '#f59e0b', order: 3, isActive: true },
  { value: 'Sospeso', label: 'Sospeso', icon: 'fas fa-ban', color: '#6b7280', order: 4, isActive: true }
];

// Mock data for color palettes
export const colorPalettes: ColorPalette[] = [
  {
    id: 'default',
    name: 'Default Palette',
    colors: [
      '#2563eb', // Blue
      '#7c3aed', // Purple
      '#dc2626', // Red
      '#059669', // Green
      '#ea580c', // Orange
      '#0891b2', // Cyan
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#eab308', // Yellow
      '#64748b'  // Slate
    ],
    isDefault: true,
    isActive: true
  }
];
