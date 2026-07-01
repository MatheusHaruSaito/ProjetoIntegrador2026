using Mapster;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Services   
{
    public class CampaignService : ICampaignService
    {
        ICampaignRepository _campaignRepository;
        private readonly IUserRepository _userRepository;
        public CampaignService(ICampaignRepository campaignRepository, IUserRepository userRepository)
        {
            _campaignRepository = campaignRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<CampaignResponse>> Create(CreateCampaignRequest request)
        {
            var user = await _userRepository.GetByIdAsync(request.GameMasterId);
            if(user is null)
            {
                return Result<CampaignResponse>.Failure("Usuario Não Logado");
            }

            var campaign = request.Adapt<Campaign>();
            var result = await _campaignRepository.InsertAsync(campaign);
            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Falha ao criar campanha");
            }
            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }

        public async Task<Result<IEnumerable<CampaignResponse>>> GetAll()
        {
            var response = await _campaignRepository.GetAllAsync();
            if (!response.Any())
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("Falha ao recuperar campanhas");
            }

            return Result<IEnumerable<CampaignResponse>>.Success(response.Adapt<IEnumerable<CampaignResponse>>());
        }

        public async Task<Result<IEnumerable<CampaignResponse>>> GetAll(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("Usuario Não Logado");
            }

            var response = await _campaignRepository.GetAllAsync(userId);
            if (!response.Any())
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("Falha ao recuperar campanhas");
            }
            return Result<IEnumerable<CampaignResponse>>.Success(response.Adapt<IEnumerable<CampaignResponse>>());
        }

        public async Task<Result<CampaignResponse>> GetById(Guid id)
        {
            var response = await _campaignRepository.GetByIdAsync(id);
            if (response is null)
            {
                return Result<CampaignResponse>.Failure("Falha ao recuperar campanha");
            }

            return Result<CampaignResponse>.Success(response.Adapt<CampaignResponse>());
        }

        public async Task<Result<CampaignResponse>> Update(UpdateCampaignRequest request)
        {
            var campaign = await _campaignRepository.GetByIdAsync(request.Id);
            if (campaign is null)
            {
                return Result<CampaignResponse>.Failure("Campanha não encontrada");
            }

            campaign.Title = request.Title;
            campaign.Description = request.Description;
            campaign.IsActive = request.IsActive;
            campaign.PlayersId = request.PlayersId;
            campaign.CharactersId = request.CharactersId;

            var result = await _campaignRepository.UpdateAsync(campaign);

            if(!result)
            {
                return Result<CampaignResponse>.Failure("Falha ao atualizar campanha");
            }

            return Result<CampaignResponse>.Success(campaign.Adapt<CampaignResponse>());
        }
    }
}
