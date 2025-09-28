import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  dashboardConfig: any;

  async ngOnInit() {
    await this.loadConfiguration();
  }

  private async loadConfiguration() {
    try {
      const response = await fetch('/assets/config/admin-dashboard.config.json');
      const configData = await response.json();

      this.dashboardConfig = {
        dashboard: {
          title: configData.dashboard?.title || 'Dashboard Amministratore',
          subtitle: configData.dashboard?.subtitle || 'Panoramica generale del sistema',
          charts: [
            {
              title: 'Andamento Colloqui',
              type: 'line'
            },
            {
              title: 'Distribuzione per Area',
              type: 'doughnut'
            },
            {
              title: 'Performance Mensili',
              type: 'bar'
            },
            {
              title: 'Trend Valutazioni',
              type: 'area'
            }
          ]
        },
        stats: {
          cards: [
            {
              id: 'total-users',
              title: 'Utenti Totali',
              icon: 'fas fa-users',
              color: 'primary'
            },
            {
              id: 'active-interviews',
              title: 'Colloqui Attivi',
              icon: 'fas fa-calendar-check',
              color: 'success'
            },
            {
              id: 'pending-evaluations',
              title: 'Valutazioni in Sospeso',
              icon: 'fas fa-clock',
              color: 'warning'
            },
            {
              id: 'system-alerts',
              title: 'Alert di Sistema',
              icon: 'fas fa-exclamation-triangle',
              color: 'danger'
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error loading admin dashboard configuration:', error);
      this.dashboardConfig = {
        dashboard: {
          title: 'Dashboard Amministratore',
          subtitle: 'Panoramica generale del sistema',
          charts: [
            {
              title: 'Andamento Colloqui',
              type: 'line'
            },
            {
              title: 'Distribuzione per Area',
              type: 'doughnut'
            },
            {
              title: 'Performance Mensili',
              type: 'bar'
            },
            {
              title: 'Trend Valutazioni',
              type: 'area'
            }
          ]
        },
        stats: {
          cards: [
            {
              id: 'total-users',
              title: 'Utenti Totali',
              icon: 'fas fa-users',
              color: 'primary'
            },
            {
              id: 'active-interviews',
              title: 'Colloqui Attivi',
              icon: 'fas fa-calendar-check',
              color: 'success'
            },
            {
              id: 'pending-evaluations',
              title: 'Valutazioni in Sospeso',
              icon: 'fas fa-clock',
              color: 'warning'
            },
            {
              id: 'system-alerts',
              title: 'Alert di Sistema',
              icon: 'fas fa-exclamation-triangle',
              color: 'danger'
            }
          ]
        }
      };
    }
  }

  getStatValue(statId: string): string {
    const mockStats: { [key: string]: string } = {
      'total-users': '156',
      'active-interviews': '23',
      'pending-evaluations': '8',
      'system-alerts': '2'
    };
    return mockStats[statId] || '0';
  }
}
