import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminEventService, AdminContactService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { EventSummary, ContactMessage } from '@shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private adminEventService = inject(AdminEventService);
  private adminContactService = inject(AdminContactService);
  private authService = inject(AuthService);

  stats = signal({ totalEvents: 0, totalPhotos: 0, totalVideos: 0, unreadMessages: 0 });
  recentEvents = signal<EventSummary[]>([]);
  recentMessages = signal<ContactMessage[]>([]);

  username() {
    return this.authService.currentUser()?.username ?? 'Admin';
  }

  ngOnInit() {
    this.adminEventService.getAll(0, 5).subscribe(data => {
      this.recentEvents.set(data.content);
      this.stats.update(s => ({ ...s, totalEvents: data.totalElements }));
    });
    this.adminContactService.getMessages(0).subscribe(data => {
      this.recentMessages.set(data.content.slice(0, 5));
    });
    this.adminContactService.getUnreadCount().subscribe(count => {
      this.stats.update(s => ({ ...s, unreadMessages: count }));
    });
  }

  formatDate(d: string) {
    return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  }
  formatDateTime(d: string) {
    return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
  }
}
