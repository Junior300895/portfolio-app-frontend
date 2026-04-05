import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminEventService, EventService } from '@core/services/api.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css',
  })
export class EventFormComponent implements OnInit {
  private adminEventService = inject(AdminEventService);
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  eventId = signal<number | null>(null);
  saving = signal(false);
  pageLoading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    eventDate: [''],
    location: [''],
    category: [''],
    featured: [false],
    isPrivate: [false]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.eventId.set(Number(id));
      this.pageLoading.set(true);
      this.adminEventService.getById(Number(id)).subscribe({
        next: (data) => {
          this.form.patchValue({
            title: data.title,
            description: data.description,
            eventDate: data.eventDate,
            location: data.location,
            category: data.category,
            featured: data.featured,
            isPrivate: data.isPrivate ?? false
          });
          this.pageLoading.set(false);
        },
        error: () => { this.pageLoading.set(false); this.error.set('Événement introuvable'); }
      });
    }
  }

  isInvalid(f: string) { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set(null);
    const data = this.form.value;

    const obs = this.isEdit()
      ? this.adminEventService.update(this.eventId()!, data)
      : this.adminEventService.create(data);

    obs.subscribe({
      next: (event) => {
        if (!this.isEdit()) {
          this.router.navigate(['/admin/evenements', event.id, 'medias']);
        } else {
          this.router.navigate(['/admin/evenements']);
        }
      },
      error: (e) => {
        this.error.set(e.error?.message || 'Une erreur est survenue');
        this.saving.set(false);
      }
    });
  }
}
