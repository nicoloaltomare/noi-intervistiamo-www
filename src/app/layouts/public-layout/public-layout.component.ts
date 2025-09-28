import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../core/toolkit/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  imports: [CommonModule, FooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent implements OnInit {
  headerConfig: any;
  footerConfig: any;

  async ngOnInit() {
    await this.loadConfigurations();
  }

  private async loadConfigurations() {
    try {
      const [headerResponse, footerResponse] = await Promise.all([
        fetch('/assets/config/header-bar.config.json'),
        fetch('/assets/config/footer.config.json')
      ]);

      const headerData = await headerResponse.json();
      const footerData = await footerResponse.json();

      this.headerConfig = {
        title: headerData.public?.title || 'Noi Intervistiamo',
        logo: {
          src: '/assets/images/logo.png',
          alt: 'Noi Intervistiamo Logo'
        },
        navigation: [
          { label: 'Home', route: '/' },
          { label: 'Chi Siamo', route: '/about' },
          { label: 'Servizi', route: '/services' },
          { label: 'Contatti', route: '/contact' }
        ],
        showUserMenu: false,
        backgroundColor: 'var(--portal-primary)',
        textColor: 'white'
      };

      this.footerConfig = {
        companyInfo: {
          name: footerData.public?.companyInfo?.name || 'Noi Intervistiamo',
          address: footerData.public?.companyInfo?.address || 'Via Roma 123, 00100 Roma, Italia',
          phone: footerData.public?.companyInfo?.phone || '+39 06 123456789',
          email: footerData.public?.companyInfo?.email || 'info@noiintervistiamo.it'
        },
        socialLinks: [
          {
            platform: 'LinkedIn',
            url: 'https://linkedin.com/company/noi-intervistiamo',
            icon: 'fab fa-linkedin'
          },
          {
            platform: 'Twitter',
            url: 'https://twitter.com/noi_intervistiamo',
            icon: 'fab fa-twitter'
          },
          {
            platform: 'Facebook',
            url: 'https://facebook.com/noiintervistiamo',
            icon: 'fab fa-facebook'
          }
        ],
        links: [
          {
            title: 'Azienda',
            items: [
              { label: 'Chi Siamo', route: '/about' },
              { label: 'Team', route: '/team' },
              { label: 'Carriere', route: '/careers' },
              { label: 'News', route: '/news' }
            ]
          },
          {
            title: 'Servizi',
            items: [
              { label: 'Gestione Colloqui', route: '/services/interviews' },
              { label: 'Valutazione Candidati', route: '/services/evaluation' },
              { label: 'Report Avanzati', route: '/services/reports' },
              { label: 'Consulenza', route: '/services/consulting' }
            ]
          },
          {
            title: 'Supporto',
            items: [
              { label: 'Documentazione', route: '/docs' },
              { label: 'FAQ', route: '/faq' },
              { label: 'Contatti', route: '/contact' },
              { label: 'Supporto Tecnico', route: '/support' }
            ]
          },
          {
            title: 'Legale',
            items: [
              { label: 'Privacy Policy', route: '/privacy' },
              { label: 'Termini di Servizio', route: '/terms' },
              { label: 'Cookie Policy', route: '/cookies' },
              { label: 'GDPR', route: '/gdpr' }
            ]
          }
        ],
        copyright: footerData.public?.copyright || '© 2025 Noi Intervistiamo. Tutti i diritti riservati.',
        backgroundColor: 'var(--portal-secondary)',
        textColor: 'white',
        linkColor: 'var(--portal-bg-primary)'
      };
    } catch (error) {
      console.error('Error loading configurations:', error);
      this.headerConfig = {
        title: 'Noi Intervistiamo',
        logo: {
          src: '/assets/images/logo.png',
          alt: 'Noi Intervistiamo Logo'
        },
        navigation: [
          { label: 'Home', route: '/' },
          { label: 'Chi Siamo', route: '/about' },
          { label: 'Servizi', route: '/services' },
          { label: 'Contatti', route: '/contact' }
        ],
        showUserMenu: false,
        backgroundColor: 'var(--portal-primary)',
        textColor: 'white'
      };

      this.footerConfig = {
        companyInfo: {
          name: 'Noi Intervistiamo',
          address: 'Via Roma 123, 00100 Roma, Italia',
          phone: '+39 06 123456789',
          email: 'info@noiintervistiamo.it'
        },
        socialLinks: [
          {
            platform: 'LinkedIn',
            url: 'https://linkedin.com/company/noi-intervistiamo',
            icon: 'fab fa-linkedin'
          },
          {
            platform: 'Twitter',
            url: 'https://twitter.com/noi_intervistiamo',
            icon: 'fab fa-twitter'
          }
        ],
        links: [
          {
            title: 'Azienda',
            items: [
              { label: 'Chi Siamo', route: '/about' },
              { label: 'Contatti', route: '/contact' }
            ]
          }
        ],
        copyright: '© 2025 Noi Intervistiamo. Tutti i diritti riservati.',
        backgroundColor: 'var(--portal-secondary)',
        textColor: 'white',
        linkColor: 'var(--portal-bg-primary)'
      };
    }
  }
}
