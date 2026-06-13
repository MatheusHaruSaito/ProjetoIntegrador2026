import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Character } from '../../../models/character';
import { CreateCharacterModal } from '../../modals/create-character-modal/create-character-modal';
import { EditCharacterModal } from '../../modals/edit-character-modal/edit-character-modal';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateCharacterModal, EditCharacterModal],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList implements OnInit {
  characterService = inject(CharacterService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  editModalCharacterId = '';
  characterList: Character[] = [];
  customProperties: any[] = [];
  editCustomProperties: any[] = [];
  // ── Criar ──
  showCreateModal = false;
  // isLoading = false;
  // errorMessage = '';
  // newCharacter: { name: string; description: string } = { name: '', description: '' };
  // selectedIconFile: File | null = null;
  // iconPreviewUrl = '';

  // ── Visualizar ──
  showViewModal = false;
  viewCharacter: Character | null = null;

  // ── Editar ──
  showEditModal = false;
  // isEditLoading = false;
  editErrorMessage = '';
  // editCharacter: { id: string; name: string; description: string } = {
  //   id: '',
  //   name: '',
  //   description: '',
  // };
  // selectedEditIconFile: File | null = null;
  // editIconPreviewUrl = '';
  // editCustomProperties: any[] = [];

  ngOnInit(): void {
    this.GetAllCharacters();
  }

  // ─────────────────────────────────────────────
  // LISTAGEM
  // ─────────────────────────────────────────────
  GetAllCharacters(): void {
    const userId = this.authService.getLoggedUserId();
    this.characterService.GetAll(userId!).subscribe({
      next: (response) => {
        const all: Character[] = response.data ?? [];
        this.characterList = userId ? all.filter((c) => c.userId === userId) : all;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ─────────────────────────────────────────────
  // CRIAR
  // ─────────────────────────────────────────────
  OpenModal(): void {
    this.showCreateModal = true;
  }

  CloseModal(): void {
    this.showCreateModal = false;
  }

  // onIconSelected(event: Event): void {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (!file) return;
  //   if (file.size > 2 * 1024 * 1024) {
  //     this.errorMessage = 'A imagem deve ter no máximo 2MB.';
  //     return;
  //   }
  //   this.selectedIconFile = file;
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     this.iconPreviewUrl = e.target?.result as string;
  //     this.cdr.detectChanges();
  //   };
  //   reader.readAsDataURL(file);
  // }

  // CreateCharacter(): void {
  //   this.errorMessage = '';

  //   if (!this.newCharacter.name.trim()) {
  //     this.errorMessage = 'O nome do personagem é obrigatório.';
  //     return;
  //   }

  //   const propertiesObj: Record<string, any> = {};
  //   this.customProperties.forEach((prop) => {
  //     if (prop.key.trim()) {
  //       propertiesObj[prop.key.trim()] = prop.value;
  //     }
  //   });
  //   const userId = this.authService.getLoggedUserId();
  //   const form = new FormData();
  //   form.append('userId', userId ?? '');
  //   form.append('name', this.newCharacter.name.trim());
  //   form.append('description', this.newCharacter.description ?? '');
  //   form.append('properties', JSON.stringify(propertiesObj));
  //   if (this.selectedIconFile) {
  //     form.append('icon', this.selectedIconFile, this.selectedIconFile.name);
  //   }
  //   this.isLoading = true;
  //   this.characterService.Post(form as any).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.CloseModal();
  //       this.GetAllCharacters();
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.errorMessage = this.parseError(err) ?? 'Erro ao criar personagem. Tente novamente.';
  //     },
  //   });
  // }
  // addPropertyField(): void {
  //   this.customProperties.push({ key: '', value: '' });
  // }
  // removePropertyField(index: number): void {
  //   this.customProperties.splice(index, 1);
  // }

  // ─────────────────────────────────────────────
  // ATRIBUTOS DO MODAL DE EDIÇÃO
  // ─────────────────────────────────────────────
  // addEditPropertyField(): void {
  //   this.editCustomProperties.push({ key: '', value: '' });
  // }

  // removeEditPropertyField(index: number): void {
  //   this.editCustomProperties.splice(index, 1);
  // }

  // ─────────────────────────────────────────────
  // HELPER – ATRIBUTOS DO MODAL DE VISUALIZAÇÃO
  // ─────────────────────────────────────────────
  viewPropertiesEntries(): { key: string; value: any }[] {
    const props = (this.viewCharacter as any)?.properties;
    if (!props || typeof props !== 'object') return [];
    return Object.entries(props).map(([key, value]) => ({ key, value }));
  }

  // ─────────────────────────────────────────────
  // VISUALIZAR
  // ─────────────────────────────────────────────
  OpenViewModal(character: Character): void {
    this.viewCharacter = character;
    this.showViewModal = true;
  }

  CloseViewModal(): void {
    this.showViewModal = false;
    this.viewCharacter = null;
  }

  // ─────────────────────────────────────────────
  // EDITAR
  // ─────────────────────────────────────────────
  OpenEditModal(character: Character): void {
    this.editModalCharacterId = character.id;
    this.cdr.detectChanges();
    this.showEditModal = true;
  }

  CloseEditModal(): void {
    this.showEditModal = false;
    this.editErrorMessage = '';
  }

  // onEditIconSelected(event: Event): void {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (!file) return;
  //   if (file.size > 2 * 1024 * 1024) {
  //     this.editErrorMessage = 'A imagem deve ter no máximo 2MB.';
  //     return;
  //   }
  //   this.selectedEditIconFile = file;
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     this.editIconPreviewUrl = e.target?.result as string;
  //     this.cdr.detectChanges();
  //   };
  //   reader.readAsDataURL(file);
  // }

  // UpdateCharacter(): void {
  //   this.editErrorMessage = '';

  //   if (!this.editCharacter.name.trim()) {
  //     this.editErrorMessage = 'O nome do personagem é obrigatório.';
  //     return;
  //   }

  //   const propertiesObj: Record<string, any> = {};
  //   this.editCustomProperties.forEach((prop) => {
  //     if (prop.key.trim()) {
  //       propertiesObj[prop.key.trim()] = prop.value;
  //     }
  //   });

  //   const form = new FormData();
  //   form.append('id', this.editCharacter.id);
  //   form.append('name', this.editCharacter.name.trim());
  //   form.append('description', this.editCharacter.description ?? '');
  //   form.append('properties', JSON.stringify(propertiesObj));
  //   if (this.selectedEditIconFile) {
  //     form.append('icon', this.selectedEditIconFile, this.selectedEditIconFile.name);
  //   }

  //   this.isEditLoading = true;
  //   this.characterService.Update(form as any).subscribe({
  //     next: () => {
  //       this.isEditLoading = false;
  //       this.CloseEditModal();
  //       this.GetAllCharacters();
  //     },
  //     error: (err) => {
  //       this.isEditLoading = false;
  //       this.editErrorMessage =
  //         this.parseError(err) ?? 'Erro ao atualizar personagem. Tente novamente.';
  //     },
  //   });
  // }

  // ─────────────────────────────────────────────
  // DELETAR
  // ─────────────────────────────────────────────
  DeleteCharacter(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;
    this.characterService.Delete(id).subscribe({
      next: () => {
        this.characterList = this.characterList.filter((c) => c.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // ─────────────────────────────────────────────
  // UTILITÁRIOS
  // ─────────────────────────────────────────────
  private parseError(err: any): string | null {
    const body = err?.error;
    if (body?.errors) {
      const messages = Object.values(body.errors).flat() as string[];
      return messages[0] ?? null;
    }
    return body?.message ?? body?.title ?? null;
  }
}
