import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminEventService } from '@core/services/api.service';
import { EventSummary, CATEGORY_LABELS } from '@shared/models/models';

@Component({
  selector: 'app-admin-event-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-event-list.component.html',
  styleUrl: './admin-event-list.component.css'
})
export class AdminEventListComponent implements OnInit {
  private adminEventService = inject(AdminEventService);

  events = signal<EventSummary[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  deleteTarget = signal<EventSummary | null>(null);
  deleting = signal(false);

  ngOnInit() { this.load(0); }

  load(page: number) {
    this.loading.set(true);
    this.adminEventService.getAll(page, 15).subscribe({
      next: (data) => {
        this.events.set(data.content);
        this.currentPage.set(data.page);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  confirmDelete(event: EventSummary) { this.deleteTarget.set(event); }

  doDelete() {
    if (!this.deleteTarget()) return;
    this.deleting.set(true);
    this.adminEventService.delete(this.deleteTarget()!.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.load(this.currentPage());
      },
      error: () => this.deleting.set(false)
    });
  }

  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  formatDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
}
