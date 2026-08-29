using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface ICampaignService
    {
        public Task<Result<CampaignResponse>> Create(string userId, CreateCampaignRequest request);
        public Task<Result<IEnumerable<CampaignResponse>>> GetAll();
        public Task<Result<IEnumerable<CampaignResponse>>> GetAllByUserId(string userId);
        public Task<Result<CampaignResponse>> GetById(Guid id);
        public Task<Result<CampaignResponse>> Update(string userId ,UpdateCampaignRequest request);
        public Task<Result<bool>> SetActiveState(string userId, CampaignSetActiveStateRequest request);
        public Task<Result<string>> AddPlayer(string userId, JoinCampaignRequest request);
        public Task<Result<string>> AddCharacter(string userId, AddCharacterToCampaignRequest request);
        public Task<Result<string>> AcceptCharacter(string userId, AcceptCharacterToCampaignRequest request);
        public Task<Result<string>> RemovePlayer(string userId, RemovePlayerFromCampaignRequest request);
        public Task<Result<string>> UpdateConfiguration(string userId ,UpdateCampaignSettingsRequest request);



        //Pensar Melhor sobre essa funcionalidade
        //public Task<Result<CampaignResponse>> GenerateInvite();

    }
}
