import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { AdminEventService, AdminContactService } from '@core/services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private adminEventService = inject(AdminEventService);
  private adminContactService = inject(AdminContactService);

  sidebarOpen = signal(false);
  totalEvents = signal(0);
  unreadMessages = signal(0);
  pageTitle = 'Administration';

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  private pageTitles: Record<string, string> = {
    '/admin': 'Tableau de bord',
    '/admin/evenements': 'Mes événements',
    '/admin/evenements/nouveau': 'Nouvel événement',
    '/admin/messages': 'Messages de contact',
  };

  ngOnInit() {
    this.loadCounts();
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.updateTitle(e.urlAfterRedirects);
      this.sidebarOpen.set(false);
      this.loadCounts();
    });
  }

  private loadCounts() {
    this.adminEventService.getAll(0, 1).subscribe(d => this.totalEvents.set(d.totalElements));
    this.adminContactService.getUnreadCount().subscribe(n => this.unreadMessages.set(n));
  }

  private updateTitle(url: string) {
    const exact = this.pageTitles[url];
    if (exact) { this.pageTitle = exact; return; }
    if (url.includes('/modifier')) { this.pageTitle = "Modifier l'événement"; return; }
    if (url.includes('/medias')) { this.pageTitle = 'Gestion des médias'; return; }
    this.pageTitle = 'Administration';
  }

  getUserInitial(): string {
    return (this.auth.currentUser()?.username ?? 'A')[0].toUpperCase();
  }

  logout() { this.auth.logout(); }
}
