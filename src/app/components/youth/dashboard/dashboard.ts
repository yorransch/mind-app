import { Component, inject } from '@angular/core';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreathingComponent } from '../../shared/breathing/breathing';
import { ChatComponent } from '../../shared/chat/chat';

@Component({
  selector: 'app-youth-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BreathingComponent, ChatComponent],
  template: `
    <div class="dashboard-container animate-fade">
      <header class="dashboard-header">
        <div class="welcome-section">
          <h1>{{ t().hi }}, {{ user()?.name }}! 👋</h1>
          <p>{{ t().subtitle }} | 📍 <strong>Vitoria-Gasteiz</strong></p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ user()?.points || 0 }}</span>
            <span class="stat-label">✨ {{ t().points }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ checkIns().length }}</span>
            <span class="stat-label">📝 {{ t().checks }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">0</span>
            <span class="stat-label">🔥 {{ t().streak }}</span>
          </div>
        </div>
      </header>

      <section class="alert-banner" *ngIf="activeAlert()">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <h3>{{ t().alertTitle }}</h3>
            <p>{{ t().alertBody }}</p>
          </div>
        </div>
        <div class="alert-actions">
          <button class="btn btn-danger" (click)="callEmergency()">📞 024</button>
          <button class="btn btn-white" (click)="showBreathing = true">🧘 {{ t().relax }}</button>
        </div>
      </section>

      <main class="dashboard-grid">
        <section class="card history-card">
          <div class="card-header">
            <h2>📊 {{ t().evolution }}</h2>
            <button class="btn btn-primary btn-sm" (click)="newCheckIn()">+ {{ t().newCheck }}</button>
          </div>
          <div class="history-list">
            <div class="history-item" *ngFor="let item of checkIns()" (click)="viewDetail(item)">
              <div class="history-mood">{{ getMoodEmoji(item.mood) }}</div>
              <div class="history-info">
                <span class="history-date">{{ item.timestamp | date:'short' }}</span>
                <div class="history-metrics">
                  <span class="badge anxiety">{{ t().anxiety }}: {{ item.anxiety }}</span>
                  <span class="badge energy">{{ t().energy }}: {{ item.energy }}</span>
                </div>
              </div>
              <button class="btn-delete" (click)="deleteItem(item.id); $event.stopPropagation()" [title]="t().delete">🗑️</button>
            </div>
            <div *ngIf="checkIns().length === 0" class="empty-state">
               {{ t().noData }}
            </div>
          </div>
        </section>

        <section class="card diary-card">
          <div class="card-header">
            <h2>📖 {{ t().diaryTitle }}</h2>
          </div>
          <div class="diary-input-area">
            <textarea [(ngModel)]="diaryContent" [placeholder]="t().diaryPlaceholder" rows="3"></textarea>
            <button class="btn btn-primary btn-sm" (click)="saveDiary()" [disabled]="!diaryContent.trim()">{{ t().saveBtn }}</button>
          </div>
          <div class="diary-list">
             <div class="diary-item" *ngFor="let entry of diaryEntries()">
                <div class="diary-header">
                    <span class="diary-date">{{ entry.timestamp | date:'short' }}</span>
                    <button class="btn-delete" (click)="deleteDiary(entry.id); $event.stopPropagation()" [title]="t().delete">🗑️</button>
                </div>
                <div class="diary-content">{{ entry.content }}</div>
             </div>
             <div *ngIf="diaryEntries().length === 0" class="empty-state">
                {{ t().diaryEmpty }}
             </div>
          </div>
        </section>

        <section class="card quick-actions">
          <h2>⚡ {{ t().quick }}</h2>
          <div class="actions-grid">
            <button class="action-btn" (click)="showBreathing = true">
              <span class="action-icon">🧘</span>
              <span>{{ t().breathe }}</span>
            </button>
            <button class="action-btn" (click)="showChat = true">
              <span class="action-icon">💬</span>
              <span>{{ t().supportChat }}</span>
            </button>
            <button class="action-btn" (click)="callEmergency()">
              <span class="action-icon">🆘</span>
              <span>{{ t().emergency }}</span>
            </button>
          </div>
        </section>
      </main>

      <!-- Modales -->
      <div class="modal-overlay" *ngIf="showBreathing" (click)="showBreathing = false">
        <div class="modal-content glass" (click)="$event.stopPropagation()">
          <app-breathing></app-breathing>
          <button class="btn btn-primary" (click)="showBreathing = false">{{ t().close }}</button>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showChat" (click)="showChat = false">
        <div class="modal-content chat-modal glass" (click)="$event.stopPropagation()">
          <app-chat></app-chat>
          <button class="btn btn-primary" (click)="showChat = false" style="margin-top: 1rem">{{ t().close }}</button>
        </div>
      </div>


      <!-- Modal de Detalle de Registro -->
      <div class="modal-overlay" *ngIf="selectedCheckIn" (click)="selectedCheckIn = null">
        <div class="modal-content detail-modal glass animate-fade" (click)="$event.stopPropagation()">
          <header class="detail-header">
            <span class="detail-emoji">{{ getMoodEmoji(selectedCheckIn.mood) }}</span>
            <h2>{{ t().detailTitle }}</h2>
            <p>{{ selectedCheckIn.timestamp | date:'long' }}</p>
          </header>
          
          <div class="detail-body">
            <div class="detail-grid">
              <div class="detail-stat">
                <label>{{ t().anxiety }}</label>
                <div class="val">{{ selectedCheckIn.anxiety }}/10</div>
              </div>
              <div class="detail-stat">
                <label>{{ t().energy }}</label>
                <div class="val">{{ selectedCheckIn.energy }}/10</div>
              </div>
            </div>
            
            <div class="detail-sleep">
               <span>🌙 {{ selectedCheckIn.sleptWell ? t().sleepYes : t().sleepNo }}</span>
            </div>

            <div class="detail-notes" *ngIf="selectedCheckIn.notes">
              <label>{{ t().notesLabel }}</label>
              <p>"{{ selectedCheckIn.notes }}"</p>
            </div>
          </div>
          
          <button class="btn btn-primary" (click)="selectedCheckIn = null">{{ t().close }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem 0;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 2rem;
    }
    .welcome-section h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--text-main);
    }
    .stats-grid {
      display: flex;
      gap: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
    }
    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .btn-delete {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
      opacity: 0.6;
    }
    .btn-delete:hover {
      background: #fee2e2;
      opacity: 1;
    }
    .alert-banner {
      background: var(--danger);
      color: white;
      padding: 1.5rem;
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
    }
    .alert-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .alert-icon { font-size: 2rem; }
    .alert-text h3 { margin: 0; font-size: 1.25rem; }
    .alert-text p { margin: 0; opacity: 0.9; }
    .alert-actions { display: flex; gap: 1rem; }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .history-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
    }
    .history-mood { font-size: 1.5rem; }
    .history-info { flex: 1; }
    .history-date { font-size: 0.8rem; color: var(--text-muted); display: block; }
    .history-metrics { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
    
    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .action-icon { font-size: 2rem; margin-bottom: 0.5rem; }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .modal-content {
      max-width: 600px;
      width: 100%;
      background: white;
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .chat-modal {
      max-width: 800px;
      height: 70vh;
      display: flex;
      flex-direction: column;
    }

    .detail-modal {
      text-align: left;
      max-width: 500px;
    }
    .detail-header { text-align: center; margin-bottom: 2rem; }
    .detail-emoji { font-size: 4rem; display: block; margin-bottom: 0.5rem; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .detail-stat { background: #f1f5f9; padding: 1rem; border-radius: 12px; text-align: center; }
    .detail-stat label { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
    .detail-stat .val { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    .detail-sleep { margin-bottom: 1.5rem; font-weight: 600; text-align: center; color: var(--text-main); }
    .detail-notes { background: #f8fafc; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; border-left: 4px solid var(--primary); }
    .detail-notes label { font-weight: 800; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.5rem; }
    .detail-notes p { font-style: italic; color: var(--text-main); margin: 0; }
    .history-item { cursor: pointer; transition: transform 0.2s; }
    .history-item:hover { transform: translateX(5px); background: #f1f5f9; }

    @media (max-width: 992px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .dashboard-header { flex-direction: column; align-items: stretch; }
    }
    
    .diary-input-area {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    .diary-input-area textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: var(--radius-md);
        resize: vertical;
        font-family: inherit;
        background: #fff;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .diary-input-area textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .diary-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
        padding-right: 0.5rem;
    }
    .diary-item {
        background: #f8fafc;
        padding: 1rem;
        border-radius: var(--radius-md);
        border-left: 4px solid var(--primary);
        animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .diary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .diary-date {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
    }
    .diary-content {
        white-space: pre-wrap;
        color: var(--text-main);
        line-height: 1.5;
    }
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-muted);
        font-style: italic;
        background: #f8fafc;
        border-radius: var(--radius-md);
        border: 2px dashed #e2e8f0;
    }
  `]
})
export class YouthDashboardComponent {
  dataService = inject(DataService);
  router = inject(Router);
  user = this.dataService.currentUser;
  checkIns = this.dataService.checkInsSignal;
  diaryEntries = this.dataService.diarySignal;
  diaryContent = '';

  showBreathing = false;
  showChat = false;

  translations = {
    es: {
      hi: '¡Hola',
      subtitle: '¿Cómo te sientes hoy?',
      points: 'Puntos',
      checks: 'Registros',
      streak: 'Días',
      alertTitle: 'Estamos aquí para ti',
      alertBody: 'Vemos que has tenido picos de ansiedad. ¿Hablamos?',
      relax: 'Relajación',
      evolution: 'Evolución Técnica',
      newCheck: 'Nuevo Check-in',
      noData: 'Aún no hay registros hoy.',
      quick: 'Acciones Rápidas',
      breathe: 'Respirar',
      supportChat: 'Chat de Apoyo',
      emergency: 'Emergencias',
      close: 'Cerrar',
      anxiety: 'Ansiedad',
      energy: 'Energía',
      sleep: 'He dormido bien hoy',
      notesLabel: '¿Quieres añadir algo más?',
      notesPlaceholder: 'Escribe tus pensamientos aquí...',
      saveBtn: 'Guardar Evolución',
      delete: 'Eliminar registro',
      detailTitle: 'Detalle del Registro',
      sleepYes: 'Descansé bien',
      sleepNo: 'No descansé bien',
      diaryTitle: 'Mini Diario Personal',
      diaryPlaceholder: 'Escribe aquí lo que te preocupa o lo que te ha hecho sentir mejor hoy...',
      diaryEmpty: 'Tu diario está vacío. ¡Empieza a escribir!',
    },
    eu: {
      hi: 'Kaixo',
      subtitle: 'Nola sentitzen zara gaur?',
      points: 'Puntuak',
      checks: 'Erregistroak',
      streak: 'Egunak',
      alertTitle: 'Hemen gaude zuretzat',
      alertBody: 'Ansietate gailurrak izan dituzula ikusi dugu. Hitz egingo dugu?',
      relax: 'Erlajazioa',
      evolution: 'Eboluzio Teknikoa',
      newCheck: 'Check-in Berria',
      noData: 'Gaur oraindik ez dago erregistrorik.',
      quick: 'Ekintza Azkarrak',
      breathe: 'Arnasa hartu',
      supportChat: 'Laguntza Txata',
      emergency: 'Larrialdiak',
      close: 'Itxi',
      anxiety: 'Ansietatea',
      energy: 'Energia',
      delete: 'Ezabatu erregistroa',
      detailTitle: 'Erregistroaren xehetasuna',
      sleepYes: 'Ondo deskantsatu dut',
      sleepNo: 'Ez dut ondo deskantsatu',
      notesLabel: 'Oharrak',
      saveBtn: 'Gorde',
      diaryTitle: 'Eguneroko Txikia',
      diaryPlaceholder: 'Idatzi hemen kezkatzen zaituena edo gaur hobeto sentiarazi zaituena...',
      diaryEmpty: 'Zure egunerokoa hutsik dago. Hasi idazten!',
    }
  };

  t = () => this.translations[this.dataService.lang()];

  activeAlert = () => {
    const alerts = this.dataService.getAlerts();
    return alerts.find(a => !a.resolved);
  };

  getMoodEmoji(mood: string) {
    const moods: any = { 'very-happy': '🤩', 'happy': '😊', 'neutral': '😐', 'sad': '😔' };
    return moods[mood] || '😶';
  }

  newCheckIn() {
    this.router.navigate(['/youth/check-in']);
  }

  deleteItem(id: string) {
    if (confirm(this.lang() === 'es' ? '¿Seguro que quieres eliminar este registro?' : 'Ziur zaude erregistro hau ezabatu nahi duzula?')) {
      this.dataService.deleteCheckIn(id);
    }
  }

  lang() {
    return this.dataService.lang();
  }

  viewDetail(item: any) {
    this.selectedCheckIn = item;
  }

  selectedCheckIn: any = null;

  callEmergency() {
    window.open('tel:024');
  }

  saveDiary() {
    if (!this.diaryContent.trim()) return;
    this.dataService.saveDiaryEntry(this.diaryContent);
    this.diaryContent = '';
  }

  deleteDiary(id: string) {
    if (confirm(this.lang() === 'es' ? '¿Borrar esta entrada?' : 'Sarrera hau ezabatu?')) {
      this.dataService.deleteDiaryEntry(id);
    }
  }

}
