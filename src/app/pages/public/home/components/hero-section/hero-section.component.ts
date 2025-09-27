import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  showParticles?: boolean;
  animationDelay?: number;
}

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent implements OnInit {
  @Input() config!: HeroConfig;
  @Input() onAction?: (action: string) => void;

  ngOnInit() {
    if (!this.config) {
      throw new Error('HeroSectionComponent requires config input');
    }
  }

  handleAction(action: string) {
    if (this.onAction) {
      this.onAction(action);
    }
  }
}
