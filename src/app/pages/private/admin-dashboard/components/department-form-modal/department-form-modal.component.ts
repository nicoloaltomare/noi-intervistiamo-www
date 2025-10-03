import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent, ModalConfig } from '../../../../../core/toolkit/base-modal/base-modal.component';
import { Department } from '../../../../../shared/models/department.model';

@Component({
  selector: 'app-department-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent],
  templateUrl: './department-form-modal.component.html',
  styleUrl: './department-form-modal.component.scss'
})
export class DepartmentFormModalComponent implements OnChanges {
  @Input() isVisible = signal(false);
  @Input() department?: Department;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveDepartment = new EventEmitter<Partial<Department>>();

  departmentColor = signal('#6c757d');
  predefinedColors = signal<string[]>([
    '#dc3545', // red
    '#17a2b8', // cyan
    '#007bff', // blue
    '#28a745', // green
    '#6f42c1', // purple
    '#fd7e14', // orange
    '#20c997', // teal
    '#ffc107', // yellow
    '#e83e8c', // pink
    '#6c757d'  // gray
  ]);

  modalConfig: ModalConfig = {
    size: 'lg',
    showFooter: true
  };

  formData = signal<Partial<Department>>({
    name: '',
    description: '',
    color: '#6c757d',
    isActive: true
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['department'] && this.department) {
      this.formData.set({
        name: this.department.name || '',
        description: this.department.description || '',
        color: this.department.color || '#6c757d',
        isActive: this.department.isActive ?? true
      });

      this.departmentColor.set(this.department.color || '#6c757d');
    } else if (changes['department'] && !this.department) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formData.set({
      name: '',
      description: '',
      color: '#6c757d',
      isActive: true
    });
    this.departmentColor.set('#6c757d');
  }

  updateFormField(field: keyof Department, value: any) {
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

    this.validationErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const data = {
      ...this.formData(),
      color: this.departmentColor()
    };

    this.saveDepartment.emit(data);
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

    return false;
  }

  onClose() {
    this.closeModal.emit();
  }
}
