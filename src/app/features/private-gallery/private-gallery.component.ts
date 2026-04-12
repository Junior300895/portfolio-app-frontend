import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrivateGalleryApiService } from '@core/services/api.service';
import { PrivateGalleryContent, Photo } from '@shared/models/models';

@Component({
  selector: 'app-private-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './private-gallery.component.html',
  styleUrls: ['./private-gallery.component.css']
})
export class PrivateGalleryComponent implements OnInit {

  token = '';
  state = signal<'loading' | 'password' | 'gallery' | 'error'>('loading');
  errorMsg = signal('');
  gallery = signal<PrivateGalleryContent | null>(null);

  // Mot de passe
  passwordInput = '';
  passwordError = signal('');
  passwordLoading = signal(false);

  // Favoris
  favoriteIds = signal<Set<number>>(new Set());

  // Lightbox
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);
  lightboxPhoto = computed(() => {
    const g = this.gallery();
    if (!g) return null;
    return g.photos[this.lightboxIndex()] ?? null;
  });

  // Filtres
  showOnlyFavorites = signal(false);
  visiblePhotos = computed(() => {
    const g = this.gallery();
    if (!g) return [];
    if (this.showOnlyFavorites()) {
      return g.photos.filter(p => this.favoriteIds().has(p.id));
    }
    return g.photos;
  });

  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private api: PrivateGalleryApiService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.api.getInfo(this.token).subscribe({
      next: info => {
        if (info.requiresPassword) {
          this.state.set('password');
        } else {
          this.loadGallery();
        }
      },
      error: () => {
        this.errorMsg.set('Ce lien est invalide, expiré ou a été désactivé.');
        this.state.set('error');
      }
    });
  }

  submitPassword() {
    if (!this.passwordInput.trim()) return;
    this.passwordLoading.set(true);
    this.passwordError.set('');
    this.loadGallery(this.passwordInput);
  }

  private loadGallery(password?: string) {
    this.api.access(this.token, password).subscribe({
      next: content => {
        this.gallery.set(content);
        this.favoriteIds.set(new Set(content.favoritePhotoIds));
        this.state.set('gallery');
        this.passwordLoading.set(false);
      },
      error: (err) => {
        this.passwordLoading.set(false);
        if (err.status === 403 || err.status === 401) {
          this.passwordError.set('Mot de passe incorrect, réessayez.');
        } else {
          this.errorMsg.set('Ce lien est invalide, expiré ou a été désactivé.');
          this.state.set('error');
        }
      }
    });
  }

  // ── Lightbox ──

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  prevPhoto() {
    const photos = this.visiblePhotos();
    const i = this.lightboxIndex();
    this.lightboxIndex.set(i > 0 ? i - 1 : photos.length - 1);
  }

  nextPhoto() {
    const photos = this.visiblePhotos();
    const i = this.lightboxIndex();
    this.lightboxIndex.set(i < photos.length - 1 ? i + 1 : 0);
  }

  // ── Swipe tactile ──

  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 50;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) return;
    if (deltaX < 0) {
      this.nextPhoto();
    } else {
      this.prevPhoto();
    }
  }

  // ── Favoris ──

  toggleFavorite(photo: Photo, event: Event) {
    event.stopPropagation();
    this.api.toggleFavorite(this.token, photo.id).subscribe(res => {
      const ids = new Set(this.favoriteIds());
      if (res.favorited) ids.add(photo.id);
      else ids.delete(photo.id);
      this.favoriteIds.set(ids);
    });
  }

  isFavorite(id: number) {
    return this.favoriteIds().has(id);
  }

  // ── Téléchargement ──

  downloadPhoto(photo: Photo, event: Event) {
    event.stopPropagation();
    this.api.trackDownload(this.token).subscribe();
    this.downloadUrl(photo.filePath, `photo-${photo.id}.jpg`);
  }

  downloadAll() {
    const g = this.gallery();
    if (!g) return;
    this.api.trackDownload(this.token).subscribe();
    g.photos.forEach((p, i) => {
      setTimeout(() => {
        this.downloadUrl(p.filePath, `photo-${p.id}.jpg`);
      }, i * 800);
    });
  }

  private downloadUrl(url: string, filename: string) {
    fetch(url)
      .then(res => res.blob())
      .then(async blob => {
        if (!isPlatformBrowser(this.platformId)) return;

        const mimeType = blob.type || 'image/jpeg';
        const file = new File([blob], filename, { type: mimeType });

        // Web Share API — enregistre dans la galerie photo sur mobile
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Photo TIPEU Photography'
            });
            return;
          } catch (err: any) {
            // Annulé par l'utilisateur
            if (err?.name === 'AbortError') return;
          }
        }

        // Fallback desktop : téléchargement classique
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      })
      .catch(() => {
        if (isPlatformBrowser(this.platformId)) { window.open(url, '_blank'); }
      });
  }

  get expiresLabel(): string {
    const g = this.gallery();
    if (!g?.expiresAt) return 'Accès permanent';
    const d = new Date(g.expiresAt);
    return `Expire le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }

  get favoriteCount(): number {
    return this.favoriteIds().size;
  }
}
