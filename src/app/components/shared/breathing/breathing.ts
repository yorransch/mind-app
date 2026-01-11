import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';

@Component({
  selector: 'app-breathing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="breathing-container">
      <header class="header">
        <h3>{{ t().title }}</h3>
        <p class="instruction">{{ currentStateText }}</p>
      </header>
      
      <div class="visualizer">
        <!-- Círculo que respira - Animación pura CSS para máxima fluidez -->
        <div class="breathing-circle" [attr.data-state]="state">
          <div class="inner-content">
            <span class="seconds">{{ timer }}</span>
          </div>
          
          <!-- Efecto de aura/pulso -->
          <div class="aura"></div>
        </div>

        <!-- Anillo de progreso suave -->
        <svg class="progress-svg" width="280" height="280">
          <circle 
            class="bg-ring"
            cx="140" cy="140" r="120"
            stroke-width="4"
            fill="transparent"
          />
          <circle 
            class="active-ring"
            [class]="state"
            cx="140" cy="140" r="120"
            stroke-width="8"
            fill="transparent"
            [style.stroke-dashoffset]="smoothOffset"
          />
        </svg>
      </div>

      <div class="footer-indicators">
        <div class="phase-badge" [class.active]="state === 'inhale'">
          <span>↑</span> {{ t().inhale }}
        </div>
        <div class="phase-badge" [class.active]="state === 'hold'">
          <span>●</span> {{ t().hold }}
        </div>
        <div class="phase-badge" [class.active]="state === 'exhale'">
          <span>↓</span> {{ t().exhale }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .breathing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      user-select: none;
    }

    .header { margin-bottom: 2rem; }
    h3 { font-size: 1.2rem; color: var(--primary); font-weight: 800; margin-bottom: 0.5rem; }
    .instruction { font-size: 1.6rem; font-weight: 700; color: var(--text-main); height: 2rem; }

    .visualizer {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .breathing-circle {
      position: relative;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 4s cubic-bezier(0.45, 0.05, 0.55, 0.95);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
    }

    /* Animación Automática por Atributo */
    .breathing-circle[data-state="inhale"] {
      transform: scale(1.8);
      background: var(--accent);
      box-shadow: 0 15px 50px rgba(20, 184, 166, 0.4);
    }
    .breathing-circle[data-state="hold"] {
      transform: scale(1.8);
      background: var(--primary);
      box-shadow: 0 15px 50px rgba(99, 102, 241, 0.4);
    }
    .breathing-circle[data-state="exhale"] {
      transform: scale(1);
      background: var(--secondary);
      box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
    }

    .inner-content {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .seconds {
      font-size: 2rem;
      font-weight: 900;
      color: var(--text-main);
    }

    .aura {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: inherit;
      opacity: 0.3;
      z-index: -1;
      animation: pulseAura 2s infinite ease-out;
    }

    @keyframes pulseAura {
      0% { transform: scale(1); opacity: 0.3; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    /* Anillo de Progreso */
    .progress-svg {
      position: absolute;
      transform: rotate(-90deg);
    }
    .bg-ring { stroke: #f1f5f9; }
    .active-ring {
      stroke-dasharray: 754; /* 2 * PI * 120 */
      transition: stroke-dashoffset 0.1s linear, stroke 0.5s;
    }
    .active-ring.inhale { stroke: var(--accent); }
    .active-ring.hold { stroke: var(--primary); }
    .active-ring.exhale { stroke: var(--secondary); }

    .footer-indicators {
      display: flex;
      gap: 0.75rem;
    }
    .phase-badge {
      padding: 0.5rem 1rem;
      border-radius: 30px;
      background: #f1f5f9;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 700;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .phase-badge.active {
      background: var(--primary);
      color: white;
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
  `]
})
export class BreathingComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);

  state: 'inhale' | 'hold' | 'exhale' = 'inhale';
  timer = 4;
  ms = 4000; // Milisegundos para suavidad extrema
  private intervalId: any;

  translations = {
    es: {
      title: 'Respiración Guiada',
      inhale: 'Inhala',
      hold: 'Mantén',
      exhale: 'Exhala'
    },
    eu: {
      title: 'Arnasketa Gidatua',
      inhale: 'Hartu',
      hold: 'Eutsi',
      exhale: 'Bota'
    }
  };

  t = () => this.translations[this.dataService.lang()];

  get currentStateText() {
    const isEs = this.dataService.lang() === 'es';
    if (this.state === 'inhale') return isEs ? 'Inhala suavemente...' : 'Hartu arnasa poliki...';
    if (this.state === 'hold') return isEs ? 'Mantén el aire...' : 'Eutsi aireari...';
    return isEs ? 'Exhala despacio...' : 'Bota arnasa motel...';
  }

  // Offset súper suave actualizado cada 100ms
  get smoothOffset() {
    const circumference = 754;
    const progress = this.ms / 4000;
    return circumference - (progress * circumference);
  }

  ngOnInit() {
    this.startCycle();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCycle() {
    // Actualizamos cada 100ms para que el anillo sea totalmente fluido
    this.intervalId = setInterval(() => {
      this.ms -= 100;
      this.timer = Math.ceil(this.ms / 1000);

      if (this.ms <= 0) {
        if (this.state === 'inhale') this.state = 'hold';
        else if (this.state === 'hold') this.state = 'exhale';
        else this.state = 'inhale';

        this.ms = 4000;
        this.timer = 4;
      }
    }, 100);
  }
}
