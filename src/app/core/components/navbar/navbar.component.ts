import { Component, inject, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  menuOpen = signal(false);
  scrolled = signal(false);

  navClass() {
    return this.scrolled()
      ? 'backdrop-blur-md bg-black/90 border-b border-white/10 shadow-2xl'
      : 'bg-gradient-to-b from-black/80 to-transparent';
  }

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.scrolled.set(window.scrollY > 50);
    }
  }
}
