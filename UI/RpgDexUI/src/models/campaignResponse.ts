export interface CampaignResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  gameMasterId: string;
  playersId?: string[];
  charactersId?: string[];
}