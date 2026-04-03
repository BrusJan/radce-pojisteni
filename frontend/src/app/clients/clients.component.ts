import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { ApiResponse, Client, ClientRequest } from '../shared/models/api.model';

type FormMode = 'hidden' | 'create' | 'edit';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Klienti</h2>
          <p>Správa vašich pojišťovacích klientů</p>
        </div>
        <button class="btn-primary" (click)="openCreate()">+ Přidat klienta</button>
      </div>

      <!-- Form modal -->
      <div class="modal-backdrop" *ngIf="formMode !== 'hidden'" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ formMode === 'create' ? 'Nový klient' : 'Upravit klienta' }}</h3>

          <div class="form-grid">
            <div class="form-field">
              <label>Jméno *</label>
              <input [(ngModel)]="form.firstName" placeholder="Jméno" />
            </div>
            <div class="form-field">
              <label>Příjmení *</label>
              <input [(ngModel)]="form.lastName" placeholder="Příjmení" />
            </div>
            <div class="form-field">
              <label>E-mail</label>
              <input [(ngModel)]="form.email" type="email" placeholder="email@example.com" />
            </div>
            <div class="form-field">
              <label>Telefon</label>
              <input [(ngModel)]="form.phone" placeholder="+420 xxx xxx xxx" />
            </div>
            <div class="form-field">
              <label>Datum narození</label>
              <input [(ngModel)]="form.birthDate" type="date" />
            </div>
            <div class="form-field full-width">
              <label>Adresa</label>
              <input [(ngModel)]="form.address" placeholder="Ulice, město, PSČ" />
            </div>
            <div class="form-field full-width">
              <label>Poznámky</label>
              <textarea [(ngModel)]="form.notes" rows="3" placeholder="Interní poznámky..."></textarea>
            </div>
          </div>

          <div class="error-banner" *ngIf="formError">{{ formError }}</div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeForm()">Zrušit</button>
            <button class="btn-primary" (click)="save()" [disabled]="saving">
              {{ saving ? 'Ukládání...' : (formMode === 'create' ? 'Vytvořit' : 'Uložit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <h3>Smazat klienta?</h3>
          <p>Opravdu chcete smazat klienta <strong>{{ deleteTarget.firstName }} {{ deleteTarget.lastName }}</strong>? Tato akce je nevratná.</p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="deleteTarget = null">Zrušit</button>
            <button class="btn-danger" (click)="confirmDelete()">Smazat</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card" *ngIf="!loading">
        <div class="empty-state" *ngIf="clients.length === 0">
          <span>👥</span>
          <p>Zatím žádní klienti. Přidejte prvního!</p>
        </div>

        <table class="data-table" *ngIf="clients.length > 0">
          <thead>
            <tr>
              <th>Jméno</th>
              <th>E-mail</th>
              <th>Telefon</th>
              <th>Datum nar.</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clients">
              <td><strong>{{ c.lastName }} {{ c.firstName }}</strong></td>
              <td>{{ c.email || '—' }}</td>
              <td>{{ c.phone || '—' }}</td>
              <td>{{ c.birthDate ? (c.birthDate | date:'dd.MM.yyyy') : '—' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" (click)="openEdit(c)" title="Upravit">✏️</button>
                <button class="btn-icon btn-icon-danger" (click)="deleteTarget = c" title="Smazat">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="loading">Načítání...</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h2 { margin: 0 0 4px; font-size: 22px; color: #1e293b; }
    p { margin: 0; color: #64748b; font-size: 14px; }

    .card { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; color: #374151; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }
    .actions-cell { display: flex; gap: 6px; }

    .empty-state { padding: 60px; text-align: center; color: #94a3b8; font-size: 32px; }
    .empty-state p { font-size: 14px; margin-top: 8px; }

    .loading { padding: 40px; text-align: center; color: #64748b; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 600px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-sm { max-width: 400px; }
    .modal h3 { margin: 0 0 24px; font-size: 18px; color: #1e293b; }
    .modal p { color: #64748b; margin-bottom: 24px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field.full-width { grid-column: span 2; }
    .form-field label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-field input, .form-field textarea {
      padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 14px; outline: none; font-family: inherit; resize: vertical;
    }
    .form-field input:focus, .form-field textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
    .error-banner { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 14px; }

    .btn-primary { padding: 9px 20px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .btn-secondary { padding: 9px 20px; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-secondary:hover { background: #f9fafb; }
    .btn-danger { padding: 9px 20px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-danger:hover { background: #dc2626; }
    .btn-icon { padding: 6px 8px; background: transparent; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon-danger:hover { background: #fef2f2; border-color: #fca5a5; }
  `]
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  loading = true;
  formMode: FormMode = 'hidden';
  formError = '';
  saving = false;
  editingId: number | null = null;
  deleteTarget: Client | null = null;

  form: ClientRequest = this.emptyForm();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  private emptyForm(): ClientRequest {
    return { firstName: '', lastName: '', email: '', phone: '', birthDate: null, address: '', notes: '' };
  }

  load(): void {
    this.loading = true;
    this.http.get<ApiResponse<Client[]>>(`${environment.apiBaseUrl}/clients`).subscribe({
      next: (r) => { this.clients = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formError = '';
    this.editingId = null;
    this.formMode = 'create';
  }

  openEdit(c: Client): void {
    this.form = {
      firstName: c.firstName, lastName: c.lastName, email: c.email ?? '',
      phone: c.phone ?? '', birthDate: c.birthDate, address: c.address ?? '', notes: c.notes ?? ''
    };
    this.formError = '';
    this.editingId = c.id;
    this.formMode = 'edit';
  }

  closeForm(): void { this.formMode = 'hidden'; }

  save(): void {
    if (!this.form.firstName || !this.form.lastName) {
      this.formError = 'Jméno a příjmení jsou povinné';
      return;
    }
    this.saving = true;
    this.formError = '';

    const req = this.formMode === 'create'
      ? this.http.post<ApiResponse<Client>>(`${environment.apiBaseUrl}/clients`, this.form)
      : this.http.put<ApiResponse<Client>>(`${environment.apiBaseUrl}/clients/${this.editingId}`, this.form);

    req.subscribe({
      next: () => { this.saving = false; this.closeForm(); this.load(); },
      error: () => { this.formError = 'Chyba při ukládání'; this.saving = false; }
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.http.delete<ApiResponse<void>>(`${environment.apiBaseUrl}/clients/${this.deleteTarget.id}`).subscribe({
      next: () => { this.deleteTarget = null; this.load(); },
      error: () => { this.deleteTarget = null; }
    });
  }
}
