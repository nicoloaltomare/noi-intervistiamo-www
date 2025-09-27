import { Injectable } from '@angular/core';

interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  success: string;
  successHover: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  warning: string;
  warningHover: string;
  danger: string;
  dangerHover: string;
  light: string;
  lightHover: string;
  dark: string;
  darkHover: string;
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSecondary: string;
  shadowLight: string;
  shadowMedium: string;
  shadowStrong: string;
}

interface Theme {
  name: string;
  description: string;
  colors: ThemeColors;
}

interface ThemeConfig {
  application: {
    name: string;
    version: string;
    currentTheme: string;
  };
  themes: { [key: string]: Theme };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeKey: string = 'modern-green';
  private themeConfig: ThemeConfig | null = null;

  constructor() {}

  async initializeTheme(): Promise<void> {
    try {
      await this.loadThemeConfig();
      await this.applyTheme(this.currentThemeKey);
    } catch (error) {
      console.error('Error initializing theme:', error);
      this.applyDefaultTheme();
    }
  }

  private async loadThemeConfig(): Promise<void> {
    try {
      const response = await fetch('/assets/config/theme-colors.config.json');
      const configData = await response.json();

      // Use the configuration directly from the file
      this.themeConfig = configData;
      this.currentThemeKey = configData.application?.currentTheme || 'modern-green';
    } catch (error) {
      console.error('Error loading theme config, using fallback:', error);
      // Fallback configuration - minimal fallback theme
      this.themeConfig = {
        application: {
          name: 'Noi Intervistiamo Portal',
          version: '1.0.0',
          currentTheme: 'modern-green'
        },
        themes: {
          'modern-green': {
            name: 'Modern Green',
            description: 'Tema moderno verde di default',
            colors: {
              primary: '#0a8228',
              primaryHover: '#219a52',
              primaryLight: '#123e1d',
              success: '#16a085',
              successHover: '#138d75',
              secondary: '#0a8228eb',
              secondaryHover: '#2c3e50',
              secondaryLight: '#5d6d7e',
              warning: '#f39c12',
              warningHover: '#e67e22',
              danger: '#a9271a',
              dangerHover: '#c0392b',
              light: '#e8f8f5',
              lightHover: '#d1f2eb',
              dark: '#1e8449',
              darkHover: '#186a3b',
              background: '#ffffff',
              backgroundSecondary: '#faf8f8',
              backgroundTertiary: '#e8f8f5',
              text: '#2c3e50',
              textSecondary: '#5d6d7e',
              textMuted: '#85929e',
              border: '#d5dbdb',
              borderSecondary: '#e8f8f5',
              shadowLight: 'rgba(39, 174, 96, 0.1)',
              shadowMedium: 'rgba(39, 174, 96, 0.15)',
              shadowStrong: 'rgba(39, 174, 96, 0.2)'
            }
          }
        }
      };

      this.currentThemeKey = 'modern-green';
    }
  }

  async applyTheme(themeKey: string): Promise<void> {
    if (!this.themeConfig || !this.themeConfig.themes[themeKey]) {
      console.warn(`Theme "${themeKey}" not found. Using default theme.`);
      this.applyDefaultTheme();
      return;
    }

    const theme = this.themeConfig.themes[themeKey];
    const colors = theme.colors;

    const root = document.documentElement;

    // Priority Colors - Main Brand
    root.style.setProperty('--portal-primary', colors.primary);
    root.style.setProperty('--portal-primary-hover', colors.primaryHover);
    root.style.setProperty('--portal-primary-light', colors.primaryLight);
    root.style.setProperty('--portal-success', colors.success);
    root.style.setProperty('--portal-success-hover', colors.successHover);

    // Secondary Colors
    root.style.setProperty('--portal-secondary', colors.secondary);
    root.style.setProperty('--portal-secondary-hover', colors.secondaryHover);
    root.style.setProperty('--portal-secondary-light', colors.secondaryLight);
    root.style.setProperty('--portal-warning', colors.warning);
    root.style.setProperty('--portal-warning-hover', colors.warningHover);
    root.style.setProperty('--portal-danger', colors.danger);
    root.style.setProperty('--portal-danger-hover', colors.dangerHover);

    // Neutral Colors
    root.style.setProperty('--portal-light', colors.light);
    root.style.setProperty('--portal-light-hover', colors.lightHover);
    root.style.setProperty('--portal-dark', colors.dark);
    root.style.setProperty('--portal-dark-hover', colors.darkHover);

    // Background Colors
    root.style.setProperty('--portal-bg-primary', colors.background);
    root.style.setProperty('--portal-bg-secondary', colors.backgroundSecondary);
    root.style.setProperty('--portal-bg-tertiary', colors.backgroundTertiary);

    // Text Colors
    root.style.setProperty('--portal-text-primary', colors.text);
    root.style.setProperty('--portal-text-secondary', colors.textSecondary);
    root.style.setProperty('--portal-text-muted', colors.textMuted);

    // Border Colors
    root.style.setProperty('--portal-border-primary', colors.border);
    root.style.setProperty('--portal-border-secondary', colors.borderSecondary);

    // Shadow Colors
    root.style.setProperty('--portal-shadow-light', colors.shadowLight);
    root.style.setProperty('--portal-shadow-medium', colors.shadowMedium);
    root.style.setProperty('--portal-shadow-strong', colors.shadowStrong);

    this.currentThemeKey = themeKey;

    console.log(`✅ Applied theme: ${theme.name}`);
  }

  private applyDefaultTheme(): void {
    console.log('⚠️ Applying default fallback theme');
    // Le variabili CSS sono già definite in styles.scss come fallback
  }

  getCurrentTheme(): string {
    return this.currentThemeKey;
  }

  getCurrentThemeInfo(): Theme | null {
    if (!this.themeConfig || !this.themeConfig.themes[this.currentThemeKey]) {
      return null;
    }
    return this.themeConfig.themes[this.currentThemeKey];
  }

  getAvailableThemes(): { [key: string]: Theme } | null {
    return this.themeConfig?.themes || null;
  }

  async switchTheme(themeKey: string): Promise<void> {
    await this.applyTheme(themeKey);
  }
}
