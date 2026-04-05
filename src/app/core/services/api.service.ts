import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  ApiResponse, PagedResponse, EventSummary, EventDetail,
  Photo, Video, ContactMessage, AuthResponse,
  PrivateGallery, PrivateGalleryContent
} from '@shared/models/models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  getEvents(page = 0, size = 12, category?: string): Observable<PagedResponse<EventSummary>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<PagedResponse<EventSummary>>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getEvent(id: number): Observable<EventDetail> {
    return this.http.get<ApiResponse<EventDetail>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  getFeatured(): Observable<EventSummary[]> {
    return this.http.get<ApiResponse<EventSummary[]>>(`${this.base}/featured`)
      .pipe(map(r => r.data));
  }

  getCategories(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.base}/categories`)
      .pipe(map(r => r.data));
  }

  search(q: string, page = 0): Observable<PagedResponse<EventSummary>> {
    const params = new HttpParams().set('q', q).set('page', page);
    return this.http.get<ApiResponse<PagedResponse<EventSummary>>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data));
  }
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);

  getBestPhotos(): Observable<Photo[]> {
    return this.http.get<ApiResponse<Photo[]>>(`${environment.apiUrl}/gallery/best`)
      .pipe(map(r => r.data));
  }
}

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private http = inject(HttpClient);

  send(data: any): Observable<ApiResponse<ContactMessage>> {
    return this.http.post<ApiResponse<ContactMessage>>(`${environment.apiUrl}/contact`, data);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminEventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/events`;

  getAll(page = 0, size = 20): Observable<PagedResponse<EventSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResponse<EventSummary>>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<EventDetail> {
    return this.http.get<ApiResponse<EventDetail>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  getStats(): Observable<{ totalEvents: number; totalPhotos: number; totalVideos: number }> {
    return this.http.get<ApiResponse<{ totalEvents: number; totalPhotos: number; totalVideos: number }>>(`${this.base}/stats`)
      .pipe(map(r => r.data));
  }

  create(data: any): Observable<EventDetail> {
    return this.http.post<ApiResponse<EventDetail>>(this.base, data).pipe(map(r => r.data));
  }

  update(id: number, data: any): Observable<EventDetail> {
    return this.http.put<ApiResponse<EventDetail>>(`${this.base}/${id}`, data).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadPhoto(eventId: number, file: File, caption?: string): Observable<Photo> {
    const fd = new FormData();
    fd.append('file', file);
    if (caption) fd.append('caption', caption);
    return this.http.post<ApiResponse<Photo>>(`${this.base}/${eventId}/photos`, fd)
      .pipe(map(r => r.data));
  }

  uploadVideo(eventId: number, file: File, title?: string, description?: string): Observable<Video> {
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    if (description) fd.append('description', description);
    return this.http.post<ApiResponse<Video>>(`${this.base}/${eventId}/videos`, fd)
      .pipe(map(r => r.data));
  }
}

@Injectable({ providedIn: 'root' })
export class AdminMediaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/media`;

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/photos/${id}`);
  }

  deleteVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/videos/${id}`);
  }

  toggleBest(id: number): Observable<Photo> {
    return this.http.put<ApiResponse<Photo>>(`${this.base}/photos/${id}/toggle-best`, {})
      .pipe(map(r => r.data));
  }
}

@Injectable({ providedIn: 'root' })
export class AdminContactService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/contacts`;

  getMessages(page = 0): Observable<PagedResponse<ContactMessage>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<ApiResponse<PagedResponse<ContactMessage>>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  markRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.base}/unread-count`)
      .pipe(map(r => r.data.count));
  }
}

@Injectable({ providedIn: 'root' })
export class PrivateGalleryApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/gallery/private`;
  private adminBase = `${environment.apiUrl}/admin/private-galleries`;

  // ── Client ──
  getInfo(token: string): Observable<{ requiresPassword: boolean }> {
    return this.http.get<ApiResponse<{ requiresPassword: boolean }>>(`${this.base}/${token}/info`)
      .pipe(map(r => r.data));
  }

  access(token: string, password?: string): Observable<PrivateGalleryContent> {
    return this.http.post<ApiResponse<PrivateGalleryContent>>(
      `${this.base}/${token}/access`,
      password ? { password } : {}
    ).pipe(map(r => r.data));
  }

  toggleFavorite(token: string, photoId: number): Observable<{ favorited: boolean }> {
    return this.http.post<ApiResponse<{ favorited: boolean }>>(
      `${this.base}/${token}/favorites/${photoId}`, {}
    ).pipe(map(r => r.data));
  }

  trackDownload(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${token}/download`, {});
  }

  // ── Admin ──
  create(data: any): Observable<PrivateGallery> {
    return this.http.post<ApiResponse<PrivateGallery>>(this.adminBase, data)
      .pipe(map(r => r.data));
  }

  getAll(page = 0, size = 20): Observable<PagedResponse<PrivateGallery>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PagedResponse<PrivateGallery>>>(this.adminBase, { params })
      .pipe(map(r => r.data));
  }

  deactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.adminBase}/${id}/deactivate`, {});
  }

  reactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.adminBase}/${id}/reactivate`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}
