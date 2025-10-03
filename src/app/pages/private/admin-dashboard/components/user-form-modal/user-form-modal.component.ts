import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseModalComponent, ModalConfig } from '../../../../../core/toolkit/base-modal/base-modal.component';
import { CustomSelectComponent, SelectOption } from '../../../../../core/toolkit/custom-select/custom-select.component';
import { AvatarSelectionModalComponent, AvatarSelection } from '../../../../../core/toolkit/avatar-selection-modal/avatar-selection-modal.component';
import { User } from '../../../../../shared/models/user.model';
import { ApiService } from '../../../../../core/services/api.service';
import { ModalService } from '../../../../../core/services/modal.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent, CustomSelectComponent, AvatarSelectionModalComponent],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss'
})
export class UserFormModalComponent implements OnInit, OnChanges {
  @Input() isVisible = signal(false);
  @Input() user?: User;
  @Input() preloadedRoles?: any[];
  @Input() preloadedDepartments?: any[];
  @Input() preloadedUserStatuses?: any[];
  @Input() preloadedAccessAreas?: any[];
  @Input() preloadedColorPalettes?: any[];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<Partial<User>>();
  private api = inject(ApiService);
  private modalService = inject(ModalService);
  password = signal('');
  passwordExpireDays = signal(90);
  passwordNeverExpires = signal(false);
  selectedAccessAreas = signal<string[]>([]);
  selectedAvatar = signal<string | undefined>(undefined);
  userColor = signal('transparent');
  showAvatarModal = signal(false);
  accessAreas = signal<Array<{ id: string; label: string; icon: string; color: string }>>([]);
  predefinedColors = signal<string[]>([]);
  areaColors = signal<Record<string, string>>({});
  statusOptions = signal<SelectOption[]>([]);
  roleOptionsFromAPI = signal<SelectOption[]>([]);
  departmentOptions = signal<SelectOption[]>([
    { value: undefined, label: 'Nessun dipartimento', icon: 'fas fa-minus' }
  ]);
  modalConfig: ModalConfig = {
    size: 'xl',
    showFooter: true
  };
  formData = signal<Partial<User>>(({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'CANDIDATE',
    roleName: '',
    department: undefined,
    status: 'Attivo',
    isActive: true,
    avatarId: undefined
  } as Partial<User>));

  // Validation signals
  validationErrors = signal<Record<string, string>>({});
  isSubmitted = signal(false);

  ngOnInit() {
    // Use preloaded data if available, otherwise load from API
    if (this.preloadedDepartments) {
      this.setDepartmentOptions(this.preloadedDepartments);
    } else {
      this.loadDepartments();
    }

    if (this.preloadedRoles) {
      this.setRoleOptions(this.preloadedRoles);
    } else {
      this.loadRoles();
    }

    if (this.preloadedUserStatuses) {
      this.setStatusOptions(this.preloadedUserStatuses);
    } else {
      this.loadUserStatuses();
    }

    if (this.preloadedAccessAreas) {
      this.setAccessAreas(this.preloadedAccessAreas);
    } else {
      this.loadAccessAreas();
    }

    if (this.preloadedColorPalettes) {
      this.setColorPalettes(this.preloadedColorPalettes);
    } else {
      this.loadColorPalettes();
    }

    // Initialize user data
    this.loadUserData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // React to user input changes (when editing different users)
    if (changes['user'] && !changes['user'].firstChange) {
      console.log('[UserFormModalComponent] User input changed, reloading data');
      this.loadUserData();
    }
  }

  private loadUserData() {
    if (this.user) {
      console.log('[UserFormModalComponent] Loading user data:', this.user);
      this.formData.set({ ...this.user });
      if (this.user.avatarId) {
        this.selectedAvatar.set(this.user.avatarId);
      }
      const areas: string[] = [];
      if ((this.user as any).hasHRAccess) areas.push('hasHRAccess');
      if ((this.user as any).hasTechnicalAccess) areas.push('hasTechnicalAccess');
      if ((this.user as any).hasAdminAccess) areas.push('hasAdminAccess');
      if ((this.user as any).hasCandidateAccess) areas.push('hasCandidateAccess');
      this.selectedAccessAreas.set(areas);
      if ((this.user as any).accessAreaColors) {
        this.areaColors.set((this.user as any).accessAreaColors);
      }
    }
  }

  private setDepartmentOptions(departments: any[]) {
    this.departmentOptions.set([
      { value: undefined, label: 'Nessun dipartimento', icon: 'fas fa-minus' },
      ...departments.map((dept: any) => ({
        value: dept.name,
        label: dept.name,
        icon: 'fas fa-building',
        color: dept.color
      }))
    ]);
  }

  private setRoleOptions(roles: any[]) {
    const roleOptions = [
      {
        value: null,
        label: 'Nessun Ruolo',
        icon: 'fas fa-user-slash',
        color: '#6c757d'
      },
      ...roles.map((role: any) => ({
        value: role.code,
        label: role.name,
        icon: 'fas fa-user-tag',
        color: role.color
      }))
    ];
    this.roleOptionsFromAPI.set(roleOptions);
  }

  private setStatusOptions(statuses: any[]) {
    this.statusOptions.set(
      statuses.map((status: any) => ({
        value: status.value,
        label: status.label,
        icon: status.icon,
        color: status.color
      }))
    );
  }

  private setAccessAreas(areas: any[]) {
    this.accessAreas.set(areas.map((area: any) => ({
      id: area.id,
      label: area.label,
      icon: area.icon,
      color: area.color
    })));

    // Set default colors for access areas
    const defaultColors: Record<string, string> = {};
    areas.forEach((area: any) => {
      defaultColors[area.id] = area.color;
    });
    if (Object.keys(this.areaColors()).length === 0) {
      this.areaColors.set(defaultColors);
    }
  }

  private setColorPalettes(palettes: any[]) {
    if (palettes.length > 0) {
      this.predefinedColors.set(palettes[0].colors);
    }
  }

  loadUserStatuses() {
    this.api.get<any[]>('datalist/user-statuses').subscribe({
      next: (statuses: any[]) => {
        this.setStatusOptions(statuses);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento degli stati utente:', error);
      }
    });
  }

  loadAccessAreas() {
    this.api.get<any[]>('datalist/user-access-areas').subscribe({
      next: (areas: any[]) => {
        this.setAccessAreas(areas);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento delle aree di accesso:', error);
      }
    });
  }

  loadColorPalettes() {
    this.api.get<any[]>('datalist/user-color-palettes').subscribe({
      next: (palettes: any[]) => {
        this.setColorPalettes(palettes);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento delle palette di colori:', error);
      }
    });
  }

  loadDepartments() {
    this.api.get<any[]>('datalist/departments').subscribe({
      next: (departments: any[]) => {
        this.departmentOptions.set([
          { value: undefined, label: 'Nessun dipartimento', icon: 'fas fa-minus' },
          ...departments.map((dept: any) => ({
            value: dept.name,
            label: dept.name,
            icon: 'fas fa-building',
            color: dept.color
          }))
        ]);
      },
      error: (error: any) => {
        console.error('Errore nel caricamento dei dipartimenti:', error);
      }
    });
  }

  loadRoles() {
    this.api.get<any[]>('datalist/roles').subscribe({
      next: (roles: any[]) => {
        this.roleOptionsFromAPI.set(
          roles.map((role: any) => ({
            value: role.code,
            label: role.name,
            icon: 'fas fa-user-tag',
            color: role.color
          }))
        );
      },
      error: (error: any) => {
        console.error('Errore nel caricamento dei ruoli:', error);
      }
    });
  }

  openAvatarModal() {
    this.showAvatarModal.set(true);
  }

  closeAvatarModal() {
    this.showAvatarModal.set(false);
  }

  onAvatarSelected(selection: AvatarSelection) {
    this.selectedAvatar.set(selection.avatarUrl);
    this.userColor.set(selection.backgroundColor);
  }

  toggleAccessArea(areaId: string) {
    const areas = [...this.selectedAccessAreas()];
    const index = areas.indexOf(areaId);
    if (index > -1) {
      areas.splice(index, 1);
    } else {
      areas.push(areaId);
    }
    this.selectedAccessAreas.set(areas);

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
    return this.accessAreas().filter((area: any) => this.isAccessAreaSelected(area.id));
  }

  getAreaColor(areaId: string): string {
    return this.areaColors()[areaId] || '#64748b';
  }

  setAreaColor(areaId: string, color: string): void {
    this.areaColors.update(colors => ({ ...colors, [areaId]: color }));
  }

  onSave() {
    this.isSubmitted.set(true);
    const errors: Record<string, string> = {};

    // Validate firstName
    if (!this.formData().firstName?.trim()) {
      errors['firstName'] = 'Dato obbligatorio';
    }

    // Validate lastName
    if (!this.formData().lastName?.trim()) {
      errors['lastName'] = 'Dato obbligatorio';
    }

    // Validate username
    if (!this.formData().username?.trim()) {
      errors['username'] = 'Dato obbligatorio';
    }

    // Validate email
    if (!this.formData().email?.trim()) {
      errors['email'] = 'Dato obbligatorio';
    }

    // Validate password (only when creating new user)
    if (!this.user && !this.password()?.trim()) {
      errors['password'] = 'Dato obbligatorio';
    }

    // Validate role
    if (!this.formData().role) {
      errors['role'] = 'Dato obbligatorio';
    }

    // Validate department
    if (!this.formData().department) {
      errors['department'] = 'Dato obbligatorio';
    }

    // Validate status
    if (!this.formData().status) {
      errors['status'] = 'Dato obbligatorio';
    }

    // Validate access areas
    if (this.selectedAccessAreas().length === 0) {
      errors['accessAreas'] = 'Dato obbligatorio';
    }

    this.validationErrors.set(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const data = {
      ...this.formData(),
      avatarId: this.selectedAvatar(),
      hasHRAccess: this.isAccessAreaSelected('hasHRAccess'),
      hasTechnicalAccess: this.isAccessAreaSelected('hasTechnicalAccess'),
      hasAdminAccess: this.isAccessAreaSelected('hasAdminAccess'),
      hasCandidateAccess: this.isAccessAreaSelected('hasCandidateAccess'),
      accessAreaColors: this.areaColors()
    };
    this.saveUser.emit(data);
  }

  onClose() {
    this.closeModal.emit();
  }

  updateFormField(field: keyof User, value: any) {
    this.formData.update(data => ({ ...data, [field]: value }));

    // Real-time validation: clear error if field becomes valid
    if (this.isSubmitted()) {
      this.validateField(field as string, value);
    }
  }

  private validateField(field: string, value: any) {
    const errors = { ...this.validationErrors() };

    if (field === 'firstName' && value?.trim()) {
      delete errors['firstName'];
    }
    if (field === 'lastName' && value?.trim()) {
      delete errors['lastName'];
    }
    if (field === 'username' && value?.trim()) {
      delete errors['username'];
    }
    if (field === 'email' && value?.trim()) {
      delete errors['email'];
    }
    if (field === 'password' && value?.trim()) {
      delete errors['password'];
    }
    if (field === 'role' && value) {
      delete errors['role'];
    }
    if (field === 'department' && value) {
      delete errors['department'];
    }
    if (field === 'status' && value) {
      delete errors['status'];
    }

    this.validationErrors.set(errors);
  }

  onPasswordChange(value: string) {
    this.password.set(value);

    // Real-time validation for password
    if (this.isSubmitted()) {
      this.validateField('password', value);
    }
  }

  hasError(field: string): boolean {
    return this.isSubmitted() && !!this.validationErrors()[field];
  }

  getError(field: string): string {
    return this.validationErrors()[field] || '';
  }

  isFieldValid(field: string): boolean {
    if (!this.isSubmitted()) return false;

    if (field === 'firstName') {
      return !!this.formData().firstName?.trim() && !this.hasError('firstName');
    }
    if (field === 'lastName') {
      return !!this.formData().lastName?.trim() && !this.hasError('lastName');
    }
    if (field === 'username') {
      return !!this.formData().username?.trim() && !this.hasError('username');
    }
    if (field === 'email') {
      return !!this.formData().email?.trim() && !this.hasError('email');
    }
    if (field === 'password') {
      // Only validate password if it's a new user
      if (!this.user) {
        return !!this.password()?.trim() && !this.hasError('password');
      }
      return false; // Don't show validation icon for existing users
    }
    if (field === 'role') {
      return !!this.formData().role && !this.hasError('role');
    }
    if (field === 'department') {
      return !!this.formData().department && !this.hasError('department');
    }
    if (field === 'status') {
      return !!this.formData().status && !this.hasError('status');
    }
    if (field === 'accessAreas') {
      return this.selectedAccessAreas().length > 0 && !this.hasError('accessAreas');
    }

    return false;
  }

  getInitials(): string {
    const firstName = this.formData().firstName || '';
    const lastName = this.formData().lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || '';
  }
}
