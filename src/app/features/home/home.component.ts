import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { EventService } from '@core/services/api.service';
import { EventSummary, CATEGORY_LABELS, CATEGORY_ICONS } from '@shared/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private eventService = inject(EventService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  featured = signal<EventSummary[]>([]);
  loading = signal(true);

  services = [
    { icon: '💍', title: 'Mariages', desc: 'Reportage complet de votre journée, de la préparation à la soirée.' },
    { icon: '🎤', title: 'Conférences', desc: 'Couverture professionnelle : speakers, ambiances, portraits.' },
    { icon: '🎂', title: 'Anniversaires', desc: 'Capturer la joie, les émotions et les moments forts.' },
    { icon: '🎵', title: 'Concerts & Festivals', desc: 'Photo live en longue exposition ou haute vitesse.' },
  ];

  ngOnInit() {
    this.titleService.setTitle('TIPEU PHOTOGRAPHY — Photographe Freelance à Dakar');
    this.metaService.updateTag({ name: 'description', content: 'Photographe freelance à Dakar spécialisé dans les mariages, conférences, anniversaires et concerts. Découvrez le portfolio de TIPEU Photography.' });
    this.metaService.updateTag({ property: 'og:title', content: 'TIPEU PHOTOGRAPHY — Photographe Freelance à Dakar' });
    this.metaService.updateTag({ property: 'og:description', content: 'Photographe freelance à Dakar spécialisé dans les mariages, conférences, anniversaires et concerts.' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://tipeu-photography.vercel.app' });

    this.eventService.getFeatured().subscribe({
      next: (data) => { this.featured.set(data.slice(0, 3)); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  getCategoryIcon(cat: string) { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📷'; }
  formatDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''; }
}
