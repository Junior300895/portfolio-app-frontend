import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '@core/services/api.service';
import { EventSummary, CATEGORY_LABELS, CATEGORY_ICONS } from '@shared/models/models';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  events = signal<EventSummary[]>([]);
  categories = signal<string[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  activeCategory = signal<string | null>(null);
  searchQuery = '';
  isSearchMode = false;

  ngOnInit() {
    this.eventService.getCategories().subscribe(cats => this.categories.set(cats));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.eventService.getEvents(this.currentPage(), 9, this.activeCategory() ?? undefined).subscribe({
      next: (data) => {
        this.events.set(data.content);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setCategory(cat: string | null) {
    this.activeCategory.set(cat);
    this.currentPage.set(0);
    this.isSearchMode = false;
    this.load();
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.load();
      return;
    }
    this.loading.set(true);
    this.isSearchMode = true;
    this.eventService.search(this.searchQuery, this.currentPage()).subscribe({
      next: (data) => {
        this.events.set(data.content);
        this.totalPages.set(data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.load();
  }

  pageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getCategoryLabel(cat: string) { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  getCategoryIcon(cat: string) { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📷'; }
  formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }); }
}
