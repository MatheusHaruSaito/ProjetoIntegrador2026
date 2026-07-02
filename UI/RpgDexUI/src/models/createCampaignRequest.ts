export interface CreateCampaignRequest {
  title: string;
  description?: string;
  password: string;
  maxPlayers: number;
  gameMasterId: string;
}
