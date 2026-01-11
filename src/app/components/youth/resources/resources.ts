import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';
import { Resource } from '../../../models';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container animate-fade">
      <div class="header-section">
        <h1>{{lang === 'es' ? 'Recursos Locales' : 'Tokiko Baliabideak'}}</h1>
        <div class="lang-switch">
          <button (click)="lang = 'es'" [class.active]="lang === 'es'">ES</button>
          <button (click)="lang = 'eu'" [class.active]="lang === 'eu'">EU</button>
        </div>
      </div>

      <div class="filter-bar">
        <button [class.active]="filter === 'all'" (click)="filter = 'all'">Todos</button>
        <button [class.active]="filter === 'health'" (click)="filter = 'health'">Salud Mental</button>
        <button [class.active]="filter === 'emergency'" (click)="filter = 'emergency'">Urgencias</button>
      </div>

      <div class="resources-grid">
        <div class="card resource-card" *ngFor="let r of filteredResources()">
          <div class="badge" [class]="r.category">{{r.category}}</div>
          <h3>{{lang === 'es' ? r.name : r.nameEu}}</h3>
          <p>{{lang === 'es' ? r.description : r.descriptionEu}}</p>
          
          <div class="contact-info">
            <div class="item">
              <span class="icon">📞</span>
              <a [href]="'tel:' + r.phone">{{r.phone}}</a>
            </div>
            <div class="item" *ngIf="r.address">
              <span class="icon">📍</span>
              <span>{{r.address}}</span>
            </div>
          </div>

          <div class="actions">
            <a *ngIf="r.location" 
               [href]="'https://www.google.com/maps?q=' + r.location.lat + ',' + r.location.lng" 
               target="_blank" 
               class="btn btn-outline">Ver en Mapa</a>
            <a [href]="'tel:' + r.phone" class="btn btn-primary">Llamar ahora</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .lang-switch { display: flex; background: #e2e8f0; border-radius: var(--radius-sm); padding: 2px; }
    .lang-switch button { border: none; background: none; padding: 0.3rem 0.8rem; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
    .lang-switch button.active { background: white; box-shadow: var(--shadow-sm); }
    
    .filter-bar { display: flex; gap: 1rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; }
    .filter-bar button { border: 1px solid #e2e8f0; background: white; padding: 0.5rem 1.2rem; border-radius: 20px; cursor: pointer; white-space: nowrap; }
    .filter-bar button.active { background: var(--primary); color: white; border-color: var(--primary); }

    .resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .resource-card { display: flex; flex-direction: column; }
    .badge { align-self: flex-start; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; }
    .badge.health { background: #e0f2fe; color: #0369a1; }
    .badge.emergency { background: #fee2e2; color: #b91c1c; }
    
    h3 { margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1; }

    .contact-info { margin-bottom: 1.5rem; }
    .contact-info .item { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .contact-info .item a { color: var(--primary); text-decoration: none; font-weight: 600; }

    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    @media (max-width: 480px) {
      .actions { grid-template-columns: 1fr; }
    }
  `]
})
export class ResourcesComponent {
  private dataService = inject(DataService);
  resources: Resource[] = this.dataService.getResources();
  lang: 'es' | 'eu' = 'es';
  filter: string = 'all';

  filteredResources() {
    if (this.filter === 'all') return this.resources;
    return this.resources.filter(r => r.category === this.filter);
  }
}
