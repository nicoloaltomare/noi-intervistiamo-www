import express from 'express';
import { DashboardOverview, DashboardStats, DashboardChart, SystemAlert, ApiResponse } from '../models';

const router = express.Router();

// Mock data
const mockStats: DashboardStats = {
  totalUsers: '156',
  activeInterviews: '23',
  pendingEvaluations: '8',
  systemAlerts: '2'
};

const mockCharts: DashboardChart[] = [
  {
    id: 'interviews-monthly',
    title: 'Colloqui Mensili',
    type: 'line',
    period: 'month',
    data: {
      labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
      datasets: [{
        label: 'Colloqui Completati',
        data: [12, 19, 8, 15, 22, 13],
        borderColor: '#004d73',
        fill: false
      }]
    }
  },
  {
    id: 'evaluations-status',
    title: 'Stato Valutazioni',
    type: 'doughnut',
    period: 'week',
    data: {
      labels: ['Completate', 'In Corso', 'In Attesa'],
      datasets: [{
        label: 'Valutazioni',
        data: [45, 25, 30],
        backgroundColor: ['#0a8228', '#004d73', '#ffc107']
      }]
    }
  },
  {
    id: 'candidate-flow',
    title: 'Flusso Candidati',
    type: 'bar',
    period: 'month',
    data: {
      labels: ['Screening', 'Tecnico', 'HR', 'Finale'],
      datasets: [{
        label: 'Candidati',
        data: [85, 65, 45, 28],
        backgroundColor: ['#004d73']
      }]
    }
  }
];

const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Server Backup',
    message: 'Il backup automatico è stato completato con alcuni avvisi',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false
  },
  {
    id: '2',
    type: 'info',
    title: 'Aggiornamento Sistema',
    message: 'Nuovo aggiornamento disponibile per il sistema di valutazione',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: false
  }
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'interview' as const,
    description: 'Colloquio tecnico completato per Mario Rossi',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    user: 'Giovanni Bianchi'
  },
  {
    id: '2',
    type: 'evaluation' as const,
    description: 'Valutazione finale inviata per Laura Verdi',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    user: 'Marco Neri'
  },
  {
    id: '3',
    type: 'user' as const,
    description: 'Nuovo utente registrato: Sara Blu',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: 'Sistema'
  }
];

// GET /noi-intervistiamo/api/dashboard/overview
router.get('/overview', (req, res) => {
  const data = {
    stats: mockStats,
    charts: mockCharts,
    alerts: mockAlerts,
    recentActivity: mockRecentActivity
  };

  res.json(data);
});

// GET /noi-intervistiamo/api/dashboard/stats
router.get('/stats', (req, res) => {
  res.json(mockStats);
});

// GET /noi-intervistiamo/api/dashboard/charts
router.get('/charts', (req, res) => {
  const { period } = req.query;

  let filteredCharts = mockCharts;
  if (period) {
    filteredCharts = mockCharts.filter(chart => chart.period === period);
  }

  res.json(filteredCharts);
});

// GET /noi-intervistiamo/api/dashboard/alerts
router.get('/alerts', (req, res) => {
  const { unread } = req.query;

  let filteredAlerts = mockAlerts;
  if (unread === 'true') {
    filteredAlerts = mockAlerts.filter(alert => !alert.read);
  }

  res.json(filteredAlerts);
});

// PUT /noi-intervistiamo/api/dashboard/alerts/:id/read
router.put('/alerts/:id/read', (req, res) => {
  const { id } = req.params;
  const alert = mockAlerts.find(a => a.id === id);

  if (!alert) {
    return res.status(404).json({
      error: 'ALERT_NOT_FOUND',
      message: 'Avviso non trovato'
    });
  }

  alert.read = true;

  res.json(alert);
});

export { router as dashboardRoutes };