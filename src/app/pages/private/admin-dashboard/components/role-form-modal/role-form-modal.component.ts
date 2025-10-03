import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent, ModalConfig } from '../../../../../core/toolkit/base-modal/base-modal.component';
import { CustomSelectComponent, SelectOption } from '../../../../../core/toolkit/custom-select/custom-select.component';
import { Role } from '../../../../../shared/models/role.model';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent, CustomSelectComponent],
  templateUrl: './role-form-modal.component.html',
  styleUrl: './role-form-modal.component.scss'
})
export class RoleFormModalComponent implements OnInit, OnChanges {
  @Input() isVisible = signal(false);
  @Input() role?: Role;
  @Input() preloadedAccessAreas?: any[];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveRole = new EventEmitter<Partial<Role>>();

  private api = inject(ApiService);

  roleColor = signal('#6c757d');
  selectedAccessAreas = signal<string[]>([]);
  accessAreas = signal<Array<{ id: string; label: string; icon: string; color: string }>>([]);
  statusValue: boolean = true;
  predefinedColors = signal<string[]>([
    '#dc3545', // red
    '#007bff', // blue
    '#28a745', // green
    '#ffc107', // yellow
    '#fd7e14', // orange
    '#6f42c1', // purple
    '#17a2b8', // cyan
    '#20c997', // teal
    '#e83e8c', // pink
    '#6c757d', // gray
    '#343a40', // dark
    '#0dcaf0'  // light blue
  ]);

  statusOptions: SelectOption[] = [
    {
      value: true,
      label: 'Attivo',
      icon: 'fas fa-check-circle',
      color: '#059669'
    },
    {
      value: false,
      label: 'Non attivo',
      icon: 'fas fa-times-circle',
      color: '#ef4444'
    }
  ];

  modalConfig: ModalConfig = {
    size: 'lg',
    showFooter: true
  };

  formData = signal<Partial<Role>>({
    name: '',
    description: '',
    color: '#6c757d',
    isActive: true,
    hasHRAccess: false,
    hasTechnicalAccess: false,
    hasAdminAccess: false,
    hasCandidateAccess: false
  });

  ngOnInit() {
    this.loadAccessAreas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['role'] && this.role) {
      this.formData.set({
        name: this.role.name || '',
        description: this.role.description || '',
        color: this.role.color || '#6c757d',
        isActive: this.role.isActive ?? true,
        hasHRAccess: this.role.hasHRAccess || false,
        hasTechnicalAccess: this.role.hasTechnicalAccess || false,
        hasAdminAccess: this.role.hasAdminAccess || false,
        hasCandidateAccess: this.role.hasCandidateAccess || false
      });

      this.roleColor.set(this.role.color || '#6c757d');
      this.statusValue = this.role.isActive ?? true;

      const selectedAreas: string[] = [];
      if (this.role.hasHRAccess) selectedAreas.push('hasHRAccess');
      if (this.role.hasTechnicalAccess) selectedAreas.push('hasTechnicalAccess');
      if (this.role.hasAdminAccess) selectedAreas.push('hasAdminAccess');
      if (this.role.hasCandidateAccess) selectedAreas.push('hasCandidateAccess');
      this.selectedAccessAreas.set(selectedAreas);
    } else if (changes['role'] && !this.role) {
      this.resetForm();
    }

    if (changes['preloadedAccessAreas'] && this.preloadedAccessAreas) {
      this.accessAreas.set(this.preloadedAccessAreas);
    }
  }

  private loadAccessAreas() {
    if (this.preloadedAccessAreas) {
      this.accessAreas.set(this.preloadedAccessAreas);
    } else {
      this.api.get<any[]>('datalist/user-access-areas').subscribe({
        next: (areas) => {
          this.accessAreas.set(areas);
        },
        error: (error) => {
          console.error('Errore nel caricamento delle aree di accesso:', error);
        }
      });
    }
  }

  resetForm() {
    this.formData.set({
      name: '',
      description: '',
      color: '#6c757d',
      isActive: true,
      hasHRAccess: false,
      hasTechnicalAccess: false,
      hasAdminAccess: false,
      hasCandidateAccess: false
    });
    this.roleColor.set('#6c757d');
    this.statusValue = true;
    this.selectedAccessAreas.set([]);
  }

  updateFormField(field: keyof Role, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));

    // Real-time validation: clear error if field becomes valid
    if (this.isSubmitted()) {
      this.validateField(field as string, value);
    }
  }

  private validateField(field: string, value: any) {
    const errors = { ...this.validationErrors() };

    if (field === 'name' && value?.trim()) {
      delete errors['name'];
    }

    this.validationErrors.set(errors);
  }

  onStatusChange(value: boolean) {
    this.statusValue = value;
    this.updateFormField('isActive', value);
  }

  toggleAccessArea(areaId: string): void {
    const currentAreas = this.selectedAccessAreas();
    if (currentAreas.includes(areaId)) {
      this.selectedAccessAreas.set(currentAreas.filter(id => id !== areaId));
    } else {
      this.selectedAccessAreas.set([...currentAreas, areaId]);
    }

    // Real-time validation: clear error if at least one area is selected
    if (this.isSubmitted() && this.selectedAccessAreas().length > 0) {
      const errors = { ...this.validationErrors() };
      delete errors['accessAreas'];
      this.validationErrors.set(errors);
    }
  }

  isAccessAreaSelected(areaId: string): boolean {
    return this.selectedAccessAreas().includes(areaId);
  }

  getSelectedAccessAreasDetails() {
    return this.accessAreas().filter(area =>
      this.selectedAccessAreas().includes(area.id)
    );
  }

  // Info modal signals
  showInfoModal = signal(false);
  infoModalMessage = signal('');

  // Validation signals
  validationErrors = signal<Record<string, string>>({});
  isSubmitted = signal(false);

  onSave() {
    this.isSubmitted.set(true);
    const errors: Record<string, string> = {};

    // Validate name
    if (!this.formData().name?.trim()) {
      errors['name'] = 'Dato obbligatorio';
    }

    // Validate access areas
    if (this.selectedAccessAreas().length === 0) {
      errors['accessAreas'] = 'Seleziona almeno un\'area di accesso';
    }

    this.validationErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const data = {
      ...this.formData(),
      color: this.roleColor(),
      hasHRAccess: this.isAccessAreaSelected('hasHRAccess'),
      hasTechnicalAccess: this.isAccessAreaSelected('hasTechnicalAccess'),
      hasAdminAccess: this.isAccessAreaSelected('hasAdminAccess'),
      hasCandidateAccess: this.isAccessAreaSelected('hasCandidateAccess')
    };

    this.saveRole.emit(data);
  }

  hasError(field: string): boolean {
    return this.isSubmitted() && !!this.validationErrors()[field];
  }

  getError(field: string): string {
    return this.validationErrors()[field] || '';
  }

  isFieldValid(field: string): boolean {
    if (!this.isSubmitted()) return false;

    if (field === 'name') {
      return !!this.formData().name?.trim() && !this.hasError('name');
    }
    if (field === 'accessAreas') {
      return this.selectedAccessAreas().length > 0 && !this.hasError('accessAreas');
    }

    return false;
  }

  closeInfoModal() {
    this.showInfoModal.set(false);
  }

  onClose() {
    this.closeModal.emit();
  }
}
