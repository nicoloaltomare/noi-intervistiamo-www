export interface DashboardStats {
  totalUsers: string;
  activeInterviews: string;
  pendingEvaluations: string;
  systemAlerts: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface DashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'doughnut' | 'area';
  data: ChartData;
  period: 'week' | 'month' | 'year';
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface DashboardOverview {
  stats: DashboardStats;
  charts: DashboardChart[];
  alerts: SystemAlert[];
  recentActivity: {
    id: string;
    type: 'interview' | 'user' | 'evaluation';
    description: string;
    timestamp: Date;
    user: string;
  }[];
}