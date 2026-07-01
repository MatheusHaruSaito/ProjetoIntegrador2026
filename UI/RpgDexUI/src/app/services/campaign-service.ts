import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateCampaignRequest } from '../../models/createCampaignRequest';
import { UpdateCampaignRequest } from '../../models/updateCampaignRequest';
import { Observable } from 'rxjs';
import { CampaignResponse } from '../../models/campaignResponse';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly controller = 'Campaign';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;

  http = inject(HttpClient);

  Post(request: CreateCampaignRequest) : Observable<CampaignResponse> {
    return this.http.post<CampaignResponse>(`${this.env}`, request);
  }
  GetAll() : Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.env}`);
  }
  GetAllByUserId(userId: string) : Observable<CampaignResponse[]> {
    return this.http.get<CampaignResponse[]>(`${this.env}/${userId}/All`);
  }

  GetById(Id: String) : Observable<CampaignResponse> {
    return this.http.get<CampaignResponse>(`${this.env}/${Id}`);
  }
  Update(campaign: UpdateCampaignRequest) : Observable<CampaignResponse> {
    return this.http.put<CampaignResponse>(`${this.env}`, campaign);
  }
}
