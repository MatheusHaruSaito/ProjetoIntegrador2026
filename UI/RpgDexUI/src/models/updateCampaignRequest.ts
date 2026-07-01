export interface UpdateCampaignRequest {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  playersId?: string[];
  charactersId?: string[];
}