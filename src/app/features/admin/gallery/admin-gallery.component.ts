import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService, AdminMediaService } from '@core/services/api.service';
import { Photo } from '@shared/models/models';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.css']
})
export class AdminGalleryComponent implements OnInit {
  private gallery = inject(GalleryService);
  private media = inject(AdminMediaService);

  photos = signal<Photo[]>([]);
  loading = signal(true);
  deletingId = signal<number | null>(null);

  count = computed(() => this.photos().length);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.gallery.getBestPhotos(true).subscribe({
      next: p => { this.photos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  remove(photo: Photo) {
    if (!confirm('Retirer définitivement cette photo de la galerie best-of ?')) return;
    this.deletingId.set(photo.id);
    this.media.deleteGalleryPhoto(photo.id).subscribe({
      next: () => {
        this.photos.update(list => list.filter(p => p.id !== photo.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        alert('La suppression a échoué. Réessayez.');
      }
    });
  }
}
