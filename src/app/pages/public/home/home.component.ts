import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicLayoutComponent } from '../../../layouts/public-layout/public-layout.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PublicLayoutComponent, HeroSectionComponent, LoginModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild(LoginModalComponent) loginModal!: LoginModalComponent;
  private modalService = inject(ModalService);

  homeConfig: any;
  heroConfig: any;

  async ngOnInit() {
    await this.loadConfiguration();
  }

  private async loadConfiguration() {
    try {
      const response = await fetch('/assets/config/home-page.config.json');
      if (response.ok) {
        const configData = await response.json();

        // Combine loaded titles/subtitles with hardcoded configuration
        this.heroConfig = {
          title: configData.hero?.title || "BVTech Interview System",
          subtitle: configData.hero?.subtitle || "Security Skills in all key industries",
          description: configData.hero?.description || "Piattaforma avanzata per la gestione di colloqui e valutazione delle competenze tecniche sviluppata da BVTech. Sistema sicuro e affidabile per l'ottimizzazione del processo di selezione in settori strategici dell'industria digitale.",
          backgroundImage: null,
          showParticles: true,
          animationDelay: 300
        };

        this.homeConfig = {
          hero: this.heroConfig,
          cta: {
            title: configData.cta?.title || "Pronto per Iniziare?",
            subtitle: configData.cta?.subtitle || "Accedi al sistema per gestire i tuoi colloqui e candidati",
            primaryButton: { text: "Accedi al Sistema", action: "login", icon: "fas fa-sign-in-alt" },
            secondaryButton: { text: "Scopri di Più", action: "scroll-to-features", icon: "fas fa-info-circle" }
          },
          features: {
            sectionTitle: configData.features?.sectionTitle || "Funzionalità Principali",
            sectionSubtitle: configData.features?.sectionSubtitle || "Tutto quello che serve per gestire il processo di selezione",
            items: [
              {
                title: "Gestione Colloqui",
                description: "Pianifica e gestisci i colloqui con strumenti avanzati",
                icon: "fas fa-calendar-alt",
                color: "primary"
              },
              {
                title: "Valutazione Candidati",
                description: "Sistema di valutazione strutturato e oggettivo",
                icon: "fas fa-user-check",
                color: "success"
              },
              {
                title: "Report Avanzati",
                description: "Analisi dettagliate e report personalizzabili",
                icon: "fas fa-chart-line",
                color: "info"
              },
              {
                title: "Sicurezza Garantita",
                description: "Massimi standard di sicurezza e privacy",
                icon: "fas fa-shield-alt",
                color: "warning"
              }
            ]
          },
          stats: {
            sectionTitle: configData.stats?.sectionTitle || "I Nostri Numeri",
            items: [
              {
                number: "500+",
                label: "Colloqui Gestiti",
                icon: "fas fa-handshake"
              },
              {
                number: "150+",
                label: "Aziende Partner",
                icon: "fas fa-building"
              },
              {
                number: "98%",
                label: "Soddisfazione Clienti",
                icon: "fas fa-smile"
              },
              {
                number: "24/7",
                label: "Supporto Disponibile",
                icon: "fas fa-headset"
              }
            ]
          },
          services: {
            sectionTitle: configData.services?.sectionTitle || "Servizi BVTech",
            sectionSubtitle: configData.services?.sectionSubtitle || "Competenze specialistiche per la digitalizzazione sicura",
            items: [
              {
                name: "Cybersecurity",
                description: "Soluzioni di sicurezza informatica avanzate",
                icon: "fas fa-lock",
                color: "danger"
              },
              {
                name: "Cloud Solutions",
                description: "Migrazione e gestione di infrastrutture cloud",
                icon: "fas fa-cloud",
                color: "primary"
              },
              {
                name: "Digital Transformation",
                description: "Trasformazione digitale per il business moderno",
                icon: "fas fa-digital-tachograph",
                color: "success"
              },
              {
                name: "Data Analytics",
                description: "Analisi dei dati per decisioni strategiche",
                icon: "fas fa-chart-bar",
                color: "info"
              },
              {
                name: "System Integration",
                description: "Integrazione di sistemi complessi",
                icon: "fas fa-cogs",
                color: "warning"
              },
              {
                name: "Consulting",
                description: "Consulenza strategica e tecnologica",
                icon: "fas fa-lightbulb",
                color: "secondary"
              }
            ]
          },
          sectors: {
            sectionTitle: configData.sectors?.sectionTitle || "Settori di Eccellenza BVTech",
            sectionSubtitle: configData.sectors?.sectionSubtitle || "Partner ideale con profonda conoscenza dei settori industriali strategici",
            items: [
              {
                name: "Automotive",
                description: "Innovazione per l'industria automobilistica",
                icon: "fas fa-car"
              },
              {
                name: "Finance & Banking",
                description: "Soluzioni per il settore finanziario",
                icon: "fas fa-university"
              },
              {
                name: "Healthcare",
                description: "Tecnologie per la sanità digitale",
                icon: "fas fa-heartbeat"
              },
              {
                name: "Manufacturing",
                description: "Industria 4.0 e automazione",
                icon: "fas fa-industry"
              },
              {
                name: "Energy & Utilities",
                description: "Smart grid e energia sostenibile",
                icon: "fas fa-bolt"
              },
              {
                name: "Telecommunications",
                description: "Infrastrutture di telecomunicazione",
                icon: "fas fa-satellite-dish"
              },
              {
                name: "Public Sector",
                description: "Digitalizzazione della PA",
                icon: "fas fa-landmark"
              },
              {
                name: "Aerospace & Defense",
                description: "Tecnologie critiche per sicurezza nazionale",
                icon: "fas fa-plane"
              }
            ]
          }
        };
      } else {
        console.warn('Configuration file not found, using fallback');
        this.loadFallbackConfiguration();
      }
    } catch (error) {
      console.error('Error loading home page configuration:', error);
      this.loadFallbackConfiguration();
    }
  }

  private loadFallbackConfiguration() {
    this.heroConfig = {
      title: "BVTech Interview System",
      subtitle: "Security Skills in all key industries",
      description: "Piattaforma avanzata per la gestione di colloqui e valutazione delle competenze tecniche sviluppata da BVTech. Sistema sicuro e affidabile per l'ottimizzazione del processo di selezione in settori strategici dell'industria digitale.",
      backgroundImage: null,
      showParticles: true,
      animationDelay: 300
    };

    this.homeConfig = {
      hero: this.heroConfig,
      cta: {
        primaryButton: { text: "Accedi al Sistema", action: "login", icon: "fas fa-sign-in-alt" },
        secondaryButton: { text: "Scopri di Più", action: "scroll-to-features", icon: "fas fa-info-circle" }
      },
      features: {
        sectionTitle: "Funzionalità Principali",
        sectionSubtitle: "Tutto quello che serve per gestire il processo di selezione",
        items: []
      },
      stats: {
        sectionTitle: "I Nostri Numeri",
        items: []
      }
    };
  }

  onHeroAction(action: string) {
    switch (action) {
      case 'login':
        this.loginModal.show();
        break;
      case 'scroll-to-features':
        this.scrollToSection('features');
        break;
      case 'test-confirm':
        this.testConfirmModal();
        break;
      case 'test-info':
        this.testInfoModal();
        break;
    }
  }

  testConfirmModal() {
    this.modalService.showConfirm({
      title: 'Test Conferma',
      message: 'Questo è un test del modal di conferma. Vuoi procedere?',
      confirmText: 'Sì, procedi',
      cancelText: 'Annulla',
      confirmVariant: 'primary',
      size: 'md',
      icon: 'fas fa-question-circle'
    }).subscribe(result => {
      if (result) {
        this.testInfoModal();
      }
    });
  }

  testInfoModal() {
    this.modalService.showInfo({
      title: 'Test Informazione',
      message: 'Questo è un test del modal informativo. Il sistema di modali funziona correttamente!',
      okText: 'Perfetto',
      size: 'sm',
      variant: 'success'
    }).subscribe(() => {
      console.log('Modal informativo chiuso');
    });
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
