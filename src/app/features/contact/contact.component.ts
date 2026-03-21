import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactApiService } from '@core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  })
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactApiService);

  success = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    eventType: [''],
    eventDateRequested: [''],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set(null);
    this.contactService.send(this.form.value).subscribe({
      next: () => { this.success.set(true); this.submitting.set(false); this.form.reset(); },
      error: (e) => {
        this.error.set(e.error?.message || 'Une erreur est survenue. Réessayez.');
        this.submitting.set(false);
      }
    });
  }
}
