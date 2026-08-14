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
        public Task<Result<string>> AddPlayer(JoinCampaignRequest request);
        public Task<Result<string>> AddCharacter(AddCharacterToCampaignRequest request);
        public Task<Result<string>> AcceptCharacter(AcceptCharacterToCampaignRequest request);
        public Task<Result<string>> RemovePlayer(RemovePlayerFromCampaignRequest request);
        public Task<Result<string>> UpdateConfiguration(UpdateCampaignSettingsRequest request);



        //Pensar Melhor sobre essa funcionalidade
        //public Task<Result<CampaignResponse>> GenerateInvite();

    }
}
