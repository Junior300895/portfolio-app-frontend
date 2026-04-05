import { Component, OnInit, inject, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { GalleryService } from '@core/services/api.service';
import { Photo } from '@shared/models/models';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  photos = signal<Photo[]>([]);
  loading = signal(true);
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  ngOnInit() {
    this.titleService.setTitle('Galerie Best-Of — TIPEU PHOTOGRAPHY');
    this.metaService.updateTag({ name: 'description', content: 'La sélection best-of de TIPEU Photography : les plus belles photos de mariages, conférences, concerts et anniversaires à Dakar.' });
    this.metaService.updateTag({ property: 'og:title', content: 'Galerie Best-Of — TIPEU PHOTOGRAPHY' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://tipeu-photography.vercel.app/galerie' });

    this.galleryService.getBestPhotos().subscribe({
      next: (data) => { this.photos.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openLightbox(i: number) { this.lightboxIndex.set(i); this.lightboxOpen.set(true); }
  closeLightbox() { this.lightboxOpen.set(false); }
  prev() { const i = this.lightboxIndex(); this.lightboxIndex.set(i > 0 ? i - 1 : this.photos().length - 1); }
  next() { const i = this.lightboxIndex(); this.lightboxIndex.set(i < this.photos().length - 1 ? i + 1 : 0); }
}
