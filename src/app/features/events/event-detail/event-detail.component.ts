import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '@core/services/api.service';
import { EventDetail, Photo, CATEGORY_LABELS } from '@shared/models/models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
  })
export class EventDetailComponent implements OnInit {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);

  event = signal<EventDetail | null>(null);
  loading = signal(true);
  isPrivate = signal(false);
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEvent(id).subscribe({
      next: (data) => { this.event.set(data); this.loading.set(false); },
      error: (err) => {
        if (err.status === 403) this.isPrivate.set(true);
        this.loading.set(false);
      }
    });
  }

  openLightbox(index: number) { this.lightboxIndex.set(index); this.lightboxOpen.set(true); }
  closeLightbox() { this.lightboxOpen.set(false); }
  prevPhoto() { const i = this.lightboxIndex(); this.lightboxIndex.set(i > 0 ? i - 1 : this.event()!.photos.length - 1); }
  nextPhoto() { const i = this.lightboxIndex(); this.lightboxIndex.set(i < this.event()!.photos.length - 1 ? i + 1 : 0); }

  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
}
