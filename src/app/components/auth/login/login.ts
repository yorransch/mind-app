import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container animate-fade">
      <div class="card glass">
        <div class="brand">
          <h1>MIND</h1>
          <p>{{ t().subtitle }}</p>
        </div>

        <div class="mode-selector" *ngIf="!showVerification()">
          <button (click)="isLoginMode = true" [class.active]="isLoginMode">{{ t().loginTab }}</button>
          <button (click)="isLoginMode = false" [class.active]="!isLoginMode">{{ t().registerTab }}</button>
        </div>
        
        <!-- Formulario de Login / Registro -->
        <form (submit)="onSubmit()" *ngIf="!showVerification()">
          <div class="form-group" *ngIf="!isLoginMode">
            <label>{{ t().fullName }}</label>
            <input type="text" [(ngModel)]="name" name="name" required [placeholder]="t().namePlaceholder">
          </div>

          <div class="form-group">
            <label>{{ t().email }}</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="tu@email.com">
          </div>

          <div class="form-group">
            <label>{{ t().password }}</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••">
          </div>
          
          <div class="role-selector" *ngIf="!isLoginMode">
            <label>{{ t().roleLabel }}</label>
            <div class="roles">
              <button type="button" 
                [class.active]="role === 'youth'" 
                (click)="role = 'youth'">
                {{ t().youth }}
              </button>
              <button type="button" 
                [class.active]="role === 'professional'" 
                (click)="role = 'professional'">
                {{ t().professional }}
              </button>
            </div>
          </div>
          
          <div class="error-msg" *ngIf="error()">{{error()}}</div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" [disabled]="isLoading()">
            {{ isLoginMode ? (isLoading() ? t().loadingLogin : t().loginTab) : (isLoading() ? t().loadingRegister : t().registerTab) }}
          </button>

          <div class="divider">
            <span>{{ t().or }}</span>
          </div>

          <button type="button" (click)="loginGoogle()" class="btn btn-google" style="width: 100%" [disabled]="isLoading()">
            <img *ngIf="!isLoading()" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" alt="Google" width="18">
            {{ isLoading() ? t().loadingGoogle : t().googleBtn }}
          </button>
        </form>

        <!-- Formulario de Verificación -->
        <div class="verification-step animate-fade" *ngIf="showVerification()">
          <div class="step-header">
            <h3>{{ t().verifyTitle }}</h3>
            <p>{{ t().verifySent }} <strong>{{email}}</strong></p>
            <p class="hint">({{ t().verifyHint }}: <strong>123456</strong>)</p>
          </div>

          <div class="form-group">
            <label>{{ t().verifyLabel }}</label>
            <input type="text" [(ngModel)]="verificationCode" maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 5px;" placeholder="000000">
          </div>

          <div class="error-msg" *ngIf="error()">{{error()}}</div>

          <button class="btn btn-primary" style="width: 100%;" (click)="onVerify()">{{ t().verifyConfirm }}</button>
          <button class="btn-link" (click)="showVerification.set(false)" style="display: block; width: 100%; margin-top: 1rem; border: none; background: none; color: var(--primary); cursor: pointer;">{{ t().back }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e0e7ff 0%, #fef2f2 100%);
    }
    .card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
    }
    .brand {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand h1 {
      font-size: 2.5rem;
      letter-spacing: 4px;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    .mode-selector {
      display: flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 2rem;
    }
    .mode-selector button {
      flex: 1;
      padding: 0.6rem;
      border: none;
      background: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    .mode-selector button.active {
      background: white;
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }
    .form-group {
      margin-bottom: 1.2rem;
    }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      font-size: 1rem;
    }
    .role-selector {
      margin-bottom: 1.5rem;
    }
    .roles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .roles button {
      padding: 0.6rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .roles button.active {
      border-color: var(--primary);
      background: var(--primary);
      color: white;
    }
    .error-msg {
      color: var(--danger);
      background: #fee2e2;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
    }
    .divider::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e2e8f0;
      z-index: 1;
    }
    .divider span {
      background: white;
      padding: 0 0.75rem;
      color: var(--text-muted);
      font-size: 0.8rem;
      position: relative;
      z-index: 2;
    }
    .btn-google {
      background: white;
      border: 1px solid #e2e8f0;
      color: var(--text-main);
    }
    .btn-google:hover {
      background: #f8fafc;
    }
  `]
})
export class LoginComponent {
  dataService = inject(DataService);
  isLoginMode = true;
  showVerification = signal(false);
  verificationCode = '';
  isLoading = signal(false);
  error = signal<string | null>(null);

  private translations = {
    es: {
      subtitle: 'Tu bienestar, nuestra prioridad',
      loginTab: 'Iniciar Sesión',
      registerTab: 'Registrarse',
      fullName: 'Nombre Completo',
      namePlaceholder: 'Ej: Juan Pérez',
      email: 'Email',
      password: 'Contraseña',
      roleLabel: 'Soy...',
      youth: 'Joven',
      professional: 'Profesional',
      or: 'o',
      googleBtn: 'Acceder con Gmail',
      loadingLogin: 'Entrando...',
      loadingRegister: 'Registrando...',
      loadingGoogle: 'Conectando...',
      verifyTitle: 'Verifica tu Email',
      verifySent: 'Hemos enviado un código a',
      verifyHint: 'Simulación',
      verifyLabel: 'Código de 6 dígitos',
      verifyConfirm: 'Confirmar Email',
      back: 'Volver',
      errFill: 'Por favor, completa todos los campos.',
      errEmail: 'Por favor, introduce un email válido.',
      errGeneric: 'Ocurrió un error inesperado.',
      errCode: 'Introduce el código enviado.'
    },
    eu: {
      subtitle: 'Zure ongizatea, gure lehentasuna',
      loginTab: 'Saioa hasi',
      registerTab: 'Erregistratu',
      fullName: 'Izen osoa',
      namePlaceholder: 'Adib: Juan Pérez',
      email: 'Emaila',
      password: 'Pasahitza',
      roleLabel: 'Naiz...',
      youth: 'Gaztea',
      professional: 'Profesionala',
      or: 'edo',
      googleBtn: 'Gmail-rekin sartu',
      loadingLogin: 'Sartzen...',
      loadingRegister: 'Erregistratzen...',
      loadingGoogle: 'Konektatzen...',
      verifyTitle: 'Egiaztatu zure Emaila',
      verifySent: 'Kode bat bidali dugu hona:',
      verifyHint: 'Simulazioa',
      verifyLabel: '6 digituko kodea',
      verifyConfirm: 'Emaila egiaztatu',
      back: 'Itzuli',
      errFill: 'Mesedez, bete eremu guztiak.',
      errEmail: 'Mesedez, sartu baliozko email bat.',
      errGeneric: 'Ustekabeko errorea gertatu da.',
      errCode: 'Sartu bidalitako kodea.'
    }
  };

  t = () => this.translations[this.dataService.lang()];

  name = '';
  email = '';
  password = '';
  role: 'youth' | 'professional' = 'youth';

  private router = inject(Router);

  onSubmit() {
    this.error.set(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.error.set(this.t().errFill);
      return;
    }

    if (!emailRegex.test(this.email)) {
      this.error.set(this.t().errEmail);
      return;
    }

    this.isLoading.set(true);

    try {
      if (this.isLoginMode) {
        const res = this.dataService.loginWithPassword(this.email, this.password);
        if (res.success) {
          this.navigateToDashboard();
        } else if (res.message === 'PENDING_VERIFICATION') {
          this.showVerification.set(true);
        } else {
          this.error.set(res.message);
        }
      } else {
        const res = this.dataService.register(this.name, this.email, this.password, this.role);
        if (res.success) {
          this.showVerification.set(true);
        } else {
          this.error.set(res.message);
        }
      }
    } catch (e) {
      console.error('Error durante el proceso:', e);
      this.error.set(this.t().errGeneric);
    } finally {
      this.isLoading.set(false);
    }
  }

  loginGoogle() {
    this.error.set(null);
    const promptedEmail = prompt(this.dataService.lang() === 'es' ? 'Introduce tu cuenta de Gmail:' : 'Sartu zure Gmail kontua:', 'usuario@gmail.com');
    if (!promptedEmail || !promptedEmail.includes('@')) {
      return;
    }

    this.isLoading.set(true);

    try {
      this.dataService.loginWithGoogle(this.role, promptedEmail, promptedEmail.split('@')[0]);
      this.navigateToDashboard();
    } catch (e) {
      this.error.set(this.t().errGeneric);
    } finally {
      this.isLoading.set(false);
    }
  }

  onVerify() {
    this.error.set(null);
    if (!this.verificationCode) {
      this.error.set(this.t().errCode);
      return;
    }

    const res = this.dataService.verifyEmail(this.email, this.verificationCode);
    if (res.success) {
      this.navigateToDashboard();
    } else {
      this.error.set(res.message);
    }
  }

  private navigateToDashboard() {
    const user = this.dataService.currentUser();
    const target = user?.role === 'youth' ? '/youth' : '/professional';
    this.router.navigate([target]);
  }
}
