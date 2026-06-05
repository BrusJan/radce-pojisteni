import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  template: `
    <div class="page">
      <h2>Chat</h2>
    </div>
  `,
  styles: [`
    .page {
      padding: 32px;
      max-width: 1100px;
      margin: 0 auto;
    }
    h2 {
      margin: 0 0 4px;
      font-size: 22px;
      color: #1e293b;
    }
  `]
})
export class ChatComponent {}
