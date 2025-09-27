import express from 'express';
import {
  Notification,
  NotificationPreferences,
  NotificationStats,
  NotificationTemplate,
  BulkNotificationRequest,
  ApiResponse,
  PaginatedResponse
} from '../models';

const router = express.Router();

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'interview',
    priority: 'high',
    title: 'Colloquio in programma',
    message: 'Hai un colloquio con Sara Blu per la posizione Frontend Developer tra 1 ora',
    data: {
      candidateId: '1',
      interviewId: '1',
      actionUrl: '/interviews/1'
    },
    recipients: ['2'], // Giovanni Bianchi
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    sender: {
      id: 'system',
      name: 'Sistema',
      type: 'system'
    }
  },
  {
    id: '2',
    type: 'candidate',
    priority: 'medium',
    title: 'Nuovo candidato',
    message: 'È stato aggiunto un nuovo candidato: Luca Giallo per la posizione Backend Developer',
    data: {
      candidateId: '2',
      actionUrl: '/candidates/2'
    },
    recipients: ['1', '2'], // Admin and Giovanni
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    sender: {
      id: 'system',
      name: 'Sistema',
      type: 'system'
    }
  },
  {
    id: '3',
    type: 'evaluation',
    priority: 'medium',
    title: 'Valutazione completata',
    message: 'Marco Neri ha completato la valutazione per il candidato Roberto Viola',
    data: {
      candidateId: '4',
      interviewId: '4',
      userId: '4',
      actionUrl: '/interviews/4'
    },
    recipients: ['1'], // Admin
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    sender: {
      id: '4',
      name: 'Marco Neri',
      type: 'user'
    }
  },
  {
    id: '4',
    type: 'system',
    priority: 'low',
    title: 'Backup completato',
    message: 'Il backup automatico del sistema è stato completato con successo',
    data: {
      actionUrl: '/system/backup'
    },
    recipients: ['1'], // Admin only
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    readAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    sender: {
      id: 'system',
      name: 'Sistema',
      type: 'system'
    }
  },
  {
    id: '5',
    type: 'reminder',
    priority: 'medium',
    title: 'Promemoria valutazione',
    message: 'Ricordati di completare la valutazione per il colloquio di Anna Verde',
    data: {
      candidateId: '3',
      interviewId: '3',
      actionUrl: '/interviews/3'
    },
    recipients: ['2'], // Giovanni
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24 hours
    sender: {
      id: 'system',
      name: 'Sistema',
      type: 'system'
    }
  },
  {
    id: '6',
    type: 'announcement',
    priority: 'high',
    title: 'Nuova funzionalità disponibile',
    message: 'È ora possibile aggiungere note private ai candidati. Scopri di più nella sezione help.',
    data: {
      actionUrl: '/help/private-notes'
    },
    recipients: ['1', '2', '4'], // All users
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    sender: {
      id: '1',
      name: 'Mario Rossi',
      type: 'user'
    }
  }
];

// Mock notification preferences
const mockNotificationPreferences: NotificationPreferences[] = [
  {
    userId: '1',
    channels: {
      email: true,
      push: true,
      inApp: true
    },
    types: {
      interview: true,
      candidate: true,
      evaluation: true,
      system: true,
      reminder: true,
      announcement: true
    },
    frequency: 'immediate',
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    }
  },
  {
    userId: '2',
    channels: {
      email: true,
      push: false,
      inApp: true
    },
    types: {
      interview: true,
      candidate: true,
      evaluation: false,
      system: false,
      reminder: true,
      announcement: true
    },
    frequency: 'hourly',
    quietHours: {
      enabled: false,
      startTime: '23:00',
      endTime: '07:00'
    }
  }
];

// Mock notification templates
const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Interview Reminder',
    type: 'interview',
    subject: 'Reminder: Interview with {{candidateName}}',
    emailTemplate: 'Hello {{interviewerName}},\n\nThis is a reminder that you have an interview scheduled with {{candidateName}} for the {{position}} position at {{interviewTime}}.\n\nInterview details:\n- Candidate: {{candidateName}}\n- Position: {{position}}\n- Date: {{interviewDate}}\n- Time: {{interviewTime}}\n- Type: {{interviewType}}\n\nBest regards,\nNoi Intervistiamo Team',
    pushTemplate: 'Interview with {{candidateName}} starts in {{timeUntil}}',
    inAppTemplate: 'You have an interview with {{candidateName}} for {{position}} at {{interviewTime}}',
    variables: ['candidateName', 'interviewerName', 'position', 'interviewTime', 'interviewDate', 'interviewType', 'timeUntil'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: '2',
    name: 'New Candidate',
    type: 'candidate',
    subject: 'New Candidate: {{candidateName}} for {{position}}',
    emailTemplate: 'A new candidate has been added to the system:\n\n- Name: {{candidateName}}\n- Position: {{position}}\n- Source: {{source}}\n- Experience: {{experience}} years\n\nView candidate profile: {{candidateUrl}}',
    pushTemplate: 'New candidate: {{candidateName}} for {{position}}',
    inAppTemplate: 'New candidate {{candidateName}} applied for {{position}}',
    variables: ['candidateName', 'position', 'source', 'experience', 'candidateUrl'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

// Helper function to get notifications for a user
function getNotificationsForUser(userId: string): Notification[] {
  return mockNotifications.filter(notification =>
    notification.recipients.includes(userId)
  );
}

// Helper function to calculate notification stats for a user
function calculateNotificationStats(userId: string): NotificationStats {
  const userNotifications = getNotificationsForUser(userId);
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalNotifications: userNotifications.length,
    unreadNotifications: userNotifications.filter(n => !n.isRead).length,
    notificationsByType: {
      interview: userNotifications.filter(n => n.type === 'interview').length,
      candidate: userNotifications.filter(n => n.type === 'candidate').length,
      evaluation: userNotifications.filter(n => n.type === 'evaluation').length,
      system: userNotifications.filter(n => n.type === 'system').length,
      reminder: userNotifications.filter(n => n.type === 'reminder').length,
      announcement: userNotifications.filter(n => n.type === 'announcement').length
    },
    notificationsByPriority: {
      low: userNotifications.filter(n => n.priority === 'low').length,
      medium: userNotifications.filter(n => n.priority === 'medium').length,
      high: userNotifications.filter(n => n.priority === 'high').length,
      urgent: userNotifications.filter(n => n.priority === 'urgent').length
    },
    todayNotifications: userNotifications.filter(n =>
      n.createdAt.toDateString() === today.toDateString()
    ).length,
    weekNotifications: userNotifications.filter(n =>
      n.createdAt >= weekAgo
    ).length
  };
}

// GET /noi-intervistiamo/api/notifications
router.get('/', (req, res) => {
  // In real app, get user ID from auth token
  const userId = req.query.userId as string || '1';
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const type = req.query.type as string;
  const priority = req.query.priority as string;
  const isRead = req.query.isRead as string;

  let userNotifications = getNotificationsForUser(userId);

  // Apply filters
  if (type) {
    userNotifications = userNotifications.filter(n => n.type === type);
  }
  if (priority) {
    userNotifications = userNotifications.filter(n => n.priority === priority);
  }
  if (isRead !== undefined) {
    const readFilter = isRead === 'true';
    userNotifications = userNotifications.filter(n => n.isRead === readFilter);
  }

  // Sort by creation date (most recent first)
  userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

  const paginatedResponse: PaginatedResponse<Notification> = {
    items: paginatedNotifications,
    total: userNotifications.length,
    page,
    pageSize,
    totalPages: Math.ceil(userNotifications.length / pageSize)
  };

  res.json(paginatedResponse);
});

// GET /noi-intervistiamo/api/notifications/stats
router.get('/stats', (req, res) => {
  const userId = req.query.userId as string || '1';
  const stats = calculateNotificationStats(userId);

  res.json(stats);
});

// GET /noi-intervistiamo/api/notifications/unread-count
router.get('/unread-count', (req, res) => {
  const userId = req.query.userId as string || '1';
  const unreadCount = getNotificationsForUser(userId).filter(n => !n.isRead).length;

  res.json({ count: unreadCount });
});

// GET /noi-intervistiamo/api/notifications/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string || '1';

  const notification = mockNotifications.find(n =>
    n.id === id && n.recipients.includes(userId)
  );

  if (!notification) {
    return res.status(404).json({
      error: 'NOTIFICATION_NOT_FOUND',
      message: 'Notifica non trovata'
    });
  }

  res.json(notification);
});

// PUT /noi-intervistiamo/api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string || '1';

  const notification = mockNotifications.find(n =>
    n.id === id && n.recipients.includes(userId)
  );

  if (!notification) {
    return res.status(404).json({
      error: 'NOTIFICATION_NOT_FOUND',
      message: 'Notifica non trovata'
    });
  }

  notification.isRead = true;
  notification.readAt = new Date();

  res.json(notification);
});

// PUT /noi-intervistiamo/api/notifications/mark-all-read
router.put('/mark-all-read', (req, res) => {
  const userId = req.query.userId as string || '1';
  const userNotifications = getNotificationsForUser(userId);
  const now = new Date();

  let markedCount = 0;
  userNotifications.forEach(notification => {
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = now;
      markedCount++;
    }
  });

  res.json({ markedCount });
});

// POST /noi-intervistiamo/api/notifications
router.post('/', (req, res) => {
  const {
    type,
    priority = 'medium',
    title,
    message,
    recipients,
    data,
    expiresAt
  } = req.body;

  if (!type || !title || !message || !recipients || recipients.length === 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti: type, title, message, recipients'
    });
  }

  const newNotification: Notification = {
    id: (mockNotifications.length + 1).toString(),
    type,
    priority,
    title,
    message,
    data,
    recipients,
    isRead: false,
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    sender: {
      id: 'system', // In real app, get from auth token
      name: 'Sistema',
      type: 'system'
    }
  };

  mockNotifications.push(newNotification);

  res.status(201).json(newNotification);
});

// DELETE /noi-intervistiamo/api/notifications/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string || '1';

  const notificationIndex = mockNotifications.findIndex(n =>
    n.id === id && n.recipients.includes(userId)
  );

  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'NOTIFICATION_NOT_FOUND',
      message: 'Notifica non trovata'
    });
  }

  mockNotifications.splice(notificationIndex, 1);

  res.status(204).send();
});

// GET /noi-intervistiamo/api/notifications/preferences
router.get('/preferences', (req, res) => {
  const userId = req.query.userId as string || '1';
  const preferences = mockNotificationPreferences.find(p => p.userId === userId);

  if (!preferences) {
    // Return default preferences
    const defaultPreferences: NotificationPreferences = {
      userId,
      channels: {
        email: true,
        push: true,
        inApp: true
      },
      types: {
        interview: true,
        candidate: true,
        evaluation: true,
        system: true,
        reminder: true,
        announcement: true
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    };

    return res.json(defaultPreferences);
  }

  res.json(preferences);
});

// PUT /noi-intervistiamo/api/notifications/preferences
router.put('/preferences', (req, res) => {
  const userId = req.query.userId as string || '1';
  const existingIndex = mockNotificationPreferences.findIndex(p => p.userId === userId);

  const updatedPreferences: NotificationPreferences = {
    userId,
    ...req.body
  };

  if (existingIndex !== -1) {
    mockNotificationPreferences[existingIndex] = updatedPreferences;
  } else {
    mockNotificationPreferences.push(updatedPreferences);
  }

  res.json(updatedPreferences);
});

// GET /noi-intervistiamo/api/notifications/templates
router.get('/templates', (req, res) => {
  const type = req.query.type as string;
  let templates = [...mockNotificationTemplates];

  if (type) {
    templates = templates.filter(t => t.type === type);
  }

  res.json(templates);
});

export { router as notificationRoutes };