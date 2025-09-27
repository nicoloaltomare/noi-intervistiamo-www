export interface Notification {
  id: string;
  type: 'interview' | 'candidate' | 'evaluation' | 'system' | 'reminder' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: {
    candidateId?: string;
    interviewId?: string;
    userId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  recipients: string[]; // User IDs
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  sender?: {
    id: string;
    name: string;
    type: 'user' | 'system';
  };
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  types: {
    interview: boolean;
    candidate: boolean;
    evaluation: boolean;
    system: boolean;
    reminder: boolean;
    announcement: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: {
    interview: number;
    candidate: number;
    evaluation: number;
    system: number;
    reminder: number;
    announcement: number;
  };
  notificationsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  todayNotifications: number;
  weekNotifications: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  subject: string;
  emailTemplate: string;
  pushTemplate: string;
  inAppTemplate: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkNotificationRequest {
  recipients: string[]; // User IDs or 'all' for all users
  type: Notification['type'];
  priority: Notification['priority'];
  title: string;
  message: string;
  data?: any;
  channels: ('email' | 'push' | 'inApp')[];
  scheduleAt?: Date;
  expiresAt?: Date;
}