import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.Logout();
    this.closeMenu();
  }
}