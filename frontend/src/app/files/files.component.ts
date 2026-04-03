import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { ApiResponse, AdvisorFile } from '../shared/models/api.model';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Soubory</h2>
          <p>Správa dokumentů a souborů</p>
        </div>
        <label class="btn-primary upload-btn">
          <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv" style="display:none" multiple />
          + Nahrát soubor
        </label>
      </div>

      <!-- Upload progress -->
      <div class="upload-progress" *ngIf="uploading">
        <div class="progress-bar">
          <div class="progress-fill" [style.width]="uploadProgress + '%'"></div>
        </div>
        <span>Nahrávání... {{ uploadProgress }}%</span>
      </div>

      <!-- Delete confirm -->
      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Smazat soubor?</h3>
          <p>Opravdu chcete smazat <strong>{{ deleteTarget.originalName }}</strong>? Tato akce je nevratná.</p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="deleteTarget = null">Zrušit</button>
            <button class="btn-danger" (click)="confirmDelete()">Smazat</button>
          </div>
        </div>
      </div>

      <div class="card" *ngIf="!loading">
        <div class="empty-state" *ngIf="files.length === 0">
          <span>📁</span>
          <p>Žádné soubory. Nahrajte první dokument!</p>
        </div>

        <table class="data-table" *ngIf="files.length > 0">
          <thead>
            <tr>
              <th>Název souboru</th>
              <th>Typ</th>
              <th>Velikost</th>
              <th>Nahráno</th>
              <th>Veřejný</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of files">
              <td>
                <span class="file-icon">{{ fileIcon(f.mimeType) }}</span>
                {{ f.originalName }}
              </td>
              <td class="mime-type">{{ shortMime(f.mimeType) }}</td>
              <td>{{ formatSize(f.sizeBytes) }}</td>
              <td>{{ f.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
              <td>
                <button
                  class="toggle-btn"
                  [class.toggle-on]="f.isPublic"
                  (click)="togglePublic(f)"
                  [title]="f.isPublic ? 'Označit jako soukromý' : 'Označit jako veřejný'"
                >
                  {{ f.isPublic ? '🌍 Veřejný' : '🔒 Soukromý' }}
                </button>
              </td>
              <td class="actions-cell">
                <a class="btn-icon" [href]="downloadUrl(f)" download title="Stáhnout">⬇️</a>
                <button class="btn-icon btn-icon-danger" (click)="deleteTarget = f" title="Smazat">🗑️</button>
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

    .upload-btn { cursor: pointer; display: inline-block; }

    .upload-progress { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
    .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
    .progress-fill { height: 100%; background: #6366f1; border-radius: 3px; transition: width .3s; }

    .card { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 13px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; color: #374151; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }

    .file-icon { margin-right: 6px; }
    .mime-type { color: #94a3b8; font-size: 12px; }
    .actions-cell { display: flex; gap: 6px; align-items: center; }

    .toggle-btn {
      padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
      cursor: pointer; border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
      transition: all .15s;
    }
    .toggle-btn.toggle-on { background: #ecfdf5; border-color: #6ee7b7; color: #059669; }
    .toggle-btn:hover { opacity: .8; }

    .empty-state { padding: 60px; text-align: center; color: #94a3b8; font-size: 32px; }
    .empty-state p { font-size: 14px; margin-top: 8px; }
    .loading { padding: 40px; text-align: center; color: #64748b; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal h3 { margin: 0 0 16px; font-size: 18px; color: #1e293b; }
    .modal p { color: #64748b; margin-bottom: 24px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

    .btn-primary { padding: 9px 20px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { padding: 9px 20px; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-secondary:hover { background: #f9fafb; }
    .btn-danger { padding: 9px 20px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-danger:hover { background: #dc2626; }
    .btn-icon { padding: 6px 8px; background: transparent; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; text-decoration: none; }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon-danger:hover { background: #fef2f2; border-color: #fca5a5; }
  `]
})
export class FilesComponent implements OnInit {
  files: AdvisorFile[] = [];
  loading = true;
  uploading = false;
  uploadProgress = 0;
  deleteTarget: AdvisorFile | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<ApiResponse<AdvisorFile[]>>(`${environment.apiBaseUrl}/files`).subscribe({
      next: (r) => { this.files = r.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach(file => this.uploadFile(file));
    input.value = '';
  }

  uploadFile(file: File): void {
    const form = new FormData();
    form.append('file', file);
    this.uploading = true;
    this.uploadProgress = 0;

    this.http.post<ApiResponse<AdvisorFile>>(`${environment.apiBaseUrl}/files`, form, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.load();
        }
      },
      error: () => { this.uploading = false; }
    });
  }

  togglePublic(f: AdvisorFile): void {
    this.http.patch<ApiResponse<AdvisorFile>>(
      `${environment.apiBaseUrl}/files/${f.id}/public`,
      { isPublic: !f.isPublic }
    ).subscribe({ next: () => this.load() });
  }

  downloadUrl(f: AdvisorFile): string {
    return `${environment.apiBaseUrl}/files/${f.id}/download`;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.http.delete<ApiResponse<void>>(`${environment.apiBaseUrl}/files/${this.deleteTarget.id}`).subscribe({
      next: () => { this.deleteTarget = null; this.load(); },
      error: () => { this.deleteTarget = null; }
    });
  }

  fileIcon(mime: string | null): string {
    if (!mime) return '📄';
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('word') || mime.includes('document')) return '📘';
    if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) return '📗';
    if (mime.includes('text')) return '📄';
    return '📎';
  }

  shortMime(mime: string | null): string {
    if (!mime) return '—';
    const parts = mime.split('/');
    return parts[parts.length - 1].toUpperCase().replace('VND.OPENXMLFORMATS-OFFICEDOCUMENT.', '').replace('WORDPROCESSINGML.DOCUMENT', 'DOCX').replace('SPREADSHEETML.SHEET', 'XLSX');
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
