import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { ResendEmailVerificationRequest } from '../../../models/resendEmailVerificationRequest';

@Component({
  selector: 'app-email-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-pending.html',
  styleUrl: './email-pending.css',
})
export class EmailPending implements OnInit, OnDestroy {
  email = '';
  resendCooldown = 0;
  resendSuccess = false;
  resendError = '';

  private cooldownTimer: any;
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // email passado como query param pelo register: /verificar-email?email=...
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  resend(): void {
    if (this.resendCooldown > 0 || !this.email) return;
    this.resendSuccess = false;
    this.resendError   = '';

    const request: ResendEmailVerificationRequest = { email: this.email };
    this.authService.ResendEmailVerification(request).subscribe({
      next: () => {
        this.resendSuccess = true;
        this.startCooldown(60);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.resendError = err?.error?.message ?? 'Erro ao reenviar. Tente novamente.';
        this.cdr.detectChanges();
      },
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown = seconds;
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      this.cdr.detectChanges();
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownTimer);
  }
}