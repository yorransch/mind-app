import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 MIND - Tu apoyo emocional en red. Disponible en <span class="badge">Español</span> y <span class="badge">Euskera</span>.</p>
      </div>
    </footer>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 160px);
      padding-bottom: 4rem;
    }
    .footer {
      padding: 2rem 0;
      background: white;
      text-align: center;
      color: var(--text-muted);
      border-top: 1px solid #f1f5f9;
      font-size: 0.8rem;
    }
    .badge {
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
    }
  `]
})
export class App { }
