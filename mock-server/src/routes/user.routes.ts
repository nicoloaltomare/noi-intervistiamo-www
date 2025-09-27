import express from 'express';
import { User, UserStats, ApiResponse, PaginatedResponse } from '../models';

const router = express.Router();

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@noiintervistiamo.it',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=004d73&color=fff',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    username: 'giovanni.bianchi',
    email: 'giovanni.bianchi@noiintervistiamo.it',
    firstName: 'Giovanni',
    lastName: 'Bianchi',
    role: 'interviewer',
    avatar: 'https://ui-avatars.com/api/?name=Giovanni+Bianchi&background=0a8228&color=fff',
    status: 'active',
    createdAt: new Date('2024-02-20'),
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '3',
    username: 'laura.verdi',
    email: 'laura.verdi@example.com',
    firstName: 'Laura',
    lastName: 'Verdi',
    role: 'user',
    status: 'pending',
    createdAt: new Date('2024-03-10'),
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: '4',
    username: 'marco.neri',
    email: 'marco.neri@noiintervistiamo.it',
    firstName: 'Marco',
    lastName: 'Neri',
    role: 'interviewer',
    avatar: 'https://ui-avatars.com/api/?name=Marco+Neri&background=2c3e50&color=fff',
    status: 'active',
    createdAt: new Date('2024-01-25'),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000)
  }
];

const mockUserStats: UserStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.status === 'active').length,
  newUsersThisMonth: mockUsers.filter(u => {
    const thisMonth = new Date();
    return u.createdAt.getMonth() === thisMonth.getMonth() &&
           u.createdAt.getFullYear() === thisMonth.getFullYear();
  }).length,
  usersByRole: {
    admin: mockUsers.filter(u => u.role === 'admin').length,
    user: mockUsers.filter(u => u.role === 'user').length,
    interviewer: mockUsers.filter(u => u.role === 'interviewer').length
  }
};

// GET /noi-intervistiamo/api/users
router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  let filteredUsers = [...mockUsers];

  // Apply filters
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const paginatedResponse: PaginatedResponse<User> = {
    items: paginatedUsers,
    total: filteredUsers.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredUsers.length / pageSize)
  };

  res.json(paginatedResponse);
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
  const { username, email, firstName, lastName, role } = req.body;

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
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=004d73&color=fff`,
    status: 'active',
    createdAt: new Date(),
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

  const updatedUser = { ...mockUsers[userIndex], ...req.body };
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

  mockUsers.splice(userIndex, 1);

  res.status(204).send();
});

export { router as userRoutes };