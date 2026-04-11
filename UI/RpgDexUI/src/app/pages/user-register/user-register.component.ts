import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RegisterUser } from '../../../models/registerUser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  registerForm: RegisterUser = {
    email: '',
    password: ''
  };

  confirmPassword = '';
  termsAccepted = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get passwordTooShort(): boolean {
    return this.registerForm.password.length > 0 && this.registerForm.password.length < 8;
  }

  get passwordsMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.registerForm.password !== this.confirmPassword;
  }

  Register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerForm.email || !this.registerForm.password || !this.confirmPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.registerForm.password.length < 8) {
      this.errorMessage = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }

    if (this.registerForm.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    if (!this.termsAccepted) {
      this.errorMessage = 'Você precisa aceitar os Termos de Uso.';
      return;
    }

    this.isLoading = true;

    this.authService.Register(this.registerForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Este e-mail já está cadastrado.';
        } else if (err.status === 400) {
          this.errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
        } else {
          this.errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
        }
        console.error('Erro no cadastro', err);
      }
    });
  }
}