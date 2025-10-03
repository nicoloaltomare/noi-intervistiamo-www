import express from 'express';
import { Role, RoleFilters, PaginatedRolesResult } from '../models';

const router = express.Router();

// Mock roles data
export const roles: Role[] = [
  {
    id: '1',
    name: 'Amministratore',
    code: 'ADMIN',
    description: 'Accesso completo al sistema',
    color: '#dc3545',
    permissions: ['all'],
    isActive: true,
    isSystem: true,
    hasHRAccess: true,
    hasTechnicalAccess: true,
    hasAdminAccess: true,
    hasCandidateAccess: false,
    userCount: 3,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '2',
    name: 'HR Manager',
    code: 'HR_MANAGER',
    description: 'Gestione completa delle risorse umane',
    color: '#17a2b8',
    permissions: ['hr.manage', 'candidates.view', 'candidates.edit', 'interviews.schedule'],
    isActive: true,
    isSystem: false,
    hasHRAccess: true,
    hasTechnicalAccess: false,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 5,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '3',
    name: 'Tech Lead',
    code: 'TECH_LEAD',
    description: 'Gestione interviste tecniche e team',
    color: '#007bff',
    permissions: ['interviews.conduct', 'interviews.evaluate', 'candidates.view', 'team.manage'],
    isActive: true,
    isSystem: false,
    hasHRAccess: false,
    hasTechnicalAccess: true,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 8,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '4',
    name: 'Senior Developer',
    code: 'SENIOR_DEV',
    description: 'Interviste tecniche avanzate',
    color: '#28a745',
    permissions: ['interviews.conduct', 'interviews.evaluate', 'candidates.view'],
    isActive: true,
    isSystem: false,
    hasHRAccess: false,
    hasTechnicalAccess: true,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 12,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '5',
    name: 'HR Specialist',
    code: 'HR_SPECIALIST',
    description: 'Screening iniziale e gestione candidati',
    color: '#6f42c1',
    permissions: ['candidates.view', 'candidates.edit', 'interviews.schedule'],
    isActive: true,
    isSystem: false,
    hasHRAccess: true,
    hasTechnicalAccess: false,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 7,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '6',
    name: 'HR Recruiter',
    code: 'HR_RECRUITER',
    description: 'Ricerca e selezione candidati',
    color: '#fd7e14',
    permissions: ['candidates.view', 'candidates.create', 'interviews.schedule'],
    isActive: true,
    isSystem: false,
    hasHRAccess: true,
    hasTechnicalAccess: false,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 4,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '7',
    name: 'Frontend Developer',
    code: 'FRONTEND_DEV',
    description: 'Interviste frontend e UI/UX',
    color: '#20c997',
    permissions: ['interviews.conduct', 'candidates.view'],
    isActive: true,
    isSystem: false,
    hasHRAccess: false,
    hasTechnicalAccess: true,
    hasAdminAccess: false,
    hasCandidateAccess: false,
    userCount: 15,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '8',
    name: 'Candidato',
    code: 'CANDIDATE',
    description: 'Accesso limitato per candidati',
    color: '#ffc107',
    permissions: ['profile.view', 'profile.edit'],
    isActive: true,
    isSystem: true,
    hasHRAccess: false,
    hasTechnicalAccess: false,
    hasAdminAccess: false,
    hasCandidateAccess: true,
    userCount: 142,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  }
];

// GET /noi-intervistiamo/api/roles
router.get('/', (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const showDeleted = req.query.showDeleted === 'true';

  let allRoles = [...roles];

  if (!showDeleted) {
    allRoles = allRoles.filter(role => !role.deletedAt);
  }

  if (activeOnly) {
    allRoles = allRoles.filter(role => role.isActive);
  }

  res.json(allRoles);
});

// POST /noi-intervistiamo/api/roles/search
router.post('/search', (req, res) => {
  const { page = 1, pageSize = 10, filters = {} } = req.body;
  const {
    searchText,
    isActive,
    hasHRAccess,
    hasTechnicalAccess,
    hasAdminAccess,
    hasCandidateAccess,
    showDeleted = false
  } = filters;

  let filteredRoles = [...roles];

  // Apply filters
  if (searchText) {
    const search = searchText.toLowerCase();
    filteredRoles = filteredRoles.filter(role =>
      role.name.toLowerCase().includes(search) ||
      (role.description && role.description.toLowerCase().includes(search))
    );
  }

  if (isActive !== undefined) {
    filteredRoles = filteredRoles.filter(role => role.isActive === isActive);
  }

  if (hasHRAccess !== undefined) {
    filteredRoles = filteredRoles.filter(role => role.hasHRAccess === hasHRAccess);
  }

  if (hasTechnicalAccess !== undefined) {
    filteredRoles = filteredRoles.filter(role => role.hasTechnicalAccess === hasTechnicalAccess);
  }

  if (hasAdminAccess !== undefined) {
    filteredRoles = filteredRoles.filter(role => role.hasAdminAccess === hasAdminAccess);
  }

  if (hasCandidateAccess !== undefined) {
    filteredRoles = filteredRoles.filter(role => role.hasCandidateAccess === hasCandidateAccess);
  }

  if (!showDeleted) {
    filteredRoles = filteredRoles.filter(role => !role.deletedAt);
  }

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

  res.json({
    roles: paginatedRoles,
    total: filteredRoles.length,
    currentPage: page,
    totalPages: Math.ceil(filteredRoles.length / pageSize)
  });
});

// GET /noi-intervistiamo/api/roles/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const role = roles.find(r => r.id === id);

  if (!role) {
    return res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Ruolo non trovato'
    });
  }

  res.json(role);
});

// POST /noi-intervistiamo/api/roles
router.post('/', (req, res) => {
  const { name, code, description, color, permissions, hasHRAccess, hasTechnicalAccess, hasAdminAccess, hasCandidateAccess } = req.body;

  // Validate required fields
  if (!name || !code || !color) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti'
    });
  }

  // Check if role name already exists
  const existingRole = roles.find(r => r.name === name);
  if (existingRole) {
    return res.status(409).json({
      error: 'ROLE_EXISTS',
      message: 'Ruolo con questo nome esiste già'
    });
  }

  const newRole: Role = {
    id: (roles.length + 1).toString(),
    name,
    code,
    description,
    color,
    permissions: permissions || [],
    isActive: true,
    isSystem: false,
    userCount: 0,
    hasHRAccess: hasHRAccess || false,
    hasTechnicalAccess: hasTechnicalAccess || false,
    hasAdminAccess: hasAdminAccess || false,
    hasCandidateAccess: hasCandidateAccess || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  roles.push(newRole);

  res.status(201).json(newRole);
});

// PUT /noi-intervistiamo/api/roles/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const roleIndex = roles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Ruolo non trovato'
    });
  }

  const updatedRole = {
    ...roles[roleIndex],
    ...req.body,
    updatedAt: new Date()
  };
  roles[roleIndex] = updatedRole;

  res.json(updatedRole);
});

// DELETE /noi-intervistiamo/api/roles/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const roleIndex = roles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Ruolo non trovato'
    });
  }

  const role = roles[roleIndex];
  if (role.isSystem) {
    return res.status(400).json({
      error: 'SYSTEM_ROLE',
      message: 'Non è possibile eliminare un ruolo di sistema'
    });
  }

  // Soft delete
  roles[roleIndex] = {
    ...roles[roleIndex],
    deletedAt: new Date(),
    isActive: false,
    updatedAt: new Date()
  };

  res.status(204).send();
});

// PATCH /noi-intervistiamo/api/roles/:id/restore
router.patch('/:id/restore', (req, res) => {
  const { id } = req.params;
  const roleIndex = roles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Ruolo non trovato'
    });
  }

  roles[roleIndex] = {
    ...roles[roleIndex],
    deletedAt: undefined,
    isActive: true,
    updatedAt: new Date()
  };

  res.json(roles[roleIndex]);
});

// PATCH /noi-intervistiamo/api/roles/:id/toggle-status
router.patch('/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const roleIndex = roles.findIndex(r => r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({
      error: 'ROLE_NOT_FOUND',
      message: 'Ruolo non trovato'
    });
  }

  const role = roles[roleIndex];
  roles[roleIndex] = {
    ...role,
    isActive: !role.isActive,
    updatedAt: new Date()
  };

  res.json(roles[roleIndex]);
});

export { router as roleRoutes };
