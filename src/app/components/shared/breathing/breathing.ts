import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breathing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="breathing-container">
      <h3>Respiración Guiada</h3>
      <p class="instruction">{{stateText}}</p>
      
      <div class="circle-container" [class]="state">
        <div class="circle outer"></div>
        <div class="circle middle"></div>
        <div class="circle inner"></div>
      </div>
      
      <div class="timer">{{timer}}s</div>
    </div>
  `,
  styles: [`
    .breathing-container { text-align: center; }
    h3 { margin-bottom: 1rem; color: var(--primary); }
    .instruction { font-size: 1.2rem; font-weight: 600; margin-bottom: 2rem; color: var(--text-muted); min-height: 1.5em; }
    
    .circle-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: var(--primary);
      opacity: 0.2;
      transition: all 4s ease-in-out;
    }

    .outer { width: 100%; height: 100%; opacity: 0.1; }
    .middle { width: 70%; height: 70%; opacity: 0.3; }
    .inner { width: 40%; height: 40%; opacity: 0.6; }

    /* Animation States */
    .inhale .circle { transform: scale(1.2); background: var(--accent); }
    .hold .circle { transform: scale(1.2); background: var(--primary); }
    .exhale .circle { transform: scale(0.8); background: var(--secondary); }

    .timer { font-size: 2rem; font-weight: 800; color: var(--text-main); }
  `]
})
export class BreathingComponent implements OnInit, OnDestroy {
  state: 'inhale' | 'hold' | 'exhale' = 'inhale';
  stateText = 'Inhala suavemente...';
  timer = 4;
  private intervalId: any;

  ngOnInit() {
    this.startCycle();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCycle() {
    this.intervalId = setInterval(() => {
      this.timer--;

      if (this.timer <= 0) {
        if (this.state === 'inhale') {
          this.state = 'hold';
          this.stateText = 'Mantén el aire...';
          this.timer = 4;
        } else if (this.state === 'hold') {
          this.state = 'exhale';
          this.stateText = 'Exhala despacio...';
          this.timer = 4;
        } else {
          this.state = 'inhale';
          this.stateText = 'Inhala suavemente...';
          this.timer = 4;
        }
      }
    }, 1000);
  }
}
