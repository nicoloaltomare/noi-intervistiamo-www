import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  stats = [
    {
      title: 'Utenti Totali',
      value: '1,234',
      icon: 'fas fa-users',
      color: 'primary',
      trend: '+12%'
    },
    {
      title: 'Intervistatori Attivi',
      value: '56',
      icon: 'fas fa-user-tie',
      color: 'success',
      trend: '+5%'
    },
    {
      title: 'Dipartimenti',
      value: '8',
      icon: 'fas fa-building',
      color: 'info',
      trend: '0%'
    },
    {
      title: 'Ruoli Configurati',
      value: '12',
      icon: 'fas fa-user-tag',
      color: 'warning',
      trend: '+2'
    }
  ];
}