import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent, ModalConfig } from '../base-modal/base-modal.component';

export interface AvatarCategory {
  id: string;
  name: string;
  style: string;
}

export interface AvatarOption {
  id: string;
  url: string;
  seed: string;
}

export interface AvatarSelection {
  avatarUrl?: string;
  backgroundColor: string;
}

@Component({
  selector: 'app-avatar-selection-modal',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './avatar-selection-modal.component.html',
  styleUrl: './avatar-selection-modal.component.scss'
})
export class AvatarSelectionModalComponent implements OnInit {
  @Input() isVisible = signal(false);
  @Input() currentAvatar?: string;
  @Input() currentColor: string = 'transparent';
  @Output() closeModal = new EventEmitter<void>();
  @Output() selectAvatar = new EventEmitter<AvatarSelection>();

  modalConfig: ModalConfig = {
    size: 'lg',
    showFooter: true
  };

  // Avatar selection - usando Notion-style avatars
  avatarCategories: AvatarCategory[] = [
    { id: 'people', name: 'Persone', style: 'people' },
    { id: 'animals', name: 'Animali', style: 'animals' },
    { id: 'objects', name: 'Oggetti', style: 'objects' }
  ];

  // Avatar collections
  private avatarCollections = {
    people: [
      '👨', '👩', '👴', '👵', '👶', '👦', '👧', '🧑', '👨‍💼', '👩‍💼',
      '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬',
      '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒', '👮‍♂️', '👮‍♀️', '🕵️‍♂️', '🕵️‍♀️',
      '💂‍♂️', '💂‍♀️', '👷‍♂️', '👷‍♀️', '🤴', '👸', '👳‍♂️', '👳‍♀️', '👲', '🧕',
      '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🧙‍♂️'
    ],
    animals: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
      '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
      '🐌', '🐞', '🐜', '🦟', '🦗', '🐢', '🐍', '🦎', '🦖', '🦕',
      '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬'
    ],
    objects: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
      '🥊', '🎯', '🎮', '🎰', '🎲', '🎸', '🎹', '🎺', '🎷', '🎻',
      '🥁', '🎬', '🎨', '🎭', '🎪', '📷', '📹', '🎥', '💻', '⌨️',
      '🖥️', '🖨️', '🖱️', '💾', '💿', '📱', '☎️', '📞', '📟', '📠',
      '⏰', '⏱️', '⌚', '📡', '🔋', '🔌', '💡', '🔦'
    ]
  };

  selectedAvatarCategory = signal<string>('people');
  avatarOptions = signal<AvatarOption[]>([]);
  selectedAvatar = signal<string | undefined>(undefined);
  selectedColor = signal<string>('transparent');

  // Color presets
  colorPresets = [
    'transparent', '#007bff', '#28a745', '#dc3545', '#ffc107',
    '#6f42c1', '#17a2b8', '#fd7e14', '#e83e8c', '#6c757d'
  ];

  ngOnInit() {
    if (this.currentAvatar) {
      this.selectedAvatar.set(this.currentAvatar);
    }
    this.selectedColor.set(this.currentColor);
    this.generateAvatars();
  }

  generateAvatars() {
    const category = this.selectedAvatarCategory();
    const emojis = this.avatarCollections[category as keyof typeof this.avatarCollections] || this.avatarCollections.people;

    const avatars: AvatarOption[] = emojis.map((emoji, index) => ({
      id: `${category}-${index}`,
      url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="60">${emoji}</text></svg>`)}`,
      seed: emoji
    }));

    this.avatarOptions.set(avatars);
  }

  onCategoryChange() {
    this.generateAvatars();
    this.selectedAvatar.set(undefined);
  }

  onAvatarSelect(avatar: AvatarOption) {
    this.selectedAvatar.set(avatar.url);
  }

  onColorSelect(color: string) {
    this.selectedColor.set(color);
  }

  onSave() {
    this.selectAvatar.emit({
      avatarUrl: this.selectedAvatar(),
      backgroundColor: this.selectedColor()
    });
    this.onClose();
  }

  onClose() {
    this.closeModal.emit();
  }
}