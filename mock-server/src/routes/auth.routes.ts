import express from 'express';
import { validateBody, validators } from '../middleware/validation.middleware';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthProfile,
  ApiResponse
} from '../models';

const router = express.Router();

// Mock users for authentication (in real app this would be in database)
const mockAuthUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'giuseppe.verdi@noiintervistiamo.it',
    password: 'admin123', // In real app, this would be hashed
    firstName: 'Giuseppe',
    lastName: 'Verdi',
    role: 'admin' as const,
    availableRoles: ['ADMIN', 'HR', 'INTERVIEWER'],
    avatar: 'https://ui-avatars.com/api/?name=Giuseppe+Verdi&background=004d73&color=fff',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-15'),
    preferences: {
      language: 'it',
      timezone: 'Europe/Rome',
      notifications: {
        email: true,
        push: true,
        interview: true,
        evaluation: true
      }
    }
  },
  {
    id: '2',
    username: 'adminanna',
    email: 'anna.ferrari@noiintervistiamo.it',
    password: 'admin123',
    firstName: 'Anna',
    lastName: 'Ferrari',
    role: 'admin' as const,
    availableRoles: ['HR', 'INTERVIEWER'],
    avatar: 'https://ui-avatars.com/api/?name=Anna+Ferrari&background=0a8228&color=fff',
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdAt: new Date('2024-02-20'),
    preferences: {
      language: 'it',
      timezone: 'Europe/Rome',
      notifications: {
        email: true,
        push: false,
        interview: true,
        evaluation: false
      }
    }
  },
  {
    id: '3',
    username: 'hr',
    email: 'maria.rossi@noiintervistiamo.it',
    password: 'hr123',
    firstName: 'Maria',
    lastName: 'Rossi',
    role: 'hr' as const,
    availableRoles: ['HR'],
    avatar: 'https://ui-avatars.com/api/?name=Maria+Rossi&background=2c3e50&color=fff',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date('2024-01-25'),
    preferences: {
      language: 'it',
      timezone: 'Europe/Rome',
      notifications: {
        email: true,
        push: true,
        interview: true,
        evaluation: true
      }
    }
  },
  {
    id: '4',
    username: 'interviewer',
    email: 'marco.neri@noiintervistiamo.it',
    password: 'int123',
    firstName: 'Marco',
    lastName: 'Neri',
    role: 'interviewer' as const,
    availableRoles: ['INTERVIEWER'],
    avatar: 'https://ui-avatars.com/api/?name=Marco+Neri&background=e67e22&color=fff',
    lastLogin: new Date(Date.now() - 15 * 60 * 1000),
    createdAt: new Date('2024-03-10'),
    preferences: {
      language: 'it',
      timezone: 'Europe/Rome',
      notifications: {
        email: true,
        push: false,
        interview: true,
        evaluation: false
      }
    }
  }
];

// Mock tokens storage (in real app this would be in database/cache)
const mockTokens = new Map<string, { userId: string; expiresAt: Date }>();
const mockRefreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Helper function to generate mock tokens
function generateToken(): string {
  return 'mock_token_' + Math.random().toString(36).substr(2, 32);
}

// Helper function to generate refresh token
function generateRefreshToken(): string {
  return 'mock_refresh_' + Math.random().toString(36).substr(2, 32);
}

// POST /noi-intervistiamo/api/auth/login
router.post('/login', validateBody({
  username: [validators.required],
  password: [validators.required, (value) => validators.minLength(value, 6, 'password')]
}), (req, res) => {
  const { username, password, rememberMe }: LoginRequest = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Username e password sono obbligatori'
    });
  }

  const user = mockAuthUsers.find(u =>
    (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: 'INVALID_CREDENTIALS',
      message: 'Username o password non validi'
    });
  }

  // Generate tokens
  const token = generateToken();
  const refreshToken = generateRefreshToken();
  const expiresIn = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days if remember me, otherwise 24 hours

  // Store tokens
  mockTokens.set(token, {
    userId: user.id,
    expiresAt: new Date(Date.now() + expiresIn * 1000)
  });

  mockRefreshTokens.set(refreshToken, {
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Update last login
  user.lastLogin = new Date();

  const response: LoginResponse = {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar
    },
    availableRoles: user.availableRoles,
    token,
    refreshToken,
    expiresIn
  };

  res.json(response);
});

// POST /noi-intervistiamo/api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken }: RefreshTokenRequest = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Refresh token è obbligatorio'
    });
  }

  const tokenData = mockRefreshTokens.get(refreshToken);
  if (!tokenData || tokenData.expiresAt < new Date()) {
    return res.status(401).json({
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh token non valido o scaduto'
    });
  }

  // Generate new tokens
  const newToken = generateToken();
  const newRefreshToken = generateRefreshToken();
  const expiresIn = 24 * 60 * 60; // 24 hours

  // Remove old tokens
  mockRefreshTokens.delete(refreshToken);

  // Store new tokens
  mockTokens.set(newToken, {
    userId: tokenData.userId,
    expiresAt: new Date(Date.now() + expiresIn * 1000)
  });

  mockRefreshTokens.set(newRefreshToken, {
    userId: tokenData.userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  const response: RefreshTokenResponse = {
    token: newToken,
    refreshToken: newRefreshToken,
    expiresIn
  };

  res.json(response);
});

// POST /noi-intervistiamo/api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token && mockTokens.has(token)) {
    mockTokens.delete(token);
  }

  res.status(204).send();
});

// GET /noi-intervistiamo/api/auth/profile
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'MISSING_TOKEN',
      message: 'Token di autorizzazione è obbligatorio'
    });
  }

  const tokenData = mockTokens.get(token);
  if (!tokenData || tokenData.expiresAt < new Date()) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token non valido o scaduto'
    });
  }

  const user = mockAuthUsers.find(u => u.id === tokenData.userId);
  if (!user) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  const profile: AuthProfile = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatar,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    preferences: user.preferences
  };

  res.json(profile);
});

// PUT /noi-intervistiamo/api/auth/profile
router.put('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'MISSING_TOKEN',
      message: 'Token di autorizzazione è obbligatorio'
    });
  }

  const tokenData = mockTokens.get(token);
  if (!tokenData || tokenData.expiresAt < new Date()) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token non valido o scaduto'
    });
  }

  const user = mockAuthUsers.find(u => u.id === tokenData.userId);
  if (!user) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'Utente non trovato'
    });
  }

  // Update user profile (excluding sensitive fields)
  const { firstName, lastName, preferences } = req.body;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  const profile: AuthProfile = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatar: user.avatar,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    preferences: user.preferences
  };

  res.json(profile);
});

// POST /noi-intervistiamo/api/auth/change-password
router.post('/change-password', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'MISSING_TOKEN',
      message: 'Token di autorizzazione è obbligatorio'
    });
  }

  const tokenData = mockTokens.get(token);
  if (!tokenData || tokenData.expiresAt < new Date()) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token non valido o scaduto'
    });
  }

  const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Password attuale e nuova password sono obbligatorie'
    });
  }

  const user = mockAuthUsers.find(u => u.id === tokenData.userId);
  if (!user || user.password !== currentPassword) {
    return res.status(400).json({
      error: 'INVALID_CURRENT_PASSWORD',
      message: 'Password attuale non corretta'
    });
  }

  // Update password
  user.password = newPassword;

  res.status(204).send();
});

// POST /noi-intervistiamo/api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email }: ForgotPasswordRequest = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Email è obbligatoria'
    });
  }

  const user = mockAuthUsers.find(u => u.email === email);

  // In real app, we would send an email with reset token
  console.log(`Password reset requested for: ${email}${user ? ' (user exists)' : ' (user not found)'}`);

  // Always return success for security reasons (don't reveal if email exists)
  res.status(204).send();
});

// POST /noi-intervistiamo/api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, newPassword }: ResetPasswordRequest = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Token di reset e nuova password sono obbligatori'
    });
  }

  // Mock token validation (in real app this would be validated against database)
  if (!token.startsWith('reset_token_')) {
    return res.status(400).json({
      error: 'INVALID_RESET_TOKEN',
      message: 'Token di reset non valido o scaduto'
    });
  }

  // In a real app, we would find the user by the reset token and update their password
  res.status(204).send();
});

export { router as authRoutes };
