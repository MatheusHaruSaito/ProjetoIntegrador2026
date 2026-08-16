import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../../models/character';

export interface SheetItem {
  name: string;
  value: any;
}

export interface SheetSection {
  title: string;
  items: SheetItem[];
}

export interface SheetColumn {
  key: string;
  sections: SheetSection[];
  scalar?: string;
}

@Component({
  selector: 'app-character-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-viewer.html',
  styleUrls: ['./character-viewer.css']
})
export class CharacterViewerComponent {
  @Input() character?: Character;

  getSheetColumns(): SheetColumn[] {
    if (!this.character) return [];
    const props = (this.character as any).properties;
    if (!props || typeof props !== 'object') return [];

    const cols: SheetColumn[] = [];
    Object.entries(props).forEach(([key, val]) => {
      if (typeof val !== 'object' || val === null) {
        cols.push({ key, sections: [], scalar: String(val) });
      } else if (Array.isArray(val)) {
        const items = val.map((i: any) => ({
          name: String(i.Name ?? i.name ?? 'Atributo'),
          value: i.Value ?? i.value ?? ''
        }));
        cols.push({ key, sections: [{ title: key, items }] });
      } else {
        const sections: SheetSection[] = [];
        Object.entries(val).forEach(([subKey, subVal]) => {
          if (Array.isArray(subVal)) {
            const items = subVal.map((i: any) => ({
              name: String(i.Name ?? i.name ?? 'Atributo'),
              value: i.Value ?? i.value ?? ''
            }));
            sections.push({ title: subKey, items });
          }
        });
        cols.push({ key, sections });
      }
    });

    return cols;
  }
}