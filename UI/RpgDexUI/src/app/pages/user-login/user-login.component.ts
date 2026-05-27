import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { LoginUser } from '../../../models/loginUser';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  authUserForm: LoginUser = {
    email: '',
    password: '',
  };

  showPasswordHint = false;

  authService = inject(AuthService);
  private router = inject(Router);

  togglePasswordHint() {
    this.showPasswordHint = !this.showPasswordHint;
  }

  Login() {
    this.authService.Login(this.authUserForm).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        alert('Falha ao entrar. Verifique seu email e senha.');
      }
    });
  }
}