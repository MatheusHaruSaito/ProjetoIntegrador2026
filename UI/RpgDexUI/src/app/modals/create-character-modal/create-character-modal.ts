import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-character-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-character-modal.html',
  styleUrl: './create-character-modal.css',
})
export class CreateCharacterModal {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  characterService = inject(CharacterService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // ── Criar ──
  isLoading = false;
  errorMessage = '';
  newCharacter: { name: string; description: string } = { name: '', description: '' };
  selectedIconFile: File | null = null;
  iconPreviewUrl = '';
  customProperties: any[] = [];

  private ResetModalForm(): void {
    this.newCharacter = { name: '', description: '' };
    this.selectedIconFile = null;
    this.iconPreviewUrl = '';
    this.errorMessage = '';
    this.customProperties = [];
  }

  CloseModal(): void {
    this.close.emit();
    this.ResetModalForm();
    this.errorMessage = '';
  }

  onIconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'A imagem deve ter no máximo 2MB.';
      return;
    }
    this.selectedIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.iconPreviewUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  CreateCharacter(): void {
    this.errorMessage = '';

    if (!this.newCharacter.name.trim()) {
      this.errorMessage = 'O nome do personagem é obrigatório.';
      return;
    }

    const propertiesObj: Record<string, any> = {};
    this.customProperties.forEach((prop) => {
      if (prop.key.trim()) {
        propertiesObj[prop.key.trim()] = prop.value;
      }
    });
    const userId = this.authService.getLoggedUserId();
    const form = new FormData();
    form.append('userId', userId ?? '');
    form.append('name', this.newCharacter.name.trim());
    form.append('description', this.newCharacter.description ?? '');
    form.append('properties', JSON.stringify(propertiesObj));
    if (this.selectedIconFile) {
      form.append('icon', this.selectedIconFile, this.selectedIconFile.name);
    }
    this.isLoading = true;
    this.characterService.Post(form as any).subscribe({
      next: () => {
        this.isLoading = false;
        this.created.emit();
        this.CloseModal();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = this.parseError(err) ?? 'Erro ao criar personagem. Tente novamente.';
      },
    });
  }
  addPropertyField(): void {
    this.customProperties.push({ key: '', value: '' });
  }
  removePropertyField(index: number): void {
    this.customProperties.splice(index, 1);
  }

  private parseError(err: any): string | null {
    const body = err?.error;
    if (body?.errors) {
      const messages = Object.values(body.errors).flat() as string[];
      return messages[0] ?? null;
    }
    return body?.message ?? body?.title ?? null;
  }
}
