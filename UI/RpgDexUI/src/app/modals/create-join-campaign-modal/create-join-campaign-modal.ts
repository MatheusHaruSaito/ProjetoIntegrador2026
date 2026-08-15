import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-join-campaign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-join-campaign-modal.html',
  styleUrls: ['./create-join-campaign-modal.css']
})
export class CreateJoinCampaignModalComponent {
  private cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() activeTab: 'create' | 'join' = 'create';

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onCreate = new EventEmitter<FormData>();
  @Output() onJoin = new EventEmitter<{ campaignId: string; password?: string }>();

  // Campos de Criação
  newTitle = '';
  newDescription = '';
  newPassword = '';
  newMaxPlayers = 4;
  selectedIconFile: File | null = null;
  coverPreviewUrl = '';

  // Campos de Entrada
  joinId = '';
  joinPassword = '';

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  validateMaxPlayers(): void {
    if (this.newMaxPlayers < 1) this.newMaxPlayers = 1;
    if (this.newMaxPlayers > 20) this.newMaxPlayers = 20;
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

  submitCreate(): void {
    if (!this.newTitle || !this.selectedIconFile) return;

    const form = new FormData();
    form.append('title', this.newTitle.substring(0, 60));
    form.append('maxPlayers', this.newMaxPlayers.toString());
    form.append('icon', this.selectedIconFile, this.selectedIconFile.name);
    if (this.newDescription) form.append('description', this.newDescription.substring(0, 1000));
    if (this.newPassword) form.append('password', this.newPassword.substring(0, 50));

    this.onCreate.emit(form);
    this.close();
  }

  submitJoin(): void {
    if (!this.joinId) return;

    this.onJoin.emit({
      campaignId: this.joinId.trim().substring(0, 100),
      password: this.joinPassword ? this.joinPassword.substring(0, 50) : undefined
    });
    this.close();
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newPassword = '';
    this.newMaxPlayers = 4;
    this.selectedIconFile = null;
    this.coverPreviewUrl = '';
    this.joinId = '';
    this.joinPassword = '';
  }
}