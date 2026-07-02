export interface UpdateCampaignRequest {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  playerIds?: string[];
  characterIds?: string[];
}
