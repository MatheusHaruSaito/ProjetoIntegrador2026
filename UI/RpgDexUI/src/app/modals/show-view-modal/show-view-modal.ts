import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Character } from '../../../models/character';
import { CharacterService } from '../../services/character-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-view-modal',
  imports: [CommonModule],
  templateUrl: './show-view-modal.html',
  styleUrl: './show-view-modal.css',
})
export class ShowViewModal implements OnChanges {
  @Input() visible = false;
  @Input() characterId = '';
  @Output() close = new EventEmitter<void>();

  viewCharacter: Character | any;
  characterService = inject(CharacterService);
  cdr = inject(ChangeDetectorRef);
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue == true) {
      this.ShowCharacter();
    }
  }
  ShowCharacter(): void {
    this.characterService.GetById(this.characterId).subscribe({
      next: (res) => {
        console.log('teste');

        this.viewCharacter = res.data!;
        this.cdr.detectChanges();
      },
    });
  }

  CloseViewModal(): void {
    this.close.emit();
    this.viewCharacter = null;
  }
  viewPropertiesEntries(): { key: string; value: any }[] {
    const props = (this.viewCharacter as any)?.properties;
    if (!props || typeof props !== 'object') return [];
    return Object.entries(props).map(([key, value]) => ({ key, value }));
  }
}
