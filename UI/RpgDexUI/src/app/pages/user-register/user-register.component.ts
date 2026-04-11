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
    userName: '',
    email: '',
    userName:'',
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

  get passwordStrengthError(): string {
    const p = this.registerForm.password;
    if (p.length === 0) return '';
    if (!/[A-Z]/.test(p)) return 'A senha deve conter pelo menos uma letra maiúscula.';
    if (!/[a-z]/.test(p)) return 'A senha deve conter pelo menos uma letra minúscula.';
    if (!/[0-9]/.test(p)) return 'A senha deve conter pelo menos um número.';
    return '';
  }

  Register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerForm.userName || !this.registerForm.email || !this.registerForm.password || !this.confirmPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.registerForm.password.length < 8) {
      this.errorMessage = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }

    if (this.passwordStrengthError) {
      this.errorMessage = this.passwordStrengthError;
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
      next: r => {
        console.log(r);

        console.log(this.registerForm);
        this.isLoading = false;
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        const errors = err.error?.errors;
        if (errors) {
          const messages = Object.values(errors).flat() as string[];
          this.errorMessage = messages[0] ?? 'Dados inválidos. Verifique as informações.';
        } else if (err.status === 409 || err.error?.code === 'DuplicateEmail') {
          this.errorMessage = 'Este e-mail já está cadastrado.';
        } else {
          this.errorMessage = 'Ocorreu um erro ao criar a conta. Tente novamente.';
        }
        console.error('Erro no cadastro', err);
      }
    });
  }
}