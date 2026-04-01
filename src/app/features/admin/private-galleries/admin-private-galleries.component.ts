import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivateGalleryApiService, AdminEventService } from '@core/services/api.service';
import { PrivateGallery, EventSummary } from '@shared/models/models';
import { environment } from '@env/environment';

@Component({
  selector: 'app-admin-private-galleries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-private-galleries.component.html',
  styleUrls: ['./admin-private-galleries.component.css']
})
export class AdminPrivateGalleriesComponent implements OnInit {

  galleries = signal<PrivateGallery[]>([]);
  events = signal<EventSummary[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  currentPage = signal(0);

  // Formulaire de création
  showForm = signal(false);
  formLoading = signal(false);
  formError = signal('');
  form = {
    eventId: null as number | null,
    clientName: '',
    clientEmail: '',
    password: '',
    expirationDays: 30 as number | null
  };

  // Lien copié
  copiedToken = signal('');

  constructor(
    private api: PrivateGalleryApiService,
    private eventService: AdminEventService
  ) {}

  ngOnInit() {
    this.loadGalleries();
    this.loadEvents();
  }

  loadGalleries(page = 0) {
    this.loading.set(true);
    this.api.getAll(page).subscribe({
      next: res => {
        this.galleries.set(res.content);
        this.totalElements.set(res.totalElements);
        this.currentPage.set(res.page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadEvents() {
    this.eventService.getAll(0, 100).subscribe({
      next: res => this.events.set(res.content)
    });
  }

  openForm() {
    this.form = { eventId: null, clientName: '', clientEmail: '', password: '', expirationDays: 30 };
    this.formError.set('');
    this.showForm.set(true);
  }

  submitForm() {
    if (!this.form.eventId || !this.form.clientName.trim()) {
      this.formError.set('L\'événement et le nom du client sont obligatoires.');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');
    this.api.create({
      eventId: this.form.eventId,
      clientName: this.form.clientName,
      clientEmail: this.form.clientEmail || null,
      password: this.form.password || null,
      expirationDays: this.form.expirationDays
    }).subscribe({
      next: () => {
        this.showForm.set(false);
        this.formLoading.set(false);
        this.loadGalleries();
      },
      error: () => {
        this.formError.set('Une erreur est survenue. Réessayez.');
        this.formLoading.set(false);
      }
    });
  }

  deactivate(gallery: PrivateGallery) {
    if (!confirm(`Désactiver la galerie de ${gallery.clientName} ?`)) return;
    this.api.deactivate(gallery.id).subscribe(() => this.loadGalleries(this.currentPage()));
  }

  delete(gallery: PrivateGallery) {
    if (!confirm(`Supprimer définitivement la galerie de ${gallery.clientName} ? Cette action est irréversible.`)) return;
    this.api.delete(gallery.id).subscribe(() => this.loadGalleries(this.currentPage()));
  }

  getGalleryUrl(token: string): string {
    return `${window.location.origin}/galerie-privee/${token}`;
  }

  copyLink(token: string) {
    navigator.clipboard.writeText(this.getGalleryUrl(token)).then(() => {
      this.copiedToken.set(token);
      setTimeout(() => this.copiedToken.set(''), 2000);
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Permanent';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  get pages(): number[] {
    const total = Math.ceil(this.totalElements() / 20);
    return Array.from({ length: total }, (_, i) => i);
  }
}
