import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'evenements',
    loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: 'evenements/:id',
    loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: 'galerie',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'galerie-privee/:token',
    loadComponent: () => import('./features/private-gallery/private-gallery.component').then(m => m.PrivateGalleryComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'tarifs',
    loadComponent: () => import('./features/tarifs/tarifs.component').then(m => m.TarifsComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'evenements',
        loadComponent: () => import('./features/admin/event-list/admin-event-list.component').then(m => m.AdminEventListComponent)
      },
      {
        path: 'evenements/nouveau',
        loadComponent: () => import('./features/admin/event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'evenements/:id/modifier',
        loadComponent: () => import('./features/admin/event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'evenements/:id/medias',
        loadComponent: () => import('./features/admin/media-uploader/media-uploader.component').then(m => m.MediaUploaderComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/admin/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'galeries-privees',
        loadComponent: () => import('./features/admin/private-galleries/admin-private-galleries.component').then(m => m.AdminPrivateGalleriesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
