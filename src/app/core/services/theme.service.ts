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
    await this.loadThemeConfig();
    await this.applyTheme(this.currentThemeKey);
  }

  private async loadThemeConfig(): Promise<void> {
    const response = await fetch('/assets/config/theme-colors.config.json');
    const configData = await response.json();
    this.themeConfig = configData;
    this.currentThemeKey = configData.application?.currentTheme || 'corporate-blue';
  }

  async applyTheme(themeKey: string): Promise<void> {
    if (!this.themeConfig || !this.themeConfig.themes[themeKey]) {
      console.error(`Theme "${themeKey}" not found.`);
      return;
    }

    const theme = this.themeConfig.themes[themeKey];
    const colors = theme.colors;

    const root = document.documentElement;

    root.style.setProperty('--portal-primary', colors.primary);
    root.style.setProperty('--portal-primary-hover', colors.primaryHover);
    root.style.setProperty('--portal-primary-light', colors.primaryLight);
    root.style.setProperty('--portal-success', colors.success);
    root.style.setProperty('--portal-success-hover', colors.successHover);

    root.style.setProperty('--portal-secondary', colors.secondary);
    root.style.setProperty('--portal-secondary-hover', colors.secondaryHover);
    root.style.setProperty('--portal-secondary-light', colors.secondaryLight);
    root.style.setProperty('--portal-warning', colors.warning);
    root.style.setProperty('--portal-warning-hover', colors.warningHover);
    root.style.setProperty('--portal-danger', colors.danger);
    root.style.setProperty('--portal-danger-hover', colors.dangerHover);

    root.style.setProperty('--portal-light', colors.light);
    root.style.setProperty('--portal-light-hover', colors.lightHover);
    root.style.setProperty('--portal-dark', colors.dark);
    root.style.setProperty('--portal-dark-hover', colors.darkHover);

    root.style.setProperty('--portal-bg-primary', colors.background);
    root.style.setProperty('--portal-bg-secondary', colors.backgroundSecondary);
    root.style.setProperty('--portal-bg-tertiary', colors.backgroundTertiary);

    root.style.setProperty('--portal-text-primary', colors.text);
    root.style.setProperty('--portal-text-secondary', colors.textSecondary);
    root.style.setProperty('--portal-text-muted', colors.textMuted);

    root.style.setProperty('--portal-border-primary', colors.border);
    root.style.setProperty('--portal-border-secondary', colors.borderSecondary);

    root.style.setProperty('--portal-shadow-light', colors.shadowLight);
    root.style.setProperty('--portal-shadow-medium', colors.shadowMedium);
    root.style.setProperty('--portal-shadow-strong', colors.shadowStrong);

    this.currentThemeKey = themeKey;

    console.log(`✅ Applied theme: ${theme.name}`);
  }


}
