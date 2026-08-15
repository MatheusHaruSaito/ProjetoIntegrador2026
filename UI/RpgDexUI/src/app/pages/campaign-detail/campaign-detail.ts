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
import { EditCampaignModalComponent } from '../../modals/edit-campaign-modal/edit-campaign-modal';

export interface SheetItem { name: string; value: any; }
export interface SheetSection { title: string; items: SheetItem[]; }
export interface SheetColumn { key: string; sections: SheetSection[]; scalar?: string; }

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EditCampaignModalComponent],
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

  approvedCharacters: Character[] = [];
  expandedCharacterId: string | null = null;

  isEditModalOpen = false;
  requireApproval = true;

  joinPassword = '';
  myCharacters: Character[] = [];
  selectedCharacterId = '';
  selectedGmCharacterId = '';
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

  toggleRequireApproval(): void {
    if (!this.campaign) return;
    const request: UpdateCampaignSettingsRequest = {
      campaignId: this.campaign.id,
      RequireApprovalForCharacters: this.requireApproval
    };
    this.campaignService.UpdateSettings(request).subscribe({ error: () => { } });
  }

  saveCampaignChanges(formData: FormData): void {
    this.campaignService.Update(formData as any).subscribe({
      next: () => this.loadCampaign(),
      error: () => { }
    });
  }

  toggleActiveState(): void {
    if (!this.campaign || !confirm('Deseja alterar o estado desta campanha?')) return;
    this.campaignService.Delete(this.campaign.id).subscribe({
      next: () => this.loadCampaign(),
      error: () => { }
    });
  }

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

  submitCharacter(characterIdToSubmit?: string): void {
    const charId = characterIdToSubmit || this.selectedCharacterId;
    if (!this.campaign || !charId) return;

    const request: AddCharacterToCampaignRequest = {
      campaignId: this.campaign.id,
      characterId: charId
    };

    this.campaignService.AddCharacter(request).subscribe({
      next: () => {
        alert('Personagem adicionado/enviado para a campanha!');
        if (characterIdToSubmit) {
          this.selectedGmCharacterId = '';
        } else {
          this.selectedCharacterId = '';
        }
        this.loadCampaign();
      },
      error: () => { }
    });
  }

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