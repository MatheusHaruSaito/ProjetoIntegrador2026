import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { LoginUser } from '../../../models/loginUser';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../../services/google-auth-service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private googleAuth = inject(GoogleAuthService);

  authUserForm: LoginUser = {
    email: '',
    password: '',
  };

  showPasswordHint = false;

  ngOnInit(): void {
    this.googleAuth.initLogin((response: any) => {
      const token = response.credential;

      this.authService.GoogleSingUp(token).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: () => {
          alert('Falha ao entrar com o Google. Verifique seu email e senha.');
        },
      });
    });

    const btn = document.getElementById('google-btn');
    if (btn) {
      this.googleAuth.renderButton('google-btn');
    }
  }

  togglePasswordHint() {
    this.showPasswordHint = !this.showPasswordHint;
  }

  Login() {
    this.authService.Login(this.authUserForm).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert('Falha ao entrar. Verifique seu email e senha.');
      },
    });
  }
  onDiscordLogin() {
    this.authService.DiscordSingUp();
  }
}
