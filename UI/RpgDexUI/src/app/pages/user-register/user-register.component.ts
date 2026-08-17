import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RegisterUser } from '../../../models/registerUser';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../../services/google-auth-service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css',
})
export class UserRegisterComponent {
  authService = inject(AuthService);
  private googleAuth = inject(GoogleAuthService);
  private router = inject(Router);

  registerForm: RegisterUser = {
    displayName: '',
    email: '',
    password: '',
  };

  confirmPassword = '';
  termsAccepted = false;
  hasReadTerms = false;
  isTermsModalOpen = false;
  showPasswordHint = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

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

    this.googleAuth.renderButton('google-btn');
  }

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

  togglePasswordHint() {
    this.showPasswordHint = !this.showPasswordHint;
  }

  // CONTROLE DO MODAL E CHECKBOX DE TERMOS DE USO
  openTermsModal(event?: Event): void {
    if (event) event.preventDefault();
    this.isTermsModalOpen = true;
  }

  closeTermsModal(): void {
    this.isTermsModalOpen = false;
  }

  acceptTermsAndClose(): void {
    this.hasReadTerms = true;
    this.termsAccepted = true;
    this.isTermsModalOpen = false;
    this.errorMessage = '';
  }

  onTermsCheckboxClick(event: MouseEvent): void {
    event.preventDefault(); // Impede alteração do checkbox por clique direto sem validação
    
    if (!this.hasReadTerms) {
      this.openTermsModal();
      this.errorMessage = 'Por favor, leia os Termos de Uso no modal antes de aceitá-los.';
    } else {
      // Permite alternar o aceite apenas se já leu ao menos uma vez
      this.termsAccepted = !this.termsAccepted;
    }
  }

  loginComGoogle(): void {
    const googleBtn = document.querySelector('#google-btn div[role="button"]') as HTMLElement;
    if (googleBtn) {
      googleBtn.click();
    } else {
      this.googleAuth.prompt();
    }
  }

  Register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.registerForm.displayName ||
      !this.registerForm.email ||
      !this.registerForm.password ||
      !this.confirmPassword
    ) {
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

    if (!this.termsAccepted || !this.hasReadTerms) {
      this.errorMessage = 'Você precisa abrir e aceitar os Termos de Uso antes de cadastrar.';
      return;
    }

    this.isLoading = true;

    this.authService.Register(this.registerForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/verificar-email'], {
          queryParams: { email: this.registerForm.email },
        });
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
      },
    });
  }

  onDiscordLogin() {
    this.authService.DiscordSingUp();
  }
}