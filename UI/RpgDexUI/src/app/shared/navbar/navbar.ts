import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  userAvatarUrl: string = '';

  constructor(public authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.GetLoggedUser().subscribe({
        next: (response) => {
          this.userAvatarUrl = response.data?.iconPath ?? '';
          this.cdr.detectChanges();
        },
        error: () => {
          this.userAvatarUrl = '';
          this.cdr.detectChanges();
        }
      });
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScrollLock();
  }

  closeMenu() {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;
    this.updateBodyScrollLock();
  }

  logout() {
    this.authService.Logout();
    this.closeMenu();
  }

  private updateBodyScrollLock(): void {
    document.body.classList.toggle('nav-menu-open', this.isMenuOpen);
  }
}