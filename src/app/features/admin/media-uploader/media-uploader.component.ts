import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminEventService, AdminMediaService, EventService } from '@core/services/api.service';
import { EventDetail, Photo, Video } from '@shared/models/models';

interface UploadItem {
  file: File;
  preview: string;
  caption: string;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

@Component({
  selector: 'app-media-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './media-uploader.component.html',
  styleUrl: './media-uploader.component.css'
})
export class MediaUploaderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminEventService = inject(AdminEventService);
  private adminMediaService = inject(AdminMediaService);
  private eventService = inject(EventService);

  event = signal<EventDetail | null>(null);
  eventId = signal<number>(0);
  activeTab = signal<'photos' | 'videos'>('photos');
  isDragging = signal(false);
  uploadQueue = signal<UploadItem[]>([]);
  videoQueue = signal<UploadItem[]>([]);
  uploading = signal(false);
  uploadingVideos = signal(false);

  // Computed
  bestCount = computed(() => this.event()?.photos.filter(p => p.isGalleryBest).length ?? 0);
  pendingCount = computed(() => this.uploadQueue().filter(i => i.status === 'pending').length);
  doneCount = computed(() => this.uploadQueue().filter(i => i.status === 'done').length);
  globalProgress = computed(() => {
    const total = this.uploadQueue().length;
    if (!total) return 0;
    const done = this.doneCount();
    return Math.round((done / total) * 100);
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventId.set(id);
    this.loadEvent();
  }

  loadEvent() {
    this.eventService.getEvent(this.eventId()).subscribe(e => this.event.set(e));
  }

  onDrop(e: DragEvent, type: 'photos' | 'videos') {
    e.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.addFiles(files, type);
  }

  onFilesSelected(e: Event, type: 'photos' | 'videos') {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files, type);
    input.value = '';
  }

  addFiles(files: File[], type: 'photos' | 'videos') {
    const newItems: UploadItem[] = files.map(file => ({
      file,
      preview: type === 'photos' ? URL.createObjectURL(file) : '',
      caption: '',
      title: file.name.replace(/\.[^.]+$/, ''),
      status: 'pending',
      progress: 0
    }));
    if (type === 'photos') {
      this.uploadQueue.update(q => [...q, ...newItems]);
    } else {
      this.videoQueue.update(q => [...q, ...newItems]);
    }
  }

  removeFromQueue(i: number) {
    this.uploadQueue.update(q => q.filter((_, idx) => idx !== i));
  }
  removeVideoFromQueue(i: number) {
    this.videoQueue.update(q => q.filter((_, idx) => idx !== i));
  }
  clearDoneFromQueue() {
    this.uploadQueue.update(q => q.filter(i => i.status !== 'done'));
  }

  async startUpload() {
    if (this.uploading()) return;
    this.uploading.set(true);

    const queue = this.uploadQueue();
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done') continue;

      // Set uploading + simulate progress
      this.uploadQueue.update(q => {
        const copy = [...q];
        copy[i] = { ...copy[i], status: 'uploading', progress: 10 };
        return copy;
      });

      // Simulate progress increments
      const progressInterval = setInterval(() => {
        this.uploadQueue.update(q => {
          const copy = [...q];
          if (copy[i].status === 'uploading' && copy[i].progress < 85) {
            copy[i] = { ...copy[i], progress: copy[i].progress + 10 };
          }
          return copy;
        });
      }, 300);

      try {
        await this.adminEventService.uploadPhoto(this.eventId(), item.file, item.caption).toPromise();
        clearInterval(progressInterval);
        this.uploadQueue.update(q => {
          const copy = [...q];
          copy[i] = { ...copy[i], status: 'done', progress: 100 };
          return copy;
        });
      } catch (e: any) {
        clearInterval(progressInterval);
        this.uploadQueue.update(q => {
          const copy = [...q];
          copy[i] = { ...copy[i], status: 'error', progress: 0, error: e.error?.message ?? 'Erreur upload' };
          return copy;
        });
      }
    }

    this.uploading.set(false);
    this.loadEvent();
  }

  async startVideoUpload() {
    if (this.uploadingVideos()) return;
    this.uploadingVideos.set(true);

    const queue = this.videoQueue();
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done') continue;

      this.videoQueue.update(q => {
        const copy = [...q];
        copy[i] = { ...copy[i], status: 'uploading' };
        return copy;
      });

      try {
        await this.adminEventService.uploadVideo(this.eventId(), item.file, item.title).toPromise();
        this.videoQueue.update(q => {
          const copy = [...q];
          copy[i] = { ...copy[i], status: 'done' };
          return copy;
        });
      } catch (e: any) {
        this.videoQueue.update(q => {
          const copy = [...q];
          copy[i] = { ...copy[i], status: 'error', error: e.error?.message ?? 'Erreur upload' };
          return copy;
        });
      }
    }

    this.uploadingVideos.set(false);
    this.loadEvent();
    setTimeout(() => this.videoQueue.set([]), 3000);
  }

  toggleBest(photo: Photo) {
    this.adminMediaService.toggleBest(photo.id).subscribe(() => this.loadEvent());
  }

  deletePhoto(id: number) {
    if (!confirm('Supprimer cette photo définitivement ?')) return;
    this.adminMediaService.deletePhoto(id).subscribe(() => this.loadEvent());
  }

  deleteVideo(id: number) {
    if (!confirm('Supprimer cette vidéo définitivement ?')) return;
    this.adminMediaService.deleteVideo(id).subscribe(() => this.loadEvent());
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
