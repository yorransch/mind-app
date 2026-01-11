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
        <h1>{{ t().title }}</h1>
      </div>

      <div class="filter-bar">
        <button [class.active]="filter === 'all'" (click)="filter = 'all'">{{ t().all }}</button>
        <button [class.active]="filter === 'health'" (click)="filter = 'health'">{{ t().health }}</button>
        <button [class.active]="filter === 'emergency'" (click)="filter = 'emergency'">{{ t().urgency }}</button>
        <button [class.active]="filter === 'association'" (click)="filter = 'association'">{{ t().associations }}</button>
      </div>

      <div class="resources-grid">
        <div class="card resource-card" *ngFor="let r of filteredResources()">
          <div class="badge" [class]="r.category">{{ getCategoryName(r.category) }}</div>
          <h3>{{ lang() === 'es' ? r.name : r.nameEu }}</h3>
          <p>{{ lang() === 'es' ? r.description : r.descriptionEu }}</p>
          
          <div class="contact-info">
            <div class="item">
              <span class="icon">📞</span>
              <a [href]="'tel:' + r.phone">{{ r.phone }}</a>
            </div>
            <div class="item" *ngIf="r.address">
              <span class="icon">📍</span>
              <span>{{ r.address }}</span>
            </div>
          </div>

          <div class="actions">
            <a *ngIf="r.location" 
               [href]="'https://www.google.com/maps?q=' + r.location.lat + ',' + r.location.lng" 
               target="_blank" 
               class="btn btn-outline">{{ t().viewMap }}</a>
            <a [href]="'tel:' + r.phone" class="btn btn-primary">{{ t().call }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 2rem 0; }
    .header-section { margin-bottom: 2rem; }
    
    .filter-bar { display: flex; gap: 1rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; }
    .filter-bar button { border: 1px solid #e2e8f0; background: white; padding: 0.5rem 1.2rem; border-radius: 20px; cursor: pointer; white-space: nowrap; font-weight: 600; color: var(--text-muted); }
    .filter-bar button.active { background: var(--primary); color: white; border-color: var(--primary); }

    .resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .resource-card { display: flex; flex-direction: column; padding: 1.5rem; }
    .badge { align-self: flex-start; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; }
    .badge.health { background: #e0f2fe; color: #0369a1; }
    .badge.emergency { background: #fee2e2; color: #b91c1c; }
    .badge.association { background: #fef9c3; color: #a16207; }
    
    h3 { margin-bottom: 0.75rem; color: var(--text-main); font-size: 1.1rem; }
    p { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1; line-height: 1.5; }

    .contact-info { margin-bottom: 1.5rem; }
    .contact-info .item { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.9rem; }
    .contact-info .item a { color: var(--primary); text-decoration: none; font-weight: 700; }
    .contact-info .icon { font-size: 1.1rem; }

    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: auto; }
    @media (max-width: 480px) {
      .actions { grid-template-columns: 1fr; }
    }
  `]
})
export class ResourcesComponent {
  private dataService = inject(DataService);
  resources: Resource[] = this.dataService.getResources();
  filter: string = 'all';

  translations = {
    es: {
      title: 'Recursos en Vitoria-Gasteiz',
      all: 'Todos',
      health: 'Salud Mental',
      urgency: 'Urgencias',
      associations: 'Asociaciones',
      call: 'Llamar ahora',
      viewMap: 'Ver en Mapa',
      catHealth: 'Salud',
      catEmergency: 'Emergencia',
      catAssociation: 'Asociación'
    },
    eu: {
      title: 'Baliabideak Gasteizen',
      all: 'Guztiak',
      health: 'Osasun Mentala',
      urgency: 'Larrialdiak',
      associations: 'Elkarteak',
      call: 'Deitu orain',
      viewMap: 'Ikusi Mapan',
      catHealth: 'Osasuna',
      catEmergency: 'Larrialdia',
      catAssociation: 'Elkartea'
    }
  };

  lang = () => this.dataService.lang();
  t = () => this.translations[this.lang()];

  getCategoryName(cat: string) {
    const t = this.t();
    if (cat === 'health') return t.catHealth;
    if (cat === 'emergency') return t.catEmergency;
    if (cat === 'association') return t.catAssociation;
    return cat;
  }

  filteredResources() {
    if (this.filter === 'all') return this.resources;
    return this.resources.filter(r => r.category === this.filter);
  }
}
