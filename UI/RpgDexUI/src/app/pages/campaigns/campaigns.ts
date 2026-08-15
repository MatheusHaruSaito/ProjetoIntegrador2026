import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { CampaignService } from '../../services/campaign-service';
import { Character } from '../../../models/character';
import { Campaign } from '../../../models/campaign';
import { JoinCampaignRequest } from '../../../models/JoinCampaignRequest';

export interface SheetItem    { name: string; value: any; }
export interface SheetSection { title: string; items: SheetItem[]; }
export interface SheetColumn  { key: string; sections: SheetSection[]; scalar?: string; }

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.css']
})
export class CampaignsComponent implements OnInit {
  private characterService = inject(CharacterService);
  private campaignService  = inject(CampaignService);
  private authService      = inject(AuthService);
  private router           = inject(Router);
  private cdr              = inject(ChangeDetectorRef);

  myCampaigns: Campaign[] = [];
  myCharacters: Character[] = [];
  expandedCharacterId: string | null = null;
  currentUserId = '';

  // Controladores do Modal Único
  isModalOpen = false;
  activeTab: 'create' | 'join' = 'create';

  // Formulário: Criar Campanha
  newCampaignTitle = '';
  newCampaignDescription = '';
  newCampaignPassword = '';
  newCampaignMaxPlayers = 4;
  selectedIconFile: File | null = null;
  coverPreviewUrl = '';

  // Formulário: Entrar na Campanha
  joinCampaignId = '';
  joinPassword = '';

  ngOnInit(): void {
    this.currentUserId = this.authService.getLoggedUserId() ?? '';
    this.loadCampaigns();
    this.loadCharacters();
  }

  private loadCampaigns(): void {
    if (!this.currentUserId) return;
    this.campaignService.GetAllByUserId(this.currentUserId).subscribe({
      next: (r) => { this.myCampaigns = r.data ?? []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  goToCampaignDetail(id: string): void {
    this.router.navigate(['/campanha', id]);
  }

  toggleModal(tab: 'create' | 'join' = 'create'): void {
    this.activeTab = tab;
    this.isModalOpen = !this.isModalOpen;
    if (!this.isModalOpen) this.resetModalForm();
  }

  setTab(tab: 'create' | 'join'): void {
    this.activeTab = tab;
  }

  // --- AÇÃO: ENTRAR EM UMA CAMPANHA ---
  joinCampaign(): void {
    if (!this.joinCampaignId || !this.currentUserId) return;

    const request: JoinCampaignRequest = {
      campaignId: this.joinCampaignId.trim().slice(0, 100),
      playerId: this.currentUserId,
      password: this.joinPassword ? this.joinPassword.slice(0, 50) : undefined
    };

    this.campaignService.AddPlayer(request).subscribe({
      next: () => {
        alert('Você entrou na campanha!');
        this.toggleModal();
        this.loadCampaigns();
      },
      error: (err) => {
        alert('Erro ao entrar na campanha. Verifique se o ID/Código e a Senha estão corretos.');
        console.error(err);
      }
    });
  }

  // --- AÇÃO: CRIAR CAMPANHA ---
  validateMaxPlayers(): void {
    if (this.newCampaignMaxPlayers < 1)  this.newCampaignMaxPlayers = 1;
    if (this.newCampaignMaxPlayers > 20) this.newCampaignMaxPlayers = 20;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverPreviewUrl = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  createCampaign(): void {
    if (!this.currentUserId || !this.newCampaignTitle || !this.selectedIconFile) return;

    const title = this.newCampaignTitle.substring(0, 60);
    const description = this.newCampaignDescription ? this.newCampaignDescription.substring(0, 1000) : '';
    const password = this.newCampaignPassword ? this.newCampaignPassword.substring(0, 50) : '';

    const form = new FormData();
    form.append('title',        title);
    form.append('gameMasterId',  this.currentUserId);
    form.append('maxPlayers',   this.newCampaignMaxPlayers.toString());
    form.append('icon',         this.selectedIconFile, this.selectedIconFile.name);
    if (description) form.append('description', description);
    if (password)    form.append('password',    password);

    this.campaignService.Post(form as any).subscribe({
      next: () => { this.toggleModal(); this.loadCampaigns(); },
      error: () => {}
    });
  }

  private resetModalForm(): void {
    this.newCampaignTitle = '';
    this.newCampaignDescription = '';
    this.newCampaignPassword = '';
    this.newCampaignMaxPlayers = 4;
    this.selectedIconFile = null;
    this.coverPreviewUrl = '';
    this.joinCampaignId = '';
    this.joinPassword = '';
  }

  private loadCharacters(): void {
    if (!this.currentUserId) return;
    this.characterService.GetAll(this.currentUserId).subscribe({
      next: (r) => { this.myCharacters = r.data ?? []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  toggleCharacter(id: string): void {
    this.expandedCharacterId = this.expandedCharacterId === id ? null : id;
  }

  getSheetColumns(character: Character): SheetColumn[] {
    if (!character.properties) return [];
    return Object.entries(character.properties).map(([colKey, colValue]) => {
      if (!Array.isArray(colValue) && typeof colValue !== 'object')
        return { key: colKey, sections: [], scalar: String(colValue) };
      if (Array.isArray(colValue) && colValue.length > 0 && 'Name' in colValue[0])
        return { key: colKey, sections: [{ title: colKey, items: colValue.map((i: any) => ({ name: i.Name ?? i.name, value: i.Value ?? i.value })) }] };
      if (Array.isArray(colValue)) {
        const sections: SheetSection[] = [];
        for (const block of colValue)
          if (typeof block === 'object' && block !== null)
            for (const [sk, sv] of Object.entries(block))
              if (Array.isArray(sv))
                sections.push({ title: sk, items: (sv as any[]).map(i => ({ name: i.Name ?? i.name ?? '', value: i.Value ?? i.value ?? '' })) });
        return { key: colKey, sections };
      }
      if (typeof colValue === 'object' && colValue !== null) {
        const sections: SheetSection[] = [];
        for (const [sk, sv] of Object.entries(colValue as Record<string, any>))
          if (Array.isArray(sv))
            sections.push({ title: sk, items: (sv as any[]).map(i => ({ name: i.Name ?? i.name ?? '', value: i.Value ?? i.value ?? '' })) });
        return { key: colKey, sections };
      }
      return { key: colKey, sections: [] };
    });
  }
}