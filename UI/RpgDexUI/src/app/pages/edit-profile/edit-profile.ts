import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { UserResponse } from '../../../models/userResponse';

interface EditProfileForm {
  userName: string;
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
  private userService = inject(UserService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: UserResponse | null = null;

  editForm: EditProfileForm = {
    userName: '',
  };

  avatarPreviewUrl: string = '';
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.GetLoggedUser().subscribe({
      next: (response) => {
        this.currentUser = response.data ?? null;
        this.editForm.userName = this.currentUser?.userName ?? '';
        // Pré-carrega a foto atual do usuário, se houver
        this.avatarPreviewUrl = this.currentUser?.iconPath ?? '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os dados do perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'A imagem deve ter no máximo 2MB.';
      this.cdr.detectChanges();
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreviewUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveChanges(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.editForm.userName.trim()) {
      this.errorMessage = 'O nome de usuário não pode ficar vazio.';
      return;
    }

    const userId = this.authService.getLoggedUserId();
    if (!userId) {
      this.errorMessage = 'Usuário não identificado. Faça login novamente.';
      return;
    }

    const formData = new FormData();
    formData.append('userName', this.editForm.userName.trim());
    if (this.selectedFile) {
      formData.append('icon', this.selectedFile);
    }

    this.isLoading = true;
    this.userService.Update(formData, userId).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Perfil atualizado com sucesso!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ?? 'Erro ao salvar alterações. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }
}