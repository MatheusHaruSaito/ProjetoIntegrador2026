import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign-service';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Campaign } from '../../../models/campaign';
import { Character } from '../../../models/character';
import { JoinCampaignRequest } from '../../../models/JoinCampaignRequest';
import { AddCharacterToCampaignRequest } from '../../../models/AddCharacterToCampaignRequest';
import { AcceptCharacterToCampaignRequest } from '../../../models/AcceptCharacterToCampaignRequest';
import { RemovePlayerFromCampaignRequest } from '../../../models/removePlayerFromCampaignRequest';
import { UpdateCampaignSettingsRequest } from '../../../models/updateCampaignSettingsRequest';

export interface SheetItem { name: string; value: any; }
export interface SheetSection { title: string; items: SheetItem[]; }
export interface SheetColumn { key: string; sections: SheetSection[]; scalar?: string; }

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.css']
})
export class CampaignDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private characterService = inject(CharacterService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  campaignId = '';
  currentUserId = '';
  campaign?: Campaign;

  isGameMaster = false;
  isPlayerInCampaign = false;

  // Personagens Aprovados
  approvedCharacters: Character[] = [];
  expandedCharacterId: string | null = null;

  // Modal edição
  isEditModalOpen = false;
  editTitle = '';
  editDescription = '';
  editMaxPlayers = 4;
  editNextSession = '';
  editIconFile: File | null = null;
  editCoverPreview = '';

  // Painel do mestre
  requireApproval = true;

  // Entrada / vínculo
  joinPassword = '';
  myCharacters: Character[] = [];
  selectedCharacterId = '';
  copiedFeedback = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getLoggedUserId() ?? '';
    this.campaignId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.campaignId) {
      this.loadCampaign();
      this.loadMyCharacters();
    }
  }

  loadCampaign(): void {
    this.campaignService.GetById(this.campaignId).subscribe({
      next: (res) => {
        this.campaign = res.data;
        if (this.campaign) {
          this.isGameMaster = this.campaign.gameMasterId === this.currentUserId;
          this.isPlayerInCampaign = !!this.campaign.playerIds?.includes(this.currentUserId);
          this.editTitle = this.campaign.title;
          this.editDescription = this.campaign.description ?? '';
          this.editMaxPlayers = this.campaign.maxPlayers;
          if (this.campaign.nextSession) {
            this.editNextSession = new Date(this.campaign.nextSession).toISOString().slice(0, 16);
          } else {
            this.editNextSession = '';
          }
          this.loadApprovedCharacters();
        }
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  private loadMyCharacters(): void {
    if (!this.currentUserId) return;
    this.characterService.GetAll(this.currentUserId).subscribe({
      next: (res) => {
        this.myCharacters = (res.data ?? []).filter(c => c.userId === this.currentUserId);
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  private loadApprovedCharacters(): void {
    if (!this.campaign?.characterIds || this.campaign.characterIds.length === 0) {
      this.approvedCharacters = [];
      return;
    }

    // Carrega detalhes dos personagens que já foram aceitos
    this.approvedCharacters = [];
    this.campaign.characterIds.forEach(charId => {
      this.characterService.GetById(charId).subscribe({
        next: (r) => {
          if (r.data) {
            this.approvedCharacters.push(r.data);
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  copyCampaignCode(): void {
    if (!this.campaign?.id) return;
    navigator.clipboard.writeText(this.campaign.id);
    this.copiedFeedback = true;
    setTimeout(() => {
      this.copiedFeedback = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  // ── Validação ──
  validateEditMaxPlayers(): void {
    if (this.editMaxPlayers < 1) this.editMaxPlayers = 1;
    if (this.editMaxPlayers > 20) this.editMaxPlayers = 20;
  }

  // ── Configurações ──
  toggleRequireApproval(): void {
    if (!this.campaign) return;
    const request: UpdateCampaignSettingsRequest = {
      campaignId: this.campaign.id,
      RequireApprovalForCharacters: this.requireApproval
    };
    this.campaignService.UpdateSettings(request).subscribe({ error: () => { } });
  }

  // ── Editar campanha ──
  onEditFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editIconFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editCoverPreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveCampaignChanges(): void {
    if (!this.campaign) return;

    const title = this.editTitle.substring(0, 60);
    const description = this.editDescription ? this.editDescription.substring(0, 1000) : '';

    const form = new FormData();
    form.append('id', this.campaign.id);
    form.append('title', title);
    form.append('description', description);
    form.append('maxPlayers', this.editMaxPlayers.toString());
    if (this.editNextSession) {
      form.append('nextSession', new Date(this.editNextSession).toISOString());
    } else {
      form.append('nextSession', '');
    } 
    if (this.editIconFile)
      form.append('icon', this.editIconFile, this.editIconFile.name);

    this.campaignService.Update(form as any).subscribe({
      next: () => {
        this.isEditModalOpen = false;
        this.editCoverPreview = '';
        this.editIconFile = null;
        this.loadCampaign();
      },
      error: () => { }
    });
  }

  // ── Ativar/desativar ──
  toggleActiveState(): void {
    if (!this.campaign || !confirm('Deseja alterar o estado desta campanha?')) return;
    this.campaignService.Delete(this.campaign.id).subscribe({
      next: () => this.loadCampaign(),
      error: () => { }
    });
  }

  // ── Entrar ──
  joinCampaign(): void {
    if (!this.campaign) return;
    const request: JoinCampaignRequest = {
      campaignId: this.campaign.id,
      playerId: this.currentUserId,
      password: this.joinPassword ? this.joinPassword.substring(0, 50) : undefined
    };
    this.campaignService.AddPlayer(request).subscribe({
      next: () => { this.joinPassword = ''; this.loadCampaign(); },
      error: () => alert('Erro ao entrar. Verifique a senha.')
    });
  }

  // ── Vincular personagem ──
  submitCharacter(): void {
    if (!this.campaign || !this.selectedCharacterId) return;
    const request: AddCharacterToCampaignRequest = {
      campaignId: this.campaign.id,
      characterId: this.selectedCharacterId
    };
    this.campaignService.AddCharacter(request).subscribe({
      next: () => {
        alert('Personagem enviado para a campanha!');
        this.selectedCharacterId = '';
        this.loadCampaign();
      },
      error: () => { }
    });
  }

  // ── Aprovação ──
  handleCharacterApproval(characterId: string, accept: boolean): void {
    if (!this.campaign) return;
    const request: AcceptCharacterToCampaignRequest = {
      userId: this.currentUserId,
      campaignId: this.campaign.id,
      characterId,
      IsAccepted: accept
    };
    this.campaignService.AcceptCharacter(request).subscribe({
      next: () => this.loadCampaign(),
      error: () => { }
    });
  }

  // ── Remover/Sair da Jogadores ──
  removePlayer(playerId: string): void {
    if (!this.campaign) return;
    const isSelf = playerId === this.currentUserId;
    const msg = isSelf ? 'Deseja realmente sair desta campanha?' : 'Remover este jogador da campanha?';

    if (!confirm(msg)) return;

    const request: RemovePlayerFromCampaignRequest = {
      campaignId: this.campaign.id,
      issuerPlayerId: this.currentUserId,
      playerId
    };
    this.campaignService.RemovePlayer(request).subscribe({
      next: () => {
        if (isSelf) {
          this.router.navigate(['/jogar']);
        } else {
          this.loadCampaign();
        }
      },
      error: () => { }
    });
  }

  // ── Leitura de Atributos da Ficha ──
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