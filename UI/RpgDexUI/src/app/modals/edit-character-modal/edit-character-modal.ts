import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { Character } from '../../../models/character';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { error } from 'console';

@Component({
  selector: 'app-edit-character-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-character-modal.html',
  styleUrl: './edit-character-modal.css',
})
export class EditCharacterModal implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      console.log('Modal abriu');

      this.ShowCharacterToEdit();
    }
  }

  @Input() visible = false;
  @Input() characterId = '';

  @Output() close = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();

  characterService = inject(CharacterService);
  cdr = inject(ChangeDetectorRef);
  isEditLoading = false;
  editErrorMessage = '';
  editCharacter: { id: string; name: string; description: string } = {
    id: '',
    name: '',
    description: '',
  };
  selectedEditIconFile: File | null = null;
  editIconPreviewUrl = '';
  editCustomProperties: any[] = [];

  private ShowCharacterToEdit(): void {
    this.editErrorMessage = '';
    this.characterService.GetById(this.characterId).subscribe({
      next: (res) => {
        const character = res.data!;
        this.editCharacter = {
          id: character.id,
          name: character.name,
          description: character.description ?? '',
        };
        this.selectedEditIconFile = null;
        this.editIconPreviewUrl = character.iconPath ?? '';

        // Carregar atributos existentes como array editável
        const props = (character as any).properties;
        this.editCustomProperties =
          props && typeof props === 'object'
            ? Object.entries(props).map(([key, value]) => ({ key, value }))
            : [];
        console.log('teste');
        this.cdr.detectChanges();
        console.log('é pr ater abrido');
      },
      error: (err) => {
        this.editErrorMessage = this.parseError(err) ?? 'Erro ao obter personagem.';
      },
    });
  }

  CloseModal(): void {
    this.close.emit();
    this.editErrorMessage = '';
  }

  onEditIconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.editErrorMessage = 'A imagem deve ter no máximo 2MB.';
      return;
    }
    this.selectedEditIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editIconPreviewUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  UpdateCharacter(): void {
    this.editErrorMessage = '';

    if (!this.editCharacter.name.trim()) {
      this.editErrorMessage = 'O nome do personagem é obrigatório.';
      return;
    }

    const propertiesObj: Record<string, any> = {};
    this.editCustomProperties.forEach((prop) => {
      if (prop.key.trim()) {
        propertiesObj[prop.key.trim()] = prop.value;
      }
    });

    const form = new FormData();
    form.append('id', this.editCharacter.id);
    form.append('name', this.editCharacter.name.trim());
    form.append('description', this.editCharacter.description ?? '');
    form.append('properties', JSON.stringify(propertiesObj));
    if (this.selectedEditIconFile) {
      form.append('icon', this.selectedEditIconFile, this.selectedEditIconFile.name);
    }

    this.isEditLoading = true;
    this.characterService.Update(form as any).subscribe({
      next: () => {
        this.isEditLoading = false;
        this.edited.emit();
        this.CloseModal();
      },
      error: (err) => {
        this.isEditLoading = false;
        this.editErrorMessage =
          this.parseError(err) ?? 'Erro ao atualizar personagem. Tente novamente.';
      },
    });
  }

  addEditPropertyField(): void {
    this.editCustomProperties.push({ key: '', value: '' });
  }

  removeEditPropertyField(index: number): void {
    this.editCustomProperties.splice(index, 1);
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
