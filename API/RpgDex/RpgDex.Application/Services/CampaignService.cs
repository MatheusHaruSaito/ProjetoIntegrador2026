using Mapster;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Exceptions;
using RpgDex.Domain.Interfaces;
using RpgDex.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Services   
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IFileService _fileService;
        private readonly IUserRepository _userRepository;
        private readonly ICharacterRepository _characterRepository;
        public CampaignService(ICampaignRepository campaignRepository, IFileService fileService, IUserRepository userRepository, ICharacterRepository characterRepository)
        {
            _campaignRepository = campaignRepository;
            _fileService = fileService;
            _userRepository = userRepository;
            _characterRepository = characterRepository;
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
            //Salvar Icone, caso exista
            if(request.Icon is not null)
            {
                try
                {
                    campaign.IconPath = await _fileService.UploadFileAsync(request.Icon, campaign.Id.ToString());
                }
                catch
                {
                    return Result<CampaignResponse>.Failure("Falha ao fazer upload do ícone");
                }
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

            campaign.Update(request.Title, request.Description, request.MaxPlayers);

            //Altera Icone, caso request envie outro
            if (request.Icon is not null)
            {
                try
                {
                    campaign.IconPath = await _fileService.UploadFileAsync(request.Icon, campaign.Id.ToString());
                }
                catch
                {
                    return Result<CampaignResponse>.Failure("Falha ao fazer upload do ícone");
                }
            }

            var result = await _campaignRepository.UpdateAsync(campaign);

            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Falha ao atualizar campanha");
            }

            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }

        public async Task<Result<bool>> SetActiveState(Guid Id, bool activeState)
        {
            var result = await _campaignRepository.SetActiveState(Id, activeState);
            if(!result)
            {
                return Result<bool>.Failure("Falha ao atualizar estado da campanha");
            } 
            return Result<bool>.Success(result);
        }

        public async Task<Result<string>> AddPlayer(JoinCampaignRequest request)
        {
            var campaign = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaign is null)
            {
                return Result<string>.Failure("Campanha não encontrada");
            }
            //Campanha encontrada

            var player = await _userRepository.GetByIdAsync(request.PlayerId);
            if(player is null)
            {
                return Result<string>.Failure("Jogador não encontrado");
            }
            //Jogador Encontrado

            var (message, IsSuccess) = campaign.TryAddPlayer(request.PlayerId, request.Password);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }
            //try
            //{
            //    campaign.AddPlayer(player.Id, request.Password);
            //}
            //catch (DomainException ex)
            //{
            //    return Result<CampaignResponse>.Failure(ex.Message);
            //}

            var result = await _campaignRepository.UpdateAsync(campaign);
            if(result is null)
            {
                return Result<string>.Failure("Falha ao atualizar campanha");
            }

            //Tudo Certo :ThumbsUp:
            return Result<string>.Success("Jogador adicionado à campanha com sucesso");
        }

        public async Task<Result<string>> AddCharacter(AddCharacterToCampaignRequest request)
        {
            var characterFound = await _characterRepository.GetByIdAsync(request.CharacterId);
            if(characterFound is null) {
                return Result<string>.Failure("Personagem não encontrado");
            }
            //Personagem Encontrado

            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if(campaignFound is null) {
                return Result<string>.Failure("Campanha não encontrada");
            }
            //Campanha Encontrada
            var (message, IsSuccess) = campaignFound.TryAddCharacter(request.CharacterId);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }


            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if(updatedCampaign is null)
            {
                return Result<string>.Failure("Falha ao atualizar campanha");
            }
            return Result<string>.Success(message);
        }

        public async Task<Result<string>> AcceptCharacter(AcceptCharacterToCampaignRequest request)
        {
            var characterFound = await _characterRepository.GetByIdAsync(request.CharacterId);
            if (characterFound is null)
            {
                return Result<string>.Failure("Personagem não encontrado");
            }
            //Personagem Encontrado

            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campanha não encontrada");
            }
            //Campanha Encontrada
            var userFound = await _userRepository.GetByIdAsync(request.UserId);
            if (userFound is null)
            {
                return Result<string>.Failure("Usuário Logado não encontrado");
            }
            //Usuario Encontrado

            var isUserGameMaster = campaignFound.GameMasterId == userFound.Id;
            if (!isUserGameMaster)
            {
                return Result<string>.Failure("Apenas o mestre da campanha pode aceitar ou rejeitar personagens");
            }
            string successMessage;

            var (message, IsSuccess) = campaignFound.TryAcceptCharacter(request.CharacterId);
            if (IsSuccess)
            {
                successMessage = message;
            }
            else
            {
                return Result<string>.Failure(message);
            }
            //Personagem aceito na campanha

            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if(updatedCampaign is null)
            {
                return Result<string>.Failure("Falha ao atualizar campanha");
            }
            return Result<string>.Success(successMessage);
        }

        public async Task<Result<string>> RemovePlayer(RemovePlayerFromCampaignRequest request)
        {
            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campanha não encontrada");
            }
            //Usuario Encontrado
            var isUserGameMaster = campaignFound.GameMasterId == request.IssuerPlayerId;
            if (!isUserGameMaster)
            {
                return Result<string>.Failure("Apenas o mestre da campanha pode expulsar jogadores");
            }
            if (!campaignFound.PlayerIds.Contains(request.PlayerId))
            {
                return Result<string>.Failure("Jogador a ser expulso não encontrado");
            }
            //Jogador a ser expulso encontrado
            var (message, IsSuccess) = campaignFound.TryRemovePlayer(request.PlayerId);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }
            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if (updatedCampaign is null)
            {
                return Result<string>.Failure("Falha ao atualizar campanha");
            }

            return Result<string>.Success(message);
        }

        public async Task<Result<string>> UpdateConfiguration(UpdateCampaignSettingsRequest request)
        {
            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campanha não encontrada");
            }

            campaignFound.UpdateSettings(request.Adapt<CampaignSettings>());

            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if (updatedCampaign is null)
            {
                return Result<string>.Failure("Falha ao atualizar Configurações da campanha");
            }

            return Result<string>.Success("Configurações da campanha atualizadas com sucesso");
        }
    }
}
