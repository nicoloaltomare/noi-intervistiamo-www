import express from 'express';
import { User, UserStats, ApiResponse, PaginatedResponse } from '../models';
import { roles } from './role.routes';
import { departments } from './department.routes';

const router = express.Router();

// Create role color map for quick lookup (using role code as key)
const roleColorMap: Record<string, string> = {};
roles.forEach(role => {
  roleColorMap[role.code] = role.color;
});

// Create department color map for quick lookup
const departmentColorMap: Record<string, string> = {};
departments.forEach(dept => {
  if (dept.color) {
    departmentColorMap[dept.name] = dept.color;
  }
});

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@noiintervistiamo.com',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: 'ADMIN',
    roleName: 'Amministratore',
    department: 'Amministrazione',
    status: 'Attivo',
    isActive: true,
    avatarId: 'https://i.pravatar.cc/150?img=12',
    lastLogin: new Date('2024-01-15T09:30:00'),
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2024-01-15T09:30:00'),
    hasHRAccess: true,
    hasTechnicalAccess: true,
    hasAdminAccess: true,
    hasCandidateAccess: true,
    accessAreaColors: {
      hasHRAccess: '#2563eb',
      hasTechnicalAccess: '#7c3aed',
      hasAdminAccess: '#dc2626',
      hasCandidateAccess: '#059669'
    }
  },
  {
    id: '2',
    username: 'hr.manager',
    email: 'sara.bianchi@noiintervistiamo.com',
    firstName: 'Sara',
    lastName: 'Bianchi',
    role: 'HR_MANAGER',
    roleName: 'HR Manager',
    department: 'Risorse Umane',
    status: 'Attivo',
    isActive: true,
    avatarId: 'https://i.pravatar.cc/150?img=47',
    lastLogin: new Date('2024-01-14T14:20:00'),
    createdAt: new Date('2023-02-15T00:00:00'),
    updatedAt: new Date('2024-01-14T14:20:00'),
    hasHRAccess: true,
    hasAdminAccess: true,
    accessAreaColors: {
      hasHRAccess: '#2563eb',
      hasAdminAccess: '#dc2626'
    }
  },
  {
    id: '3',
    username: 'tech.lead',
    email: 'luca.verdi@noiintervistiamo.com',
    firstName: 'Luca',
    lastName: 'Verdi',
    role: 'TECH_LEAD',
    roleName: 'Tech Lead',
    department: 'Sviluppo Software',
    status: 'Attivo',
    isActive: true,
    avatarId: undefined,
    lastLogin: new Date('2024-01-15T11:45:00'),
    createdAt: new Date('2023-03-10T00:00:00'),
    updatedAt: new Date('2024-01-15T11:45:00'),
    hasTechnicalAccess: true,
    accessAreaColors: {
      hasTechnicalAccess: '#7c3aed'
    }
  },
  {
    id: '4',
    username: 'anna.neri',
    email: 'anna.neri@noiintervistiamo.com',
    firstName: 'Anna',
    lastName: 'Neri',
    role: 'SENIOR_DEV',
    roleName: 'Senior Developer',
    department: 'Sviluppo Software',
    status: 'Attivo',
    isActive: true,
    avatarId: undefined,
    lastLogin: new Date('2024-01-13T16:30:00'),
    createdAt: new Date('2023-04-20T00:00:00'),
    updatedAt: new Date('2024-01-13T16:30:00'),
    hasTechnicalAccess: true,
    accessAreaColors: {
      hasTechnicalAccess: '#7c3aed'
    }
  },
  {
    id: '5',
    username: 'giulio.blu',
    email: 'giulio.blu@noiintervistiamo.com',
    firstName: 'Giulio',
    lastName: 'Blu',
    role: 'HR_SPECIALIST',
    roleName: 'HR Specialist',
    department: 'Risorse Umane',
    status: 'Inattivo',
    isActive: false,
    avatarId: undefined,
    lastLogin: new Date('2023-12-20T10:15:00'),
    createdAt: new Date('2023-05-15T00:00:00'),
    updatedAt: new Date('2023-12-20T10:15:00'),
    hasHRAccess: true,
    hasAdminAccess: true,
    accessAreaColors: {
      hasHRAccess: '#2563eb',
      hasAdminAccess: '#dc2626'
    }
  },
  {
    id: '6',
    username: 'marco.giallo',
    email: 'marco.giallo@noiintervistiamo.com',
    firstName: 'Marco',
    lastName: 'Giallo',
    role: 'FRONTEND_DEV',
    roleName: 'Frontend Developer',
    department: 'Sviluppo Software',
    status: 'Attivo',
    isActive: true,
    avatarId: undefined,
    lastLogin: new Date('2024-01-14T08:45:00'),
    createdAt: new Date('2023-06-01T00:00:00'),
    updatedAt: new Date('2024-01-14T08:45:00'),
    hasTechnicalAccess: true,
    accessAreaColors: {
      hasTechnicalAccess: '#7c3aed'
    }
  },
  {
    id: '7',
    username: 'elena.viola',
    email: 'elena.viola@noiintervistiamo.com',
    firstName: 'Elena',
    lastName: 'Viola',
    role: 'HR_RECRUITER',
    roleName: 'HR Recruiter',
    department: 'Risorse Umane',
    status: 'Attivo',
    isActive: true,
    avatarId: undefined,
    lastLogin: new Date('2024-01-15T12:00:00'),
    createdAt: new Date('2023-07-10T00:00:00'),
    updatedAt: new Date('2024-01-15T12:00:00'),
    hasHRAccess: true,
    hasAdminAccess: true,
    accessAreaColors: {
      hasHRAccess: '#2563eb',
      hasAdminAccess: '#dc2626'
    }
  },
  {
    id: '8',
    username: 'francesco.arancione',
    email: 'francesco.arancione@noiintervistiamo.com',
    firstName: 'Francesco',
    lastName: 'Arancione',
    role: 'CANDIDATE',
    roleName: 'Candidato',
    department: undefined,
    status: 'Attivo',
    isActive: true,
    avatarId: undefined,
    lastLogin: new Date('2024-01-12T15:30:00'),
    createdAt: new Date('2024-01-10T00:00:00'),
    updatedAt: new Date('2024-01-12T15:30:00'),
    hasCandidateAccess: true,
    accessAreaColors: {
      hasCandidateAccess: '#059669'
    }
  },
  {
    id: '9',
    username: 'deleted.user',
    email: 'deleted@noiintervistiamo.com',
    firstName: 'Utente',
    lastName: 'Eliminato',
    role: 'CANDIDATE',
    roleName: 'Candidato',
    department: undefined,
    status: 'Inattivo',
    isActive: false,
    avatarId: undefined,
    lastLogin: new Date('2023-11-01T10:00:00'),
    createdAt: new Date('2023-10-01T00:00:00'),
    updatedAt: new Date('2023-11-15T00:00:00'),
    deletedAt: new Date('2023-11-15T00:00:00'),
    hasCandidateAccess: true,
    accessAreaColors: {
      hasCandidateAccess: '#059669'
    }
  }
];

const mockUserStats: UserStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.status === 'Attivo').length,
  newUsersThisMonth: mockUsers.filter(u => {
    const thisMonth = new Date();
    return u.createdAt.getMonth() === thisMonth.getMonth() &&
           u.createdAt.getFullYear() === thisMonth.getFullYear();
  }).length,
  usersByRole: {
    admin: mockUsers.filter(u => u.role === 'ADMIN').length,
    hr: mockUsers.filter(u => u.role === 'HR').length,
    interviewer: mockUsers.filter(u => u.role === 'INTERVIEWER').length,
    candidate: mockUsers.filter(u => u.role === 'CANDIDATE').length
  }
};

// POST /noi-intervistiamo/api/users/search
router.post('/search', (req, res) => {
  const { page = 1, pageSize = 10, filters = {} } = req.body;
  const { role, status, search, department, showDeleted = false } = filters;

  let filteredUsers = [...mockUsers];

  // Apply filters
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  if (department) {
    filteredUsers = filteredUsers.filter(user => user.department === department);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchLower))
    );
  }
  if (!showDeleted) {
    filteredUsers = filteredUsers.filter(user => !user.deletedAt);
  }

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Add roleColor and departmentColor to each user
  const usersWithColors = paginatedUsers.map(user => ({
    ...user,
    roleColor: roleColorMap[user.role] || '#6c757d', // default gray if not found
    departmentColor: user.department ? departmentColorMap[user.department] || '#6c757d' : undefined
  }));

  res.json({
    users: usersWithColors,
    total: filteredUsers.length,
    currentPage: page,
    totalPages: Math.ceil(filteredUsers.length / pageSize)
  });
});

// GET /noi-intervistiamo/api/users/stats
router.get('/stats', (req, res) => {
  res.json(mockUserStats);
});

// GET /noi-intervistiamo/api/users/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  res.json(user);
});

// POST /noi-intervistiamo/api/users
router.post('/', (req, res) => {
  const { username, email, firstName, lastName, role, roleName, department } = req.body;

  // Validate required fields
  if (!username || !email || !firstName || !lastName || !role) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti'
    });
  }

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: 'USER_EXISTS',
      message: 'Utente con questo username o email esiste già'
    });
  }

  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    username,
    email,
    firstName,
    lastName,
    role,
    roleName,
    department,
    avatarId: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=004d73&color=fff`,
    status: 'Attivo',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: undefined
  };

  mockUsers.push(newUser);

  res.status(201).json(newUser);
});

// PUT /noi-intervistiamo/api/users/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  const updatedUser = {
    ...mockUsers[userIndex],
    ...req.body,
    updatedAt: new Date()
  };
  mockUsers[userIndex] = updatedUser;

  res.json(updatedUser);
});

// DELETE /noi-intervistiamo/api/users/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  // Soft delete
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    deletedAt: new Date(),
    isActive: false,
    status: 'Inattivo',
    updatedAt: new Date()
  };

  res.status(204).send();
});

// PATCH /noi-intervistiamo/api/users/:id/restore
router.patch('/:id/restore', (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    deletedAt: undefined,
    isActive: true,
    status: 'Attivo',
    updatedAt: new Date()
  };

  res.json(mockUsers[userIndex]);
});

// PATCH /noi-intervistiamo/api/users/:id/toggle-status
router.patch('/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  const user = mockUsers[userIndex];
  const newIsActive = !user.isActive;
  const newStatus = newIsActive ? 'Attivo' : 'Inattivo';

  mockUsers[userIndex] = {
    ...user,
    isActive: newIsActive,
    status: newStatus,
    updatedAt: new Date()
  };

  res.json(mockUsers[userIndex]);
});

export { router as userRoutes };