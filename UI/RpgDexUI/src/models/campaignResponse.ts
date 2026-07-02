export interface CampaignResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  gameMasterId: string;
  maxPlayers: number;
  playerIds?: string[];
  characterIds?: string[];
}
