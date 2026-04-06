import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { EventService } from '@core/services/api.service';
import { EventDetail, CATEGORY_LABELS } from '@shared/models/models';

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
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  event = signal<EventDetail | null>(null);
  loading = signal(true);
  isPrivate = signal(false);
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  // Swipe
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 50; // px minimum pour valider un swipe

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEvent(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
        const title = `${data.title} — TIPEU PHOTOGRAPHY`;
        const desc = data.description
          ? data.description.substring(0, 155) + '...'
          : `Découvrez les photos de ${data.title} par TIPEU Photography.`;
        this.titleService.setTitle(title);
        this.metaService.updateTag({ name: 'description', content: desc });
        this.metaService.updateTag({ property: 'og:title', content: title });
        this.metaService.updateTag({ property: 'og:description', content: desc });
        this.metaService.updateTag({ property: 'og:url', content: `https://tipeu-photography.vercel.app/evenements/${id}` });
        if (data.coverPhoto) {
          this.metaService.updateTag({ property: 'og:image', content: data.coverPhoto });
          this.metaService.updateTag({ name: 'twitter:image', content: data.coverPhoto });
        }
      },
      error: (err) => {
        if (err.status === 403) this.isPrivate.set(true);
        this.loading.set(false);
      }
    });
  }

  // ── Lightbox ──────────────────────────────────────────────────

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  prevPhoto() {
    const i = this.lightboxIndex();
    this.lightboxIndex.set(i > 0 ? i - 1 : this.event()!.photos.length - 1);
  }

  nextPhoto() {
    const i = this.lightboxIndex();
    this.lightboxIndex.set(i < this.event()!.photos.length - 1 ? i + 1 : 0);
  }

  // ── Swipe tactile ─────────────────────────────────────────────

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;

    // Ignorer si le mouvement vertical est dominant (scroll)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return;

    if (deltaX < 0) {
      this.nextPhoto(); // swipe gauche → photo suivante
    } else {
      this.prevPhoto(); // swipe droite → photo précédente
    }
  }

  // ── Helpers ───────────────────────────────────────────────────

  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
}
