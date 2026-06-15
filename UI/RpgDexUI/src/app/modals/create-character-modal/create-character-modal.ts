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
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CharacterPropertyOrganization } from '../../../models/characterPropertyOrganization';
import { CharacterPropertyOrganizationEnum } from '../../../models/characterPropertyOrganizationEnum';
import { CharacterPropertyValueEnum } from '../../../models/CharacterPropertyValueEnum';
import { CharacterPropertyModel } from '../../../models/characterPropertyModel';

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

  characterService = inject(CharacterService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  readonly MAX_PROPERTIES = 20;
  readonly MAX_TITLE_LENGTH = 40;
  readonly MAX_VALUE_LENGTH = 100;

  isLoading = false;
  errorMessage = '';
  newCharacter: { name: string; description: string } = { name: '', description: '' };
  selectedIconFile: File | null = null;
  iconPreviewUrl = '';
  customProperties: CharacterPropertyOrganization[] = [];

  ngOnInit(): void {}

  // ── Contagem recursiva total ──────────────────────────
  countAllProperties(list: CharacterPropertyOrganization[]): number {
    return list.reduce(
      (acc, p) =>
        acc + 1 + (Array.isArray(p.data) ? this.countAllProperties(p.data as CharacterPropertyOrganization[]) : 0),
      0
    );
  }

  get totalCount(): number {
    return this.countAllProperties(this.customProperties);
  }

  // ── Busca por id (recursiva) ──────────────────────────
  searchProperty(
    id: string,
    list: CharacterPropertyOrganization[]
  ): CharacterPropertyOrganization | null {
    for (const prop of list) {
      if (prop.id === id) return prop;
      if (Array.isArray(prop.data)) {
        const found = this.searchProperty(id, prop.data as CharacterPropertyOrganization[]);
        if (found) return found;
      }
    }
    return null;
  }

  // ── Adicionar organização (grupo/coluna) ──────────────
  addPropertyOrganizationField(parentId: string): void {
    if (this.totalCount >= this.MAX_PROPERTIES) {
      this.errorMessage = `Limite de ${this.MAX_PROPERTIES} atributos atingido.`;
      return;
    }
    const org: CharacterPropertyOrganization = {
      id: crypto.randomUUID(),
      title: '',
      type: CharacterPropertyOrganizationEnum.Collum,
      data: [],
    };
    if (!parentId) {
      this.customProperties.push(org);
    } else {
      const parent = this.searchProperty(parentId, this.customProperties);
      if (parent) {
        if (!Array.isArray(parent.data)) parent.data = [];
        (parent.data as CharacterPropertyOrganization[]).push(org);
      }
    }
  }

  // ── Adicionar campo de valor dentro de uma organização ─
  addPropertyField(parentId: string): void {
    if (this.totalCount >= this.MAX_PROPERTIES) {
      this.errorMessage = `Limite de ${this.MAX_PROPERTIES} atributos atingido.`;
      return;
    }
    const parent = this.searchProperty(parentId, this.customProperties);
    if (!parent) return;
    if (!Array.isArray(parent.data)) parent.data = [];
    const field: CharacterPropertyModel = {
      id: crypto.randomUUID(),
      title: '',
      type: CharacterPropertyValueEnum.Default,
      data: '',
    };
    (parent.data as any[]).push(field);
  }

  // ── Remover item raiz ─────────────────────────────────
  removePropertyField(index: number): void {
    this.customProperties.splice(index, 1);
  }

  // ── Remover item filho dentro de um pai ───────────────
  removeChildField(parent: CharacterPropertyOrganization, index: number): void {
    (parent.data as any[]).splice(index, 1);
  }

  // ── Verifica se item é organização (tem array data) ───
  isOrganization(item: any): item is CharacterPropertyOrganization {
    return Array.isArray(item.data);
  }

  // ── Reset ─────────────────────────────────────────────
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

  // ── Serializa customProperties → Properties[chave] ───
  private buildFormData(): FormData {
    const userId = this.authService.getLoggedUserId();
    const form = new FormData();
    form.append('userId', userId ?? '');
    form.append('name', this.newCharacter.name.trim());
    form.append('description', this.newCharacter.description ?? '');
    if (this.selectedIconFile) form.append('icon', this.selectedIconFile, this.selectedIconFile.name);

    // Cada organização raiz vira uma chave Properties[título]
    for (const org of this.customProperties) {
      const key = org.title.trim() || org.id;
      form.append(`Properties[${key}]`, JSON.stringify(this.serializeOrg(org)));
    }
    return form;
  }

  private serializeOrg(org: CharacterPropertyOrganization): any {
    if (!Array.isArray(org.data)) return org.data;
    return (org.data as any[]).map((child) =>
      this.isOrganization(child)
        ? { [child.title || child.id]: this.serializeOrg(child) }
        : { Name: child.title, Value: child.data }
    );
  }

  CreateCharacter(): void {
    this.errorMessage = '';
    if (!this.newCharacter.name.trim()) { this.errorMessage = 'O nome do personagem é obrigatório.'; return; }

    this.isLoading = true;
    this.characterService.Post(this.buildFormData() as any).subscribe({
      next: () => { this.isLoading = false; this.created.emit(); this.CloseModal(); },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = this.parseError(err) ?? 'Erro ao criar personagem. Tente novamente.';
      },
    });
  }

  private parseError(err: any): string | null {
    const body = err?.error;
    if (body?.errors) return (Object.values(body.errors).flat() as string[])[0] ?? null;
    return body?.message ?? body?.title ?? null;
  }
}