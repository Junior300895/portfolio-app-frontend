import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminContactService } from '@core/services/api.service';
import { ContactMessage } from '@shared/models/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  private contactService = inject(AdminContactService);

  messages = signal<ContactMessage[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  total = signal(0);
  unread = signal(0);
  expanded = signal<number | null>(null);

  ngOnInit() { this.load(0); this.loadUnread(); }

  load(page: number) {
    this.loading.set(true);
    this.contactService.getMessages(page).subscribe({
      next: (data) => {
        this.messages.set(data.content);
        this.currentPage.set(data.page);
        this.totalPages.set(data.totalPages);
        this.total.set(data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadUnread() {
    this.contactService.getUnreadCount().subscribe(n => this.unread.set(n));
  }

  toggle(msg: ContactMessage) {
    this.expanded.set(this.expanded() === msg.id ? null : msg.id);
    if (!msg.read) this.markRead(msg);
  }

  markRead(msg: ContactMessage) {
    this.contactService.markRead(msg.id).subscribe(() => {
      this.messages.update(list => list.map(m => m.id === msg.id ? { ...m, read: true } : m));
      this.unread.update(n => Math.max(0, n - 1));
    });
  }

  formatDate(d: string) {
    return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  }
  formatDateTime(d: string) {
    return d ? new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '';
  }

  openWhatsApp(msg: ContactMessage) {
    const phone = this.formatPhone(msg.phone);
    const lines: string[] = [];
    lines.push(`Bonjour ${msg.name} 👋`);
    lines.push('');
    lines.push(`Suite à votre demande${msg.eventType ? ' pour un(e) *' + msg.eventType + '*' : ''}, je vous contacte afin de convenir d'un rendez-vous.`);
    if (msg.eventDateRequested) {
      lines.push('');
      lines.push(`📅 Date souhaitée : *${msg.eventDateRequested}*`);
    }
    lines.push('');
    lines.push('Êtes-vous disponible pour qu\'on en discute ? 🎯');
    lines.push('');
    lines.push('Cordialement,');
    lines.push('*TIPEU PHOTOGRAPHY*');
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    // Remove spaces, dashes, dots, parentheses
    let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    // If starts with 0, replace with country code (default Senegal +221)
    if (cleaned.startsWith('0')) {
      cleaned = '221' + cleaned.slice(1);
    }
    // Remove leading +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  }

  hasPhone(msg: ContactMessage): boolean {
    return !!msg.phone && msg.phone.trim().length > 0;
  }
}
