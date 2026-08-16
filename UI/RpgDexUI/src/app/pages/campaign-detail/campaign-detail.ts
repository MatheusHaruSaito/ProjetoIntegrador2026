import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign-service';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Campaign } from '../../../models/campaign';
import { Character } from '../../../models/character';
import { EditCampaignModalComponent } from '../../modals/edit-campaign-modal/edit-campaign-modal';
import { CharacterViewerComponent } from '../../pages/character-viewer/character-viewer';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EditCampaignModalComponent,
    CharacterViewerComponent
  ],
  providers: [DatePipe],
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.css']
})
export class CampaignDetailComponent implements OnInit {
  @ViewChild('alertBanner') alertBanner?: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private characterService = inject(CharacterService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private datePipe = inject(DatePipe);

  campaignId = '';
  currentUserId = '';
  campaign?: Campaign;

  isGameMaster = false;
  isPlayerInCampaign = false;

  approvedCharacters: Character[] = [];
  pendingCharacters: Character[] = [];
  expandedCharacterId: string | null = null;

  isEditModalOpen = false;
  requireApproval = true;

  joinPassword = '';
  myCharacters: Character[] = [];
  selectedCharacterId = '';
  selectedGmCharacterId = '';
  copiedFeedback = false;

  // Controle de alertas e notificações
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private feedbackTimeout: any;

  ngOnInit(): void {
    this.currentUserId = this.authService.getLoggedUserId() ?? '';
    this.campaignId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.campaignId) {
      this.loadCampaign();
      this.loadMyCharacters();
    }
  }

  // Dispara mensagens de feedback temporárias e foca no elemento visualmente
  showFeedback(message: string, isError: boolean = false): void {
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);

    if (isError) {
      this.errorMessage = message;
      this.successMessage = null;
    } else {
      this.successMessage = message;
      this.errorMessage = null;
    }

    this.cdr.detectChanges();

    // Rola a tela suavemente para focar na mensagem de alerta
    setTimeout(() => {
      if (this.alertBanner?.nativeElement) {
        this.alertBanner.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 50);

    this.feedbackTimeout = setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, 5000);
  }

  // Extrai a mensagem de erro retornada do backend
  private getErrorMessage(err: any, fallbackMessage: string): string {
    return err?.error?.message || err?.error?.title || fallbackMessage;
  }

  loadCampaign(): void {
    this.campaignService.GetById(this.campaignId).subscribe({
      next: (res) => {
        this.campaign = res.data;
        if (this.campaign) {
          this.isGameMaster = this.campaign.gameMasterId === this.currentUserId;
          this.isPlayerInCampaign = !!this.campaign.playerIds?.includes(this.currentUserId);
          this.loadApprovedCharacters();
          this.loadPendingCharacters();
        }
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/campanhas'])
    });
  }

  loadMyCharacters(): void {
    if (!this.currentUserId) return;
    this.characterService.GetAll(this.currentUserId).subscribe({
      next: (res) => {
        this.myCharacters = res.data ?? [];
        this.cdr.detectChanges();
      }
    });
  }

  loadApprovedCharacters(): void {
    if (!this.campaign?.characterIds || this.campaign.characterIds.length === 0) {
      this.approvedCharacters = [];
      return;
    }

    this.approvedCharacters = [];
    this.campaign.characterIds.forEach(id => {
      this.characterService.GetById(id).subscribe({
        next: (res) => {
          if (res.data) {
            this.approvedCharacters.push(res.data);
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  loadPendingCharacters(): void {
    if (!this.campaign?.characterRequests || this.campaign.characterRequests.length === 0) {
      this.pendingCharacters = [];
      return;
    }

    this.pendingCharacters = [];
    this.campaign.characterRequests.forEach(id => {
      this.characterService.GetById(id).subscribe({
        next: (res) => {
          if (res.data) {
            this.pendingCharacters.push(res.data);
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  formatNextSession(dateValue: any): string {
    if (!dateValue) return 'A Definir';

    const sessionDate = new Date(dateValue);
    const now = new Date();

    if (isNaN(sessionDate.getTime()) || sessionDate.getFullYear() <= 2000 || sessionDate < now) {
      return 'A Definir';
    }

    return this.datePipe.transform(sessionDate, 'dd/MM/yyyy HH:mm') || 'A Definir';
  }

  toggleCharacter(charId: string): void {
    this.expandedCharacterId = this.expandedCharacterId === charId ? null : charId;
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

  joinCampaign(): void {
    if (!this.campaign) return;
    this.campaignService.AddPlayer({
      campaignId: this.campaign.id,
      playerId: this.currentUserId,
      password: this.joinPassword
    }).subscribe({
      next: () => {
        this.showFeedback('Você entrou na campanha com sucesso!');
        this.loadCampaign();
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Erro ao entrar na campanha. Verifique a senha.'), true)
    });
  }

  submitCharacter(customCharId?: string): void {
    const charId = customCharId || this.selectedCharacterId;
    if (!this.campaign || !charId) return;

    this.campaignService.AddCharacter({
      campaignId: this.campaign.id,
      characterId: charId
    }).subscribe({
      next: () => {
        this.selectedGmCharacterId = '';
        this.selectedCharacterId = '';
        this.showFeedback('Ficha vinculada/enviada com sucesso!');
        this.loadCampaign();
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Não foi possível vincular o personagem.'), true)
    });
  }

  handleCharacterApproval(characterId: string, approve: boolean): void {
    if (!this.campaign) return;

    this.campaignService.AcceptCharacter({
      userId: this.currentUserId,
      campaignId: this.campaign.id,
      characterId: characterId,
      IsAccepted: approve
    }).subscribe({
      next: () => {
        this.showFeedback(approve ? 'Personagem aprovado na mesa!' : 'Solicitação recusada.');
        this.loadCampaign();
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Erro ao processar solicitação de personagem.'), true)
    });
  }

  removePlayer(userId: string): void {
    if (!this.campaign) return;

    this.campaignService.RemovePlayer({
      campaignId: this.campaign.id,
      playerId: userId,
      issuerPlayerId: this.currentUserId
    }).subscribe({
      next: () => {
        if (userId === this.currentUserId) {
          this.router.navigate(['/campanhas']);
        } else {
          this.showFeedback('Jogador removido com sucesso.');
          this.loadCampaign();
        }
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Erro ao remover jogador.'), true)
    });
  }

  toggleActiveState(): void {
    if (!this.campaign) return;

    const newState = !this.campaign.isActive;
    const updatePayload: any = {
      id: this.campaign.id,
      title: this.campaign.title,
      description: this.campaign.description,
      maxPlayers: this.campaign.maxPlayers,
      nextSession: this.campaign.nextSession,
      isActive: newState,
      icon: null
    };

    this.campaignService.Update(updatePayload).subscribe({
      next: () => {
        this.showFeedback(`Campanha ${newState ? 'reativada' : 'desativada'} com sucesso!`);
        this.loadCampaign();
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Erro ao alterar status da campanha.'), true)
    });
  }

  toggleRequireApproval(): void {
    // Implementar a chamada para atualização de configuração no banco caso necessário
  }

  saveCampaignChanges(eventData: any): void {
    this.campaignService.Update(eventData).subscribe({
      next: () => {
        this.isEditModalOpen = false;
        this.showFeedback('Campanha atualizada com sucesso!');
        this.loadCampaign();
      },
      error: (err) => this.showFeedback(this.getErrorMessage(err, 'Erro ao atualizar dados da campanha.'), true)
    });
  }
}