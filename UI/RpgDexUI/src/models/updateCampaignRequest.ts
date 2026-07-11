export interface UpdateCampaignRequest {
  id: string;
  title: string;
  description?: string;
  icon: File;
  maxPlayers: number;
}
