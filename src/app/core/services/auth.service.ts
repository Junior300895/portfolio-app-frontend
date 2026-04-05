import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiResponse, AuthResponse } from '@shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'portfolio_token';
  private readonly USER_KEY = 'portfolio_user';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isAuthenticated = signal(this.hasValidToken());
  currentUser = signal<{ username: string; email: string } | null>(this.getStoredUser());

  login(username: string, password: string) {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/login`,
      { username, password }
    ).pipe(
      tap(res => {
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          const user = { username: res.data.username, email: res.data.email };
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        const user = { username: res.data.username, email: res.data.email };
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    if (!this.isBrowser) return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private getStoredUser(): { username: string; email: string } | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
