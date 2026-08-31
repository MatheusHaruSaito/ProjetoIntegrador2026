import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { NavigationService } from './services/navigation-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'rpgdex';

  private router = inject(Router);
  public navigationService = inject(NavigationService);

  showBackButton = false;

  private hiddenRoutes = [
    '/',
    '/home',
    '/login',
    '/cadastro',
    '/verificar-email',
    '/emailConfirmation',
    '/auth/callback'
  ];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects.split('?')[0];
        this.showBackButton = !this.hiddenRoutes.includes(currentUrl);
      });
  }

  goBack(): void {
    this.navigationService.back('/campanhas');
  }
}