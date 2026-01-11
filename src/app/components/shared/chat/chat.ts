import { Component, inject, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../data.service';
import { AiService } from '../../../ai.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-wrapper">
      <div class="chat-header">
        <div class="bot-info">
          <div class="avatar">🤖</div>
          <div>
            <h3>MIND AI</h3>
            <span class="status">{{ t().online }}</span>
          </div>
        </div>
      </div>

      <div class="chat-messages" #scrollContainer>
        <div class="message-group" *ngFor="let m of messages" [class.user]="m.isUser">
          <div class="message-bubble">
            <div class="content">{{m.text}}</div>
            <div class="time">{{m.time | date:'HH:mm'}}</div>
          </div>
        </div>
        
        <div class="message-group bot" *ngIf="isTyping">
          <div class="message-bubble typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
      
      <div class="chat-input-area">
        <input 
          [(ngModel)]="currentText" 
          (keyup.enter)="sendMessage()" 
          [placeholder]="t().placeholder"
          [disabled]="isTyping">
        <button (click)="sendMessage()" [disabled]="!currentText || isTyping">
          <span class="icon">🚀</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .chat-header {
      padding: 1rem 1.5rem;
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .bot-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .bot-info h3 { margin: 0; font-size: 1.1rem; }
    .status { font-size: 0.75rem; opacity: 0.8; display: flex; align-items: center; gap: 4px; }
    .status::before { content: ''; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; display: inline-block; }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: #f8fafc;
    }

    .message-group {
      display: flex;
      max-width: 85%;
    }

    .message-group.user {
      align-self: flex-end;
    }

    .message-bubble {
      padding: 0.8rem 1.2rem;
      border-radius: 18px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      position: relative;
    }

    .user .message-bubble {
      background: var(--primary);
      color: white;
      border-bottom-right-radius: 2px;
    }

    .bot .message-bubble {
      background: white;
      color: var(--text-main);
      border-bottom-left-radius: 2px;
      border: 1px solid #e2e8f0;
    }

    .content { line-height: 1.5; font-size: 0.95rem; }
    .time { font-size: 0.65rem; opacity: 0.6; margin-top: 0.4rem; text-align: right; }

    .typing {
      display: flex;
      gap: 4px;
      padding: 1rem;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #cbd5e1;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .chat-input-area {
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
    }

    input {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      border: 1px solid #e2e8f0;
      outline: none;
      transition: border-color 0.2s;
    }

    input:focus { border-color: var(--primary); }

    button {
      width: 45px;
      height: 45px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    button:hover:not(:disabled) { transform: scale(1.1); }
    button:disabled { background: #cbd5e1; cursor: not-allowed; }
  `]
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private dataService = inject(DataService);
  private aiService = inject(AiService);
  private cdr = inject(ChangeDetectorRef);

  messages: any[] = [];
  currentText = '';
  isTyping = false;

  translations = {
    es: {
      online: 'En línea para apoyarte',
      placeholder: 'Escribe cómo te sientes...',
      welcome: 'Hola, soy tu asistente de apoyo de MIND. Estoy aquí para escucharte y ayudarte a calmarte. ¿Cómo te sientes en este momento?',
      online_status: 'Online'
    },
    eu: {
      online: 'Zuri laguntzeko konektatuta',
      placeholder: 'Idatzi nola sentitzen zaren...',
      welcome: 'Kaixo, MINDeko zure laguntzailea naiz. Hemen nago zuri entzuteko eta lasaitzen laguntzeko. Nola sentitzen zara gaur?',
      online_status: 'Konektatuta'
    }
  };

  constructor() {
    this.initWelcomeMessage();
  }

  initWelcomeMessage() {
    setTimeout(() => {
      this.messages = [
        { text: this.t().welcome, isUser: false, time: new Date() }
      ];
    }, 100);
  }

  t = () => this.translations[this.dataService.lang()];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  async sendMessage() {
    if (!this.currentText || this.isTyping) return;

    const userText = this.currentText;
    this.messages.push({ text: userText, isUser: true, time: new Date() });
    this.currentText = '';
    this.isTyping = true;
    this.scrollToBottom();

    try {
      const response = await this.aiService.getChatResponse(userText, {
        role: this.dataService.currentUser()?.role || 'youth',
        lang: this.dataService.lang()
      });

      this.messages.push({
        text: response,
        isUser: false,
        time: new Date()
      });
    } catch (err) {
      this.messages.push({
        text: this.dataService.lang() === 'es' ? 'Lo siento, no he podido conectar.' : 'Barkatu, ezin izan dut konektatu.',
        isUser: false,
        time: new Date()
      });
    } finally {
      this.isTyping = false;
      // Force change detection update
      this.cdr.detectChanges();
      setTimeout(() => {
        this.scrollToBottom();
        this.cdr.detectChanges();
      }, 50);
    }
  }
}
