import { Component, Input, Output, EventEmitter, signal, forwardRef, HostListener, ElementRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="custom-select-wrapper" [class.disabled]="disabled" [class.open]="isOpen()" [class.error]="hasErrorClass">
      <button
        type="button"
        class="select-trigger"
        [disabled]="disabled"
        (click)="toggleDropdown()"
        (blur)="onTouched()">
        <div class="selected-content">
          <span *ngIf="selectedOption()?.color && !selectedOption()?.icon" class="color-dot" [style.background-color]="selectedOption()!.color"></span>
          <i *ngIf="selectedOption()?.icon" [class]="selectedOption()!.icon" [style.color]="selectedOption()?.color || ''"></i>
          <span class="selected-label" [class.placeholder]="!selectedOption()">
            {{ selectedOption()?.label || placeholder }}
          </span>
        </div>
        <i class="fas fa-chevron-down arrow-icon" [class.rotated]="isOpen()"></i>
      </button>

      <div class="dropdown-panel" [class.show]="isOpen()" *ngIf="isOpen()">
        <div class="options-list">
          <button
            *ngFor="let option of options"
            type="button"
            class="option-item"
            [class.selected]="isSelected(option)"
            [class.disabled]="option.disabled"
            [disabled]="option.disabled"
            (click)="selectOption(option)">
            <span *ngIf="option.color && !option.icon" class="color-dot" [style.background-color]="option.color"></span>
            <i *ngIf="option.icon" [class]="option.icon" [style.color]="option.color || ''"></i>
            <span>{{ option.label }}</span>
            <i *ngIf="isSelected(option)" class="fas fa-check check-icon"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-select-wrapper {
      position: relative;
      width: 100%;
    }

    .select-trigger {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--portal-border-primary);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: all 0.2s ease;
      font-size: 14px;
      color: var(--portal-text-primary);
      text-align: left;

      &:hover:not(:disabled) {
        border-color: var(--portal-primary);
      }

      &:focus {
        outline: none;
        border-color: var(--portal-primary);
        box-shadow: 0 0 0 3px rgba(0, 77, 115, 0.1);
      }

      &:disabled {
        background: var(--portal-bg-primary);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .custom-select-wrapper.open .select-trigger {
      border-color: var(--portal-primary);
      box-shadow: 0 0 0 3px rgba(0, 77, 115, 0.1);
    }

    .selected-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
      background-color: transparent;

      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      i {
        font-size: 14px;
      }
    }

    .selected-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
      background-color: transparent;

      &.placeholder {
        color: var(--portal-text-secondary);
        opacity: 0.7;
        font-weight: 400;
        background-color: transparent;
      }
    }

    .arrow-icon {
      font-size: 12px;
      color: var(--portal-text-secondary);
      transition: transform 0.2s ease;
      flex-shrink: 0;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    .dropdown-panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--portal-border-primary);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s ease;
      max-height: 280px;
      overflow: hidden;

      &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
    }

    .options-list {
      max-height: 280px;
      overflow-y: auto;
      padding: 4px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--portal-border-primary);
        border-radius: 3px;

        &:hover {
          background: var(--portal-text-secondary);
        }
      }
    }

    .option-item {
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 6px;
      transition: all 0.15s ease;
      font-size: 14px;
      color: var(--portal-text-primary);
      text-align: left;
      position: relative;

      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      i:not(.check-icon) {
        font-size: 14px;
      }

      span:not(.color-dot) {
        flex: 1;
      }

      .check-icon {
        color: var(--portal-primary);
        font-size: 14px;
        margin-left: auto;
      }

      &:hover:not(:disabled) {
        background: rgba(0, 77, 115, 0.05);
        color: var(--portal-primary);
      }

      &.selected {
        background: rgba(0, 77, 115, 0.08);
        font-weight: 500;
        color: var(--portal-primary);
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .custom-select-wrapper.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .custom-select-wrapper.error .select-trigger {
      border-color: #dc3545 !important;
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1) !important;
    }
  `]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleziona...';
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal(false);
  selectedOption = signal<SelectOption | null>(null);
  value: any = null;
  hasErrorClass: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    // Check if error class is applied to the host element
    this.checkErrorClass();
  }

  ngDoCheck() {
    // Re-check on every change detection cycle
    this.checkErrorClass();
  }

  private checkErrorClass() {
    this.hasErrorClass = this.elementRef.nativeElement.classList.contains('error');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent) {
    // Check if the new focus target is outside the component
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !this.elementRef.nativeElement.contains(relatedTarget)) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
    }
  }

  closeDropdown() {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  selectOption(option: SelectOption) {
    if (option.disabled) return;

    this.selectedOption.set(option);
    this.value = option.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.closeDropdown();
  }

  isSelected(option: SelectOption): boolean {
    return this.value === option.value;
  }

  writeValue(value: any): void {
    this.value = value;
    const option = this.options.find(opt => opt.value === value);
    this.selectedOption.set(option || null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}