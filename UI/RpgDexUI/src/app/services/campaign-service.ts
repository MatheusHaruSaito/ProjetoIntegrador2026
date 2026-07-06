import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateCampaignRequest } from '../../models/createCampaignRequest';
import { UpdateCampaignRequest } from '../../models/updateCampaignRequest';
import { Observable } from 'rxjs';
import { Campaign } from '../../models/campaign';
import { ApiResponse } from '../../models/apiResponse';
import { JoinCampaignRequest } from '../../models/JoinCampaignRequest';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly controller = 'Campaign';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;

  http = inject(HttpClient);

  Post(request: CreateCampaignRequest): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.env}`, request);
  }
  GetAll(): Observable<ApiResponse<Campaign[]>> {
    return this.http.get<ApiResponse<Campaign[]>>(`${this.env}`);
  }
  GetAllByUserId(userId: string): Observable<ApiResponse<Campaign[]>> {
    return this.http.get<ApiResponse<Campaign[]>>(`${this.env}/${userId}/All`);
  }
  GetById(Id: String): Observable<ApiResponse<Campaign>> {
    return this.http.get<ApiResponse<Campaign>>(`${this.env}/${Id}`);
  }
  Update(campaign: UpdateCampaignRequest): Observable<ApiResponse<Campaign>> {
    return this.http.put<ApiResponse<Campaign>>(`${this.env}`, campaign);
  }
  Delete(Id: String): Observable<ApiResponse<Campaign>> {
    return this.http.put<ApiResponse<Campaign>>(`${this.env}/SetActiveState/${Id}`, '');
  }
  AddPlayer(request: JoinCampaignRequest): Observable<ApiResponse<Campaign>> {
    return this.http.put<ApiResponse<Campaign>>(`${this.env}/AddPlayer`, request);
  }
}
