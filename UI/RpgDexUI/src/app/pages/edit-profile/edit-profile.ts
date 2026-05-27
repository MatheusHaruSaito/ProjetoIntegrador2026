import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AuthUser } from '../../../models/authUser';

interface EditProfileForm {
  userName: string;
  avatarUrl: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: AuthUser | null = null;

  editForm: EditProfileForm = {
    userName: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  // Estado de UI
  avatarMode: 'url' | 'upload' = 'url';
  avatarPreviewUrl: string = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get passwordsMismatch(): boolean {
    return (
      this.editForm.confirmNewPassword.length > 0 &&
      this.editForm.newPassword !== this.editForm.confirmNewPassword
    );
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.GetLoggedUser();
    // Pré-preenche o nome atual no formulário
    this.editForm.userName = this.currentUser?.userName ?? '';
  }

  triggerFileInput(): void {
    // Disparo gerenciado diretamente no template via #fileInput / #fileInput2
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'A imagem deve ter no máximo 2MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreviewUrl = e.target?.result as string;
      this.editForm.avatarUrl = ''; // limpa URL manual ao usar upload
    };
    reader.readAsDataURL(file);
  }

  onUrlChange(url: string): void {
    // Atualiza preview ao digitar URL
    this.avatarPreviewUrl = url ?? '';
  }

  saveChanges(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validação: se quiser trocar senha, todos os campos de senha são obrigatórios
    if (this.editForm.newPassword || this.editForm.confirmNewPassword) {
      if (!this.editForm.currentPassword) {
        this.errorMessage = 'Informe sua senha atual para definir uma nova senha.';
        return;
      }
      if (this.editForm.newPassword.length < 8) {
        this.errorMessage = 'A nova senha deve ter pelo menos 8 caracteres.';
        return;
      }
      if (this.passwordsMismatch) {
        this.errorMessage = 'As senhas não coincidem.';
        return;
      }
    }

    if (!this.editForm.userName.trim()) {
      this.errorMessage = 'O nome de usuário não pode ficar vazio.';
      return;
    }

    // TODO: integrar com o endpoint de atualização de perfil da API
    // Simulação de loading enquanto a API não existe
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Funcionalidade em desenvolvimento. Em breve disponível!';
    }, 800);
  }
}