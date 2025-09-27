import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface LinkItem {
  label: string;
  route: string;
}

interface LinkSection {
  title: string;
  items: LinkItem[];
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface FooterConfig {
  companyInfo: CompanyInfo;
  socialLinks: SocialLink[];
  links: LinkSection[];
  copyright: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  @Input() config!: FooterConfig;

  ngOnInit() {
    if (!this.config) {
      throw new Error('FooterComponent requires config input');
    }
  }
}
