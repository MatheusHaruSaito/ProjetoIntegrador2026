import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-character-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-character-modal.html',
  styleUrl: './create-character-modal.css',
})
export class CreateCharacterModal implements OnInit {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private characterService = inject(CharacterService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage = '';
  newCharacter = { name: '', description: '' };
  selectedIconFile: File | null = null;
  iconPreviewUrl = '';

  ngOnInit(): void {}

  private reset(): void {
    this.newCharacter = { name: '', description: '' };
    this.selectedIconFile = null;
    this.iconPreviewUrl = '';
    this.errorMessage = '';
  }

  CloseModal(): void {
    this.reset();
    this.close.emit();
  }

  onIconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { this.errorMessage = 'A imagem deve ter no máximo 2MB.'; return; }
    this.selectedIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.iconPreviewUrl = e.target?.result as string; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  CreateCharacter(): void {
    this.errorMessage = '';
    if (!this.newCharacter.name.trim()) { this.errorMessage = 'O nome do personagem é obrigatório.'; return; }

    const form = new FormData();
    form.append('userId', this.authService.getLoggedUserId() ?? '');
    form.append('name', this.newCharacter.name.trim());
    form.append('description', this.newCharacter.description ?? '');
    if (this.selectedIconFile) form.append('icon', this.selectedIconFile, this.selectedIconFile.name);

    this.isLoading = true;
    this.characterService.Post(form as any).subscribe({
      next: (res) => {
        this.isLoading = false;
        const id = (res as any)?.data?.id ?? (res as any)?.id;
        this.created.emit();
        this.CloseModal();
        // Redireciona direto para o editor do personagem recém-criado
        if (id) {
          this.router.navigate(['/personagens', id]);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const body = err?.error;
        this.errorMessage =
          (body?.errors ? (Object.values(body.errors).flat() as string[])[0] : null)
          ?? body?.message ?? body?.title
          ?? 'Erro ao criar personagem. Tente novamente.';
      },
    });
  }
}