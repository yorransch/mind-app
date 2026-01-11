import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';
import { CheckIn, Alert, User } from '../../../models';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container animate-fade">
      <div class="dash-header">
        <h1>Panel Profesional</h1>
        <div class="summary-cards">
          <div class="s-card red">
            <span class="count">{{getAlertCount('red')}}</span>
            <span class="label">Riesgo Alto</span>
          </div>
          <div class="s-card yellow">
            <span class="count">{{getAlertCount('yellow')}}</span>
            <span class="label">Riesgo Medio</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="card patient-list-card">
          <div class="card-header">
            <h3>Pacientes Asignados</h3>
            <div class="search-box">
              <input type="text" placeholder="Buscar paciente...">
            </div>
          </div>

          <table class="patient-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Último Check-in</th>
                <th>Tendencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of mockPatients" (click)="selectedPatient = p" [class.selected]="selectedPatient?.id === p.id">
                <td>
                  <div class="p-info">
                    <div class="avatar">{{p.name[0].toUpperCase()}}</div>
                    <div>
                      <div class="p-name">{{p.name}}</div>
                      <div class="p-email">{{p.email}}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="getRiskLevel(p.id)">
                    {{getRiskLevel(p.id).toUpperCase()}}
                  </span>
                </td>
                <td>{{getLastCheckInDate(p.id)}}</td>
                <td>
                  <span class="trend" [class]="getTrend(p.id)">
                    {{getTrendIcon(p.id)}}
                  </span>
                </td>
                <td>
                  <button class="btn-sm">Ver Detalle</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card detail-card" *ngIf="selectedPatient">
          <div class="detail-header">
            <h3>Historial: {{selectedPatient.name}}</h3>
            <button class="btn btn-outline btn-sm">Contactar</button>
          </div>

          <div class="stats-overview">
             <div class="stat">
               <label>Promedio Ansiedad</label>
               <div class="val">{{getAverageAnxiety(selectedPatient.id)}}</div>
             </div>
             <div class="stat">
               <label>Nivel Energía</label>
               <div class="val">{{getAverageEnergy(selectedPatient.id)}}</div>
             </div>
          </div>

          <div class="checkin-history">
            <h4>Check-ins Recientes</h4>
            <div class="history-item" *ngFor="let c of getPatientCheckIns(selectedPatient.id)">
              <span class="h-date">{{c.timestamp | date:'dd/MM'}}</span>
              <span class="h-mood">{{c.mood}}</span>
              <span class="h-values">A:{{c.anxiety}} | E:{{c.energy}}</span>
              <p class="h-note" *ngIf="c.notes">"{{c.notes}}"</p>
            </div>
            <div *ngIf="getPatientCheckIns(selectedPatient.id).length === 0" class="empty">
              Sin registros.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .summary-cards { display: flex; gap: 1rem; }
    .s-card { padding: 1rem 2rem; border-radius: var(--radius-md); text-align: center; color: white; min-width: 120px; }
    .s-card.red { background: var(--risk-high); }
    .s-card.yellow { background: var(--risk-medium); }
    .s-card .count { display: block; font-size: 1.5rem; font-weight: 800; }
    .s-card .label { font-size: 0.7rem; text-transform: uppercase; }

    .main-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
    @media (max-width: 1024px) { .main-content { grid-template-columns: 1fr; } }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .search-box input { padding: 0.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }

    .patient-table { width: 100%; border-collapse: collapse; }
    .patient-table th { text-align: left; padding: 1rem; color: var(--text-muted); font-size: 0.8rem; border-bottom: 2px solid #f1f5f9; }
    .patient-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .patient-table tr:hover { background: #f8fafc; cursor: pointer; }
    .patient-table tr.selected { background: #eff6ff; }

    .p-info { display: flex; gap: 0.75rem; align-items: center; }
    .avatar { width: 36px; height: 36px; background: var(--primary-light); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .p-name { font-weight: 600; font-size: 0.9rem; }
    .p-email { font-size: 0.75rem; color: var(--text-muted); }

    .status-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 800; }
    .status-badge.low { background: #dcfce7; color: #15803d; }
    .status-badge.medium { background: #fef9c3; color: #a16207; }
    .status-badge.high { background: #fee2e2; color: #b91c1c; }

    .trend.up { color: var(--success); }
    .trend.down { color: var(--danger); }

    .detail-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .stats-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .stat { background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); text-align: center; }
    .stat label { font-size: 0.7rem; color: var(--text-muted); display: block; }
    .stat .val { font-size: 1.2rem; font-weight: 700; color: var(--primary); }

    .history-item { padding: 1rem; border-left: 2px solid var(--primary-light); background: #fcfcfc; margin-bottom: 0.5rem; border-radius: 0 8px 8px 0; }
    .h-date { font-weight: 800; font-size: 0.8rem; margin-right: 1rem; }
    .h-mood { text-transform: capitalize; font-size: 0.8rem; margin-right: 1rem; }
    .h-values { font-size: 0.75rem; color: var(--text-muted); }
    .h-note { font-style: italic; font-size: 0.85rem; margin-top: 0.5rem; color: #475569; }

    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
  `]
})
export class ProfessionalDashboardComponent implements OnInit {
  private dataService = inject(DataService);

  checkIns: CheckIn[] = [];
  alerts: Alert[] = [];
  selectedPatient: User | null = null;

  mockPatients: User[] = [
    { id: 'u1', name: 'Ana García', email: 'ana@ejemplo.com', role: 'youth', isVerified: true },
    { id: 'u2', name: 'Markel Etxeberria', email: 'markel@ejemplo.com', role: 'youth', isVerified: true },
    { id: 'u3', name: 'Lucía Sanz', email: 'lucia@ejemplo.com', role: 'youth', isVerified: true }
  ];

  ngOnInit() {
    this.checkIns = this.dataService.getCheckIns();
    this.alerts = this.dataService.getAlerts();
    if (this.mockPatients.length > 0) this.selectedPatient = this.mockPatients[0];
  }

  getAlertCount(severity: 'red' | 'yellow') {
    return this.alerts.filter(a => a.severity === severity && !a.resolved).length;
  }

  getRiskLevel(userId: string): 'low' | 'medium' | 'high' {
    const userAlerts = this.alerts.filter(a => a.userId === userId && !a.resolved);
    if (userAlerts.some(a => a.severity === 'red')) return 'high';
    if (userAlerts.length > 0) return 'medium';
    return 'low';
  }

  getLastCheckInDate(userId: string) {
    const userCi = this.checkIns.filter(c => c.userId === userId);
    if (userCi.length === 0) return 'Nunca';
    const last = userCi.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    return last.timestamp.toLocaleDateString();
  }

  getTrend(userId: string) {
    const userCi = this.checkIns.filter(c => c.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (userCi.length < 2) return 'stable';
    return userCi[0].anxiety > userCi[1].anxiety ? 'down' : 'up';
  }

  getTrendIcon(userId: string) {
    const t = this.getTrend(userId);
    return t === 'up' ? '📈 Mejorando' : t === 'down' ? '📉 Empeorando' : ' Estable';
  }

  getPatientCheckIns(userId: string) {
    return this.checkIns.filter(c => c.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAverageAnxiety(userId: string) {
    const userCi = this.checkIns.filter(c => c.userId === userId);
    if (userCi.length === 0) return 0;
    const sum = userCi.reduce((acc, c) => acc + c.anxiety, 0);
    return (sum / userCi.length).toFixed(1);
  }

  getAverageEnergy(userId: string) {
    const userCi = this.checkIns.filter(c => c.userId === userId);
    if (userCi.length === 0) return 0;
    const sum = userCi.reduce((acc, c) => acc + c.energy, 0);
    return (sum / userCi.length).toFixed(1);
  }
}
