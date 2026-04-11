import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Campaign {
  id: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.css']
})
export class CampaignsComponent {
  myCampaigns: Campaign[] = [
    { 
      id: 1, 
      name: 'A Mina Perdida', 
      imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+1' 
    },
    { 
      id: 2, 
      name: 'Maldição de Strahd', 
      imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+2' 
    }
  ];

  isModalOpen = false;

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}