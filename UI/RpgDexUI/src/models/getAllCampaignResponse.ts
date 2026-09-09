import { Campaign } from './campaign';

export interface GetAllCampaignResponse {
  campaigns: Campaign[];
  campaignLenght: number;
}