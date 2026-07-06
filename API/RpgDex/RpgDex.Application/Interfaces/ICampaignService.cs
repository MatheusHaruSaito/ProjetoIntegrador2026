using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface ICampaignService
    {
        public Task<Result<CampaignResponse>> Create(CreateCampaignRequest request);
        public Task<Result<IEnumerable<CampaignResponse>>> GetAll();
        public Task<Result<IEnumerable<CampaignResponse>>> GetAll(Guid userId);
        public Task<Result<CampaignResponse>> GetById(Guid id);
        public Task<Result<CampaignResponse>> Update(UpdateCampaignRequest request);
        public Task<Result<bool>> SetActiveState(Guid Id, bool activeState);
        public Task<Result<CampaignResponse>> AddPlayerRequest(JoinCampaignRequest request);
        public Task<Result<string>> AddCharacterRequest(AddCharacterToCampaignRequest request);
        //Pensar Melhor sobre essa funcionalidade
        //public Task<Result<CampaignResponse>> GenerateInvite();

    }
}
