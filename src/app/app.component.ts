import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { GlobalLoaderComponent } from './core/toolkit/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'noi-intervistiamo-www';

  constructor(private themeService: ThemeService) {}

  async ngOnInit() {
    console.log('🎨 Initializing theme system...');
    await this.themeService.initializeTheme();
    console.log('✅ Theme system initialized');
  }
}
