import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header glass sticky">
      <div class="container header-content">
        <div class="logo" routerLink="/">
          <span class="logo-icon">M</span>
          <span class="logo-text">MIND</span>
        </div>

        <nav class="nav" [class.open]="isMenuOpen">
          <ng-container *ngIf="user()">
            <a *ngIf="user()?.role === 'youth'" routerLink="/youth" routerLinkActive="active" class="nav-link" (click)="isMenuOpen = false">{{ dataService.t().home }}</a>
            <a *ngIf="user()?.role === 'youth'" routerLink="/youth/check-in" routerLinkActive="active" class="nav-link" (click)="isMenuOpen = false">{{ dataService.t().checkIn }}</a>
            <a routerLink="/youth/resources" routerLinkActive="active" class="nav-link" (click)="isMenuOpen = false">{{ dataService.t().resources }}</a>
            <a *ngIf="user()?.role === 'professional'" routerLink="/professional" routerLinkActive="active" class="nav-link" (click)="isMenuOpen = false">Pacientes</a>
          </ng-container>
          
          <a *ngIf="!user()" routerLink="/login" class="nav-link" (click)="isMenuOpen = false">{{ dataService.t().login }}</a>
          
          <div class="header-actions">
            <div class="lang-toggle-header">
                <button (click)="dataService.setLanguage('es')" [class.active]="dataService.lang() === 'es'">ES</button>
                <button (click)="dataService.setLanguage('eu')" [class.active]="dataService.lang() === 'eu'">EU</button>
            </div>
            <button *ngIf="user()" (click)="logout(); isMenuOpen = false" class="btn btn-outline btn-sm">{{ dataService.t().logout }}</button>
          </div>
        </nav>

        <button class="mobile-toggle" (click)="isMenuOpen = !isMenuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      padding: 1rem 0;
      z-index: 5000;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      position: sticky; /* Ensure sticky is applied here if not global */
      top: 0;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 800;
      font-size: 1.5rem;
      color: var(--primary);
    }
    .logo-icon {
      background: var(--primary);
      color: white;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .nav-link {
      text-decoration: none;
      color: var(--text-main);
      font-weight: 600;
      transition: color 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--primary);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .lang-toggle-header {
      display: flex;
      background: rgba(0,0,0,0.05);
      padding: 2px;
      border-radius: 6px;
    }
    .lang-toggle-header button {
      border: none;
      background: none;
      padding: 2px 6px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .lang-toggle-header button.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
    }
    .mobile-toggle span {
      width: 25px;
      height: 2px;
      background: var(--text-main);
      transition: 0.3s;
    }

    @media (max-width: 768px) {
      .mobile-toggle { 
        display: flex;
        z-index: 5002;
        position: relative;
      }
      .nav {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        background: #ffffff;
        flex-direction: column;
        padding: 2rem;
        padding-top: 80px;
        gap: 1.5rem;
        z-index: 5001;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .nav.open { 
        display: flex !important;
      }
      .header-actions {
        width: 100%;
        flex-direction: column;
        margin-top: auto;
        padding-top: 2rem;
        border-top: 1px solid #f1f5f9;
      }
      .lang-toggle-header { width: 100%; justify-content: center; padding: 4px; }
      .lang-toggle-header button { flex: 1; padding: 8px; }
      .btn-sm { width: 100%; padding: 12px; }
    }
  `]
})
export class HeaderComponent {
  dataService = inject(DataService);
  router = inject(Router);
  user = this.dataService.currentUser;
  isMenuOpen = false;

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}
