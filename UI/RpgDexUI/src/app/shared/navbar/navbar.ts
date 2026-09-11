import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  userAvatarUrl: string = '';
  private userSub!: Subscription;

  constructor(public authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.GetLoggedUser().subscribe();
    }

    this.userSub = this.authService.currentUser.subscribe((user) => {
      if (user?.iconPath) {
        const separator = user.iconPath.includes('?') ? '&' : '?';
        this.userAvatarUrl = `${user.iconPath}${separator}t=${new Date().getTime()}`;
      } else {
        this.userAvatarUrl = '';
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
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