import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { Character } from '../../../models/character';

export interface AttrEntry  { key: string; value: string; }
export interface AttrGroup  { title: string; entries: AttrEntry[]; }

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-editor.html',
  styleUrl: './character-editor.css',
})
export class CharacterEditor implements OnInit {
  private route            = inject(ActivatedRoute);
  private router           = inject(Router);
  private characterService = inject(CharacterService);
  private cdr              = inject(ChangeDetectorRef);

  character: Character | null = null;
  editForm = { name: '', description: '' };

  // Grupos de atributos — cada grupo vira uma seção visual e uma chave no backend
  groups: AttrGroup[] = [];

  selectedIconFile: File | null = null;
  iconPreviewUrl = '';
  isSaving     = false;
  errorMessage = '';
  successMessage = '';

  private readonly GUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/personagens']); return; }
    this.loadCharacter(id);
  }

  // ─── CARREGAR ──────────────────────────────────────────
  private loadCharacter(id: string): void {
    this.characterService.GetById(id).subscribe({
      next: (res) => {
        this.character = res.data ?? null;
        if (!this.character) { this.router.navigate(['/personagens']); return; }
        this.editForm = { name: this.character.name, description: this.character.description ?? '' };
        this.groups = this.buildGroups((this.character as any).properties);
        this.selectedIconFile = null;
        this.iconPreviewUrl = '';
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/personagens']),
    });
  }

  // ─── CONVERTER properties → AttrGroup[] ────────────────
  /**
   * Suporta todos os formatos que o backend pode retornar:
   *   1. { "<title>_<uuid>": { title, data: [...] } }  ← novo formato (CharacterPropertyOrganization)
   *   2. { "<key>": [ { Name, Value }, ... ] }          ← formato Properties[chave] com array
   *   3. { "<key>": { Name, Value } }                   ← objeto único legado
   *   4. { "<key>": "valor" }                           ← escalar simples
   */
  private buildGroups(props: any): AttrGroup[] {
    if (!props || typeof props !== 'object') return [];
    const groups: AttrGroup[] = [];

    for (const [rawKey, val] of Object.entries(props)) {
      const groupTitle = this.cleanKey(rawKey, val);
      const entries    = this.extractEntries(val);
      groups.push({ title: groupTitle, entries });
    }

    return groups;
  }

  private cleanKey(rawKey: string, node: any): string {
    // Usa o title do nó se disponível (novo formato)
    if (node && typeof node === 'object' && !Array.isArray(node) && node.title) {
      return String(node.title);
    }
    // Chave é só um UUID — título genérico
    if (this.GUID_RE.test(rawKey)) return 'Grupo';
    // Remove sufixo "_uuid" se presente
    return rawKey.replace(/_[0-9a-f-]{36}$/i, '').trim() || rawKey;
  }

  private extractEntries(val: any): AttrEntry[] {
    const out: AttrEntry[] = [];
    this.walkNode(val, '', out);
    return out;
  }

  private walkNode(node: any, parentKey: string, out: AttrEntry[]): void {
    if (node === null || node === undefined) return;

    // Primitivo
    if (typeof node !== 'object') {
      if (parentKey) out.push({ key: parentKey, value: String(node) });
      return;
    }

    // Array — itera itens
    if (Array.isArray(node)) {
      for (const item of node) this.walkNode(item, parentKey, out);
      return;
    }

    // Formato { Name, Value } (legado ou novo)
    if ('Name' in node || 'Value' in node) {
      const k = String((node.Name ?? node.name ?? parentKey) || 'Atributo');
      const v = String(node.Value ?? node.value ?? '');
      out.push({ key: k, value: v });
      return;
    }

    // CharacterPropertyOrganization: { id, title, type, data: [...] }
    if ('data' in node) {
      const childKey = node.title ? String(node.title) : parentKey;
      const data = node.data;

      if (Array.isArray(data) && data.length > 0) {
        for (const child of data) this.walkNode(child, childKey, out);
        return;
      }

      // Folha: data é objeto { value: "..." }
      if (data && typeof data === 'object' && 'value' in data) {
        out.push({ key: childKey, value: String(data['value'] ?? '') });
        return;
      }

      // Folha: data é objeto vazio
      if (childKey) out.push({ key: childKey, value: '' });
      return;
    }

    // Objeto genérico — itera entradas
    for (const [k, v] of Object.entries(node)) {
      this.walkNode(v, k, out);
    }
  }

  // ─── GRUPOS: adicionar / remover ───────────────────────
  addGroup(): void {
    this.groups.push({ title: '', entries: [] });
  }

  removeGroup(index: number): void {
    this.groups.splice(index, 1);
  }

  // ─── ENTRADAS dentro de um grupo ───────────────────────
  addEntry(group: AttrGroup): void {
    group.entries.push({ key: '', value: '' });
  }

  removeEntry(group: AttrGroup, index: number): void {
    group.entries.splice(index, 1);
  }

  // ─── ÍCONE ─────────────────────────────────────────────
  onIconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { this.errorMessage = 'A imagem deve ter no máximo 2MB.'; return; }
    this.selectedIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.iconPreviewUrl = e.target?.result as string; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  // ─── SALVAR ────────────────────────────────────────────
  /**
   * Cada grupo vira Properties[título] = JSON.stringify([{ Name, Value }, ...])
   * compatível com o backend ASP.NET [FromForm] + Dictionary<string, JsonElement>.
   */
  Save(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.editForm.name.trim()) { this.errorMessage = 'O nome do personagem é obrigatório.'; return; }

    const form = new FormData();
    form.append('id',          this.character!.id);
    form.append('name',        this.editForm.name.trim());
    form.append('description', this.editForm.description ?? '');

    // Monta um único objeto properties, igual ao edit-character-modal que funciona
    const propertiesObj: Record<string, any> = {};
    for (const group of this.groups) {
      const key = group.title.trim() || 'Grupo';
      propertiesObj[key] = group.entries
        .filter(e => e.key.trim())
        .map(e => ({ Name: e.key.trim(), Value: e.value }));
    }
    form.append('properties', JSON.stringify(propertiesObj));

    if (this.selectedIconFile) form.append('icon', this.selectedIconFile, this.selectedIconFile.name);

    this.isSaving = true;
    this.characterService.Update(form as any).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Personagem salvo com sucesso!';
        this.loadCharacter(this.character!.id);
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        const body = err?.error;
        this.errorMessage =
          (body?.errors ? (Object.values(body.errors).flat() as string[])[0] : null)
          ?? body?.message ?? body?.title ?? 'Erro ao salvar.';
      },
    });
  }

  confirmDelete(): void {
    if (!confirm('Tem certeza que deseja excluir este personagem? Esta ação é irreversível.')) return;
    this.characterService.Delete(this.character!.id).subscribe({
      next:  () => this.router.navigate(['/personagens']),
      error: () => { this.errorMessage = 'Erro ao excluir personagem.'; },
    });
  }

  goBack(): void { this.router.navigate(['/personagens']); }

  private parseError(err: any): string | null {
    const body = err?.error;
    if (body?.errors) return (Object.values(body.errors).flat() as string[])[0] ?? null;
    return body?.message ?? body?.title ?? null;
  }
}