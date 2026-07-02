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
            //Temporario, mudar quando definir assinaturas
            if(request.MaxPlayers > 15)
            {
                campaign.MaxPlayers = 15;
            }

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
            if(campaign.PlayerIds.Count() > request.MaxPlayers)
            {
                return Result<CampaignResponse>.Failure("Remova Jogadores antes de diminuir a capacidade da campanha");
            }

            campaign.Title = request.Title;
            campaign.Description = request.Description;
            campaign.IsActive = request.IsActive;
            campaign.MaxPlayers = request.MaxPlayers;

            var result = await _campaignRepository.UpdateAsync(campaign);

            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Falha ao atualizar campanha");
            }

            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }

        public async Task<Result<bool>> SetActiveState(Guid Id, bool ActiveState)
        {
            var result = await _campaignRepository.SetActiveState(Id, ActiveState);
            if(!result)
            {
                return Result<bool>.Failure("Falha ao atualizar estado da campanha");
            } 
            return Result<bool>.Success(result);
        }

        public async Task<Result<CampaignResponse>> AddPlayerRequest(JoinCampaignRequest request)
        {
            var campaign = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if(campaign is null)
            {
                return Result<CampaignResponse>.Failure("Campanha não encontrada");
            }
            //Campanha encontrada

            var player = await _userRepository.GetByIdAsync(request.PlayerId);
            if(player is null)
            {
                return Result<CampaignResponse>.Failure("Jogador não encontrado");
            }
            //Jogador Encontrado
            if(campaign.Password != request.Password)
            {
                return Result<CampaignResponse>.Failure("Senha incorreta");
            }
            //Senha verificada

            if(campaign.PlayerIds.Contains(player.Id))
            {
                return Result<CampaignResponse>.Failure("Jogador já está na campanha");
            }
            //Player Não esta na campanha
            var playerAdded = campaign.TryAddPlayer(player.Id);
            if (!playerAdded)
            {
                return Result<CampaignResponse>.Failure("Falha ao adicionar jogador à campanha / Capacidade maxima atingida");
            }
            var result = await _campaignRepository.UpdateAsync(campaign);
            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Falha ao atualizar campanha");
            }
            //Player Adicionado

            //Tudo Certo :ThumbsUp:
            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }
    }
}
