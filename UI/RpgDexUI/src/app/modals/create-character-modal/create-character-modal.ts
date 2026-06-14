import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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

  public propertyTypes: { key: string; value: CharacterPropertyOrganizationEnum }[] = [];
  // ── Criar ──
  isLoading = false;
  errorMessage = '';
  newCharacter: { name: string; description: string } = { name: '', description: '' };
  selectedIconFile: File | null = null;
  iconPreviewUrl = '';
  customProperties: CharacterPropertyOrganization[] = [];

  ngOnInit(): void {
    this.propertyTypes = Object.keys(CharacterPropertyOrganizationEnum).map((key) => ({
      key: key,
      value:
        CharacterPropertyOrganizationEnum[key as keyof typeof CharacterPropertyOrganizationEnum],
    }));
  }
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
      if (prop.id) {
        propertiesObj[prop.id] = prop.data;
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

  //Aqui é o botão do form para adicionar uma organização
  addPropertyOrganizationField(id: string): void {
    const newId = crypto.randomUUID();
    //para testes vou utilizar isso, depois implementa ae
    let test: CharacterPropertyOrganization = {
      id: newId,
      title: 'Test',
      type: CharacterPropertyOrganizationEnum.Collum,
      data: [],
    };
    this.addPropertyOrganization(id, test);
  }
  addPropertyOrganization(id: string, organization: CharacterPropertyOrganization): void {
    let parentProperty: CharacterPropertyOrganization | null = null;
    if (this.customProperties.length > 0) {
      parentProperty = this.searchProperty(id, this.customProperties);
    }

    if (parentProperty) {
      if (!parentProperty.data) {
        parentProperty.data = [];
      }
      parentProperty.data.push(organization);
    } else {
      this.customProperties.push(organization);
    }
    console.log(this.customProperties);
  }
  searchProperty(
    id: string,
    propertyList: CharacterPropertyOrganization[],
  ): CharacterPropertyOrganization | null {
    for (const prop of propertyList) {
      if (prop.id === id) {
        return (propertyList.length, prop);
      }
      if (prop.data && Array.isArray(prop.data)) {
        let nested = this.searchProperty(id, prop.data);
        console.log('nested ', nested);

        if (nested) {
          return nested;
        }
      }
    }
    return null;
  }

  //Botão para adicionar Propriedade de valor na Organização
  addPropertyField(id: string): void {
    // this.customProperties[0].data!['push']({ id: '', value: '' });
    const newId = crypto.randomUUID();
    //Para teste vou usar isso
    let test: CharacterPropertyModel = {
      id: newId,
      title: 'Test',
      type: CharacterPropertyValueEnum.Default,
      data: {},
    };
    this.addPropertyTo(id, test);
  }

  addPropertyTo(id: string, organization: CharacterPropertyModel): void {
    let parentProperty: CharacterPropertyOrganization | null = null;
    if (this.customProperties.length > 0) {
      parentProperty = this.searchProperty(id, this.customProperties);
    }

    if (parentProperty) {
      if (!parentProperty.data) {
        parentProperty.data = [];
      }
      parentProperty.data.push(organization);
    }

    console.log(this.customProperties);
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
