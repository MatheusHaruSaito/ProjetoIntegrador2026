import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { response } from 'express';

@Component({
  selector: 'app-email-confirmation',
  imports: [],
  templateUrl: './email-confirmation.html',
  styleUrl: './email-confirmation.css',
})
export class EmailConfirmation implements OnInit {
  userid: string | null = null;
  token: string | null = null;
  message: string | undefined = 'Aguardando Verficação de Email...';

  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.userid = params.get('userid');
      this.token = params.get('token');

      if (this.userid && this.token) {
        const request: { userId: string; token: string } = {
          userId: this.userid,
          token: this.token,
        };

        this.authService.ValidateEmailByToken(request).subscribe(
          (response) => {
            this.message = response.data;
            this.cdr.detectChanges();
          },
          (error) => {
            this.message = error.message;
            this.cdr.detectChanges();
          },
        );
      }
    });
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
