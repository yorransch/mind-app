import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-messages" #scrollMe [scrollTop]="scrollMe.scrollHeight">
        <div class="message" *ngFor="let m of messages" [class.user]="m.isUser">
          <div class="content">{{m.text}}</div>
          <div class="time">{{m.time | date:'HH:mm'}}</div>
        </div>
        <div class="message bot" *ngIf="isTyping">
          <div class="content typing">...</div>
        </div>
      </div>
      
      <div class="chat-input">
        <input [(ngModel)]="currentText" (keyup.enter)="sendMessage()" placeholder="Escribe tu mensaje...">
        <button (click)="sendMessage()" [disabled]="!currentText">Enviar</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { height: 400px; display: flex; flex-direction: column; }
    .chat-messages { flex-grow: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    
    .message { max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; position: relative; font-size: 0.9rem; }
    .message.user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 2px; }
    .message.bot { align-self: flex-start; background: #f1f5f9; color: var(--text-main); border-bottom-left-radius: 2px; }
    
    .time { font-size: 0.6rem; opacity: 0.7; margin-top: 0.2rem; text-align: right; }
    .content.typing { font-weight: 800; letter-spacing: 2px; }

    .chat-input { display: flex; padding: 1rem; border-top: 1px solid #f1f5f9; gap: 0.5rem; }
    input { flex-grow: 1; padding: 0.6rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    button { background: var(--primary); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
    button:disabled { opacity: 0.5; }
  `]
})
export class ChatComponent {
  messages = [
    { text: 'Hola, soy tu asistente de apoyo. ¿Cómo te sientes en este momento?', isUser: false, time: new Date() }
  ];
  currentText = '';
  isTyping = false;

  sendMessage() {
    if (!this.currentText) return;

    const text = this.currentText;
    this.messages.push({ text, isUser: true, time: new Date() });
    this.currentText = '';
    this.isTyping = true;

    // Simulate AI response
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({
        text: this.getAiResponse(text),
        isUser: false,
        time: new Date()
      });
    }, 1500);
  }

  getAiResponse(input: string): string {
    const LowerInput = input.toLowerCase();
    if (LowerInput.includes('triste') || LowerInput.includes('mal')) {
      return 'Siento mucho que te sientas así. Recuerda que es normal tener días grises. ¿Hay algo específico que haya pasado?';
    }
    if (LowerInput.includes('ansiedad') || LowerInput.includes('nervios')) {
      return 'Entiendo. Tu cuerpo está en modo alerta. ¿Te gustaría que hagamos juntos un ejercicio de respiración?';
    }
    return 'Gracias por compartirlo. Estoy aquí para escucharte. ¿Qué más tienes en mente?';
  }
}
