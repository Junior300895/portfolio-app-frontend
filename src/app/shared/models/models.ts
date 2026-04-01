export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type EventCategory =
  'MARIAGE' | 'ANNIVERSAIRE' | 'CONFERENCE' | 'SEMINAIRE' |
  'CONCERT' | 'CORPORATE' | 'FAMILLE' | 'AUTRE';

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  category: EventCategory;
  featured: boolean;
  coverPhoto: string | null;
  photoCount: number;
  videoCount: number;
  createdAt: string;
}

export interface EventDetail extends EventSummary {
  photos: Photo[];
  videos: Video[];
}

export interface Photo {
  id: number;
  filePath: string;
  thumbnailPath: string;
  caption: string | null;
  isGalleryBest: boolean;
  sortOrder: number;
}

export interface Video {
  id: number;
  filePath: string;
  thumbnailPath: string | null;
  title: string;
  description: string | null;
  durationSeconds: number | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  eventType: string;
  eventDateRequested: string;
  read: boolean;
  sentAt: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  expiresIn: number;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  MARIAGE: 'Mariage',
  ANNIVERSAIRE: 'Anniversaire',
  CONFERENCE: 'Conférence',
  SEMINAIRE: 'Séminaire',
  CONCERT: 'Concert',
  CORPORATE: 'Corporate',
  FAMILLE: 'Famille',
  AUTRE: 'Autre'
};

// ── Galerie Privée ────────────────────────────────────────────

export interface PrivateGallery {
  id: number;
  eventId: number;
  eventTitle: string;
  accessToken: string;
  clientName: string;
  clientEmail: string | null;
  hasPassword: boolean;
  expiresAt: string | null;
  createdAt: string;
  downloadCount: number;
  viewCount: number;
  active: boolean;
  expired: boolean;
}

export interface PrivateGalleryContent {
  galleryId: number;
  clientName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  expiresAt: string | null;
  photos: Photo[];
  favoritePhotoIds: number[];
  totalPhotos: number;
}

export const CATEGORY_ICONS: Record<EventCategory, string> = {
  MARIAGE: '💍',
  ANNIVERSAIRE: '🎂',
  CONFERENCE: '🎤',
  SEMINAIRE: '📋',
  CONCERT: '🎵',
  CORPORATE: '🏢',
  FAMILLE: '👨‍👩‍👧',
  AUTRE: '📷'
};
