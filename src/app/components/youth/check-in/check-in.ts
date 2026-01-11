import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckIn } from '../../../models';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkin-container animate-fade">
      <div class="card glass">
        <header class="checkin-header">
          <h1>{{ t().title }}</h1>
          <p>{{ t().subtitle }}</p>
        </header>

        <form (submit)="save()">
          <!-- Mood Selection -->
          <div class="form-section">
            <label class="section-label">{{ t().moodLabel }}</label>
            <div class="mood-selector">
              <button type="button" *ngFor="let m of moods" 
                [class.active]="mood === m.id"
                (click)="setMood(m.id)"
                class="mood-btn">
                <span class="mood-emoji">{{ m.emoji }}</span>
                <span class="mood-name">{{ getMoodTranslation(m.id) }}</span>
              </button>
            </div>
          </div>

          <!-- Sliders -->
          <div class="form-section">
            <div class="slider-group">
              <div class="slider-header">
                <label>{{ t().anxiety }}</label>
                <span class="slider-value" [style.color]="getAnxietyColor()">{{ anxiety }}</span>
              </div>
              <input type="range" [(ngModel)]="anxiety" name="anxiety" min="1" max="10" step="1">
              <div class="slider-labels">
                <span>{{ t().calm }}</span>
                <span>{{ t().anxious }}</span>
              </div>
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <label>{{ t().energy }}</label>
                <span class="slider-value" [style.color]="getEnergyColor()">{{ energy }}</span>
              </div>
              <input type="range" [(ngModel)]="energy" name="energy" min="1" max="10" step="1">
              <div class="slider-labels">
                <span>{{ t().tired }}</span>
                <span>{{ t().active }}</span>
              </div>
            </div>
          </div>

          <!-- Extra -->
          <div class="form-section">
            <label class="checkbox-container">
              <input type="checkbox" [(ngModel)]="sleptWell" name="sleptWell">
              <span class="checkmark"></span>
              {{ t().sleep }}
            </label>
          </div>

          <div class="form-section">
            <label class="section-label">{{ t().notesLabel }}</label>
            <textarea [(ngModel)]="notes" name="notes" [placeholder]="t().notesPlaceholder"></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            {{ t().saveBtn }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .checkin-container {
      max-width: 600px;
      margin: 2rem auto;
    }
    .checkin-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .checkin-header h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
    
    .form-section { margin-bottom: 2rem; }
    .section-label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .mood-selector {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0.5rem;
      background: white;
      border: 2px solid #f1f5f9;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }
    .mood-btn:hover { border-color: var(--primary-light); background: #f8fafc; }
    .mood-btn.active {
      border-color: var(--primary);
      background: #f0f7ff;
      transform: scale(1.05);
    }
    .mood-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
    .mood-name { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }
    .mood-btn.active .mood-name { color: var(--primary); }

    .slider-group { margin-bottom: 1.5rem; }
    .slider-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .slider-value { font-size: 1.2rem; font-weight: 800; }
    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
    }

    textarea {
      width: 100%;
      height: 100px;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      resize: none;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 600;
    }
    input[type="range"] {
      width: 100%;
      accent-color: var(--primary);
    }
  `]
})
export class CheckInComponent {
  dataService = inject(DataService);
  router = inject(Router);

  mood: CheckIn['mood'] = 'happy';
  anxiety = 5;
  energy = 5;
  sleptWell = true;
  notes = '';

  moods = [
    { id: 'very-happy', emoji: '🤩' },
    { id: 'happy', emoji: '😊' },
    { id: 'neutral', emoji: '😐' },
    { id: 'sad', emoji: '😔' }
  ];

  translations = {
    es: {
      title: 'Tu Momento',
      subtitle: 'Tómate un segundo para escucharte',
      moodLabel: '¿Cómo te sientes en este momento?',
      moods: {
        'very-happy': 'Genial',
        'happy': 'Bien',
        'neutral': 'Normal',
        'sad': 'Mal'
      },
      anxiety: 'Nivel de Ansiedad',
      energy: 'Nivel de Energía',
      calm: 'Calma',
      anxious: 'Ansiedad',
      tired: 'Agotado',
      active: 'Activo',
      sleep: 'He dormido bien hoy',
      notesLabel: '¿Quieres añadir algo más?',
      notesPlaceholder: 'Escribe tus pensamientos aquí...',
      saveBtn: 'Guardar Evolución'
    },
    eu: {
      title: 'Zure unea',
      subtitle: 'Hartu tarte bat zure buruaz jabetzeko',
      moodLabel: 'Nola sentitzen zara une honetan?',
      moods: {
        'very-happy': 'Oso ondo',
        'happy': 'Ondo',
        'neutral': 'Normal',
        'sad': 'Gaizki'
      },
      anxiety: 'Ansietate maila',
      energy: 'Energia maila',
      calm: 'Lasai',
      anxious: 'Ansietatea',
      tired: 'Leituta',
      active: 'Aktibo',
      sleep: 'Ondo lo egin dut gaur',
      notesLabel: 'Zerbait gehiago gehitu nahi duzu?',
      notesPlaceholder: 'Idatzi zure pentsamenduak hemen...',
      saveBtn: 'Eboluzioa Gorde'
    }
  };

  t = () => this.translations[this.dataService.lang()];

  getMoodTranslation(id: string): string {
    const moods = this.t().moods as any;
    return moods[id] || id;
  }

  setMood(id: string) {
    this.mood = id as any;
  }

  getAnxietyColor() {
    if (this.anxiety > 7) return 'var(--danger)';
    if (this.anxiety > 4) return 'var(--warning)';
    return 'var(--success)';
  }

  getEnergyColor() {
    if (this.energy > 7) return 'var(--success)';
    if (this.energy > 4) return 'var(--primary)';
    return 'var(--danger)';
  }

  save() {
    this.dataService.saveCheckIn({
      mood: this.mood,
      anxiety: this.anxiety,
      energy: this.energy,
      sleptWell: this.sleptWell,
      notes: this.notes
    });
    this.router.navigate(['/youth']);
  }
}
