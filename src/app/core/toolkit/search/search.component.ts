import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltroItem {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'multiselect';
  placeholder?: string;
  options?: { value: any; label: string }[];
  value?: any;
  colSize?: 'col-md-2' | 'col-md-3' | 'col-md-4' | 'col-md-6' | 'col-md-12';
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @Input() title: string = 'Filtri di Ricerca';
  @Input() icon: string = 'fas fa-filter';
  @Input() filtri: FiltroItem[] = [];
  @Input() showClearButton: boolean = true;
  @Input() clearButtonText: string = 'Pulisci';
  @Input() additionalContent?: TemplateRef<any>;

  @Output() filtroChange = new EventEmitter<{ filtroId: string; value: any }>();
  @Output() clearFiltri = new EventEmitter<void>();

  onFiltroChange(filtroId: string, value: any) {
    // Aggiorna il valore del filtro
    const filtro = this.filtri.find(f => f.id === filtroId);
    if (filtro) {
      filtro.value = value;
    }

    this.filtroChange.emit({ filtroId, value });
  }

  onClearFiltri() {
    // Resetta tutti i valori dei filtri
    this.filtri.forEach(filtro => {
      if (filtro.type === 'checkbox') {
        filtro.value = false;
      } else if (filtro.type === 'multiselect') {
        filtro.value = [];
      } else {
        filtro.value = '';
      }
    });

    this.clearFiltri.emit();
  }

  getColSize(filtro: FiltroItem): string {
    return filtro.colSize || 'col-md-3';
  }

  isArrayValue(value: any): boolean {
    return Array.isArray(value);
  }
}
