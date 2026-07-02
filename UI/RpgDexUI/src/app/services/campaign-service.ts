import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateCampaignRequest } from '../../models/createCampaignRequest';
import { UpdateCampaignRequest } from '../../models/updateCampaignRequest';
import { Observable } from 'rxjs';
import { CampaignResponse } from '../../models/campaignResponse';
import { ApiResponse } from '../../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly controller = 'Campaign';
  private readonly env = `${environment.RpxDexApi}/${this.controller}`;

  http = inject(HttpClient);

  Post(request: CreateCampaignRequest): Observable<ApiResponse<CampaignResponse>> {
    return this.http.post<ApiResponse<CampaignResponse>>(`${this.env}`, request);
  }
  GetAll(): Observable<ApiResponse<CampaignResponse[]>> {
    return this.http.get<ApiResponse<CampaignResponse[]>>(`${this.env}`);
  }
  GetAllByUserId(userId: string): Observable<ApiResponse<CampaignResponse[]>> {
    return this.http.get<ApiResponse<CampaignResponse[]>>(`${this.env}/${userId}/All`);
  }

  GetById(Id: String): Observable<ApiResponse<CampaignResponse>> {
    return this.http.get<ApiResponse<CampaignResponse>>(`${this.env}/${Id}`);
  }
  Update(campaign: UpdateCampaignRequest): Observable<ApiResponse<CampaignResponse>> {
    return this.http.put<ApiResponse<CampaignResponse>>(`${this.env}`, campaign);
  }
  public Delete(Id: String): Observable<ApiResponse<CampaignResponse>> {
    return this.http.put<ApiResponse<CampaignResponse>>(`${this.env}/SetActiveState/${Id}`, '');
  }
}
