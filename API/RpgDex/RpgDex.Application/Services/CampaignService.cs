using Mapster;
using Microsoft.AspNetCore.Identity;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using RpgDex.Domain.ValueObjects;

namespace RpgDex.Application.Services   
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IFileService _fileService;
        private readonly IUserRepository _userRepository;
        private readonly ICharacterRepository _characterRepository;
        private readonly IPasswordHasher<Campaign> _passwordHasher;
        public CampaignService(ICampaignRepository campaignRepository, IFileService fileService, IUserRepository userRepository, ICharacterRepository characterRepository, IPasswordHasher<Campaign> passwordHasher)
        {
            _campaignRepository = campaignRepository;
            _fileService = fileService;
            _userRepository = userRepository;
            _characterRepository = characterRepository;
            _passwordHasher = passwordHasher;
        }

        private string? HashPassword(Campaign campaign, string? password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return null;
            }
            return _passwordHasher.HashPassword(campaign, password);
        }
        private bool ValidatePassword(Campaign campaign,string password)
        {
            if (string.IsNullOrEmpty(campaign.PasswordHash))
                return true;

            if (string.IsNullOrEmpty(password))
                return false;

            var result = _passwordHasher.VerifyHashedPassword(campaign, campaign.PasswordHash, password);

            if (result == PasswordVerificationResult.Failed) return false;

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
               campaign.SetPasswordHash(HashPassword(campaign,password));
            }
            return true;
        }
        public async Task<Result<CampaignResponse>> Create(CreateCampaignRequest request)
        {
            var userExisits = await _userRepository.GetByIdAsync(request.GameMasterId);
            if(userExisits is null)
            {
                return Result<CampaignResponse>.Failure("User Not Logged In");
            }

            var campaign = request.Adapt<Campaign>();

            campaign.SetPasswordHash(HashPassword(campaign,request.Password));

            //Temporary, change when subscriptions are defined
            if (request.MaxPlayers > 15)
            {
                campaign.MaxPlayers = 15;
            }
            //Save Icon, if it exists
            if (request.Icon is not null)
            {
                try
                {
                    campaign.IconPath = await _fileService.UploadFileAsync(request.Icon, campaign.Id.ToString());
                }
                catch
                {
                    return Result<CampaignResponse>.Failure("Failed to upload icon");
                }
            }

            var result = await _campaignRepository.InsertAsync(campaign);
            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Failed to create campaign");
            }
            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }

        public async Task<Result<IEnumerable<CampaignResponse>>> GetAll()
        {
            var response = await _campaignRepository.GetAllAsync();
            if (!response.Any())
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("Failed to retrieve campaigns");
            }

            return Result<IEnumerable<CampaignResponse>>.Success(response.Adapt<IEnumerable<CampaignResponse>>());
        }

        public async Task<Result<IEnumerable<CampaignResponse>>> GetAll(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("User Not Logged In");
            }

            var response = await _campaignRepository.GetAllAsync(userId);
            if (!response.Any())
            {
                return Result<IEnumerable<CampaignResponse>>.Failure("Failed to retrieve campaigns");
            }
            return Result<IEnumerable<CampaignResponse>>.Success(response.Adapt<IEnumerable<CampaignResponse>>());
        }

        public async Task<Result<CampaignResponse>> GetById(Guid id)
        {
            var response = await _campaignRepository.GetByIdAsync(id);
            if (response is null)
            {
                return Result<CampaignResponse>.Failure("Failed to retrieve campaign");
            }

            return Result<CampaignResponse>.Success(response.Adapt<CampaignResponse>());
        }

        public async Task<Result<CampaignResponse>> Update(UpdateCampaignRequest request)
        {
            var campaign = await _campaignRepository.GetByIdAsync(request.Id);
            if (campaign is null)
            {
                return Result<CampaignResponse>.Failure("Campaign not found");
            }
            if(campaign.PlayerIds.Count() > request.MaxPlayers)
            {
                return Result<CampaignResponse>.Failure("Remove players before reducing campaign capacity");
            }

            campaign.Update(request.Title, request.Description, request.MaxPlayers,request.NextSession);

            //Update Icon, if request provides another
            if (request.Icon is not null)
            {
                try
                {
                    campaign.IconPath = await _fileService.UploadFileAsync(request.Icon, campaign.Id.ToString());
                }
                catch
                {
                    return Result<CampaignResponse>.Failure("Failed to upload icon");
                }
            }

            var result = await _campaignRepository.UpdateAsync(campaign);

            if(result is null)
            {
                return Result<CampaignResponse>.Failure("Failed to update campaign");
            }

            return Result<CampaignResponse>.Success(result.Adapt<CampaignResponse>());
        }

        public async Task<Result<bool>> SetActiveState(Guid Id, bool activeState)
        {
            var result = await _campaignRepository.SetActiveState(Id, activeState);
            if(!result)
            {
                return Result<bool>.Failure("Failed to update campaign state");
            } 
            return Result<bool>.Success(result);
        }

        public async Task<Result<string>> AddPlayer(JoinCampaignRequest request)
        {
            var campaign = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaign is null)
            {
                return Result<string>.Failure("Campaign not found");
            }
            //Campaign found

            var player = await _userRepository.GetByIdAsync(request.PlayerId);
            if(player is null)
            {
                return Result<string>.Failure("Player not found");
            }
            //Player found
            var isValid = ValidatePassword(campaign, request.Password);
            if (!isValid) {
                return Result<string>.Failure("Invalid Password");
            }
            var (message, IsSuccess) = campaign.TryAddPlayer(request.PlayerId);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }

            var result = await _campaignRepository.UpdateAsync(campaign);
            if(result is null)
            {
                return Result<string>.Failure("Failed to update campaign");
            }

            return Result<string>.Success("Player added to campaign successfully");
        }

        public async Task<Result<string>> AddCharacter(AddCharacterToCampaignRequest request)
        {
            var characterFound = await _characterRepository.GetByIdAsync(request.CharacterId);
            if(characterFound is null) {
                return Result<string>.Failure("Character not found");
            }
            //Character found
            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if(campaignFound is null) {
                return Result<string>.Failure("Campaign not found");
            }
            //Campaign found
            var (message, IsSuccess) = campaignFound.TryAddCharacter(request.CharacterId);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }


            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if(updatedCampaign is null)
            {
                return Result<string>.Failure("Failed to update campaign");
            }
            return Result<string>.Success(message);
        }


        public async Task<Result<string>> AcceptCharacter(AcceptCharacterToCampaignRequest request)
        {
            var characterFound = await _characterRepository.GetByIdAsync(request.CharacterId);
            if (characterFound is null)
            {
                return Result<string>.Failure("Character not found");
            }
            //Character found

            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campaign not found");
            }
            //Campaign found
            var userFound = await _userRepository.GetByIdAsync(request.UserId);
            if (userFound is null)
            {
                return Result<string>.Failure("Logged-in user not found");
            }
            //User found

            var isUserGameMaster = campaignFound.GameMasterId == userFound.Id;
            if (!isUserGameMaster)
            {
                return Result<string>.Failure("Only the game master can accept or reject characters");
            }

            (string message, bool isSuccess) chracterAdded;
 
            if (request.IsAccepted)
            {
                chracterAdded = campaignFound.TryAcceptCharacter(request.CharacterId);
            }
            else{
                chracterAdded = campaignFound.TryRejectCharacter(request.CharacterId);
            }

            if (!chracterAdded.isSuccess)
            {
                return Result<string>.Failure(chracterAdded.message);

            }

            //Character accepted into campaign

            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if (updatedCampaign is null)
            {
                return Result<string>.Failure("Failed to update campaign");
            }
            return Result<string>.Success(chracterAdded.message);
        }

        public async Task<Result<string>> RemovePlayer(RemovePlayerFromCampaignRequest request)
        {
            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campaign not found");
            }
            //User found
            var isUserGameMaster = campaignFound.GameMasterId == request.IssuerPlayerId;
            if (!isUserGameMaster)
            {
                return Result<string>.Failure("Only the game master can kick players");
            }
            if (!campaignFound.PlayerIds.Contains(request.PlayerId))
            {
                return Result<string>.Failure("Player to be kicked not found");
            }
            //Player to be kicked found
            var (message, IsSuccess) = campaignFound.TryRemovePlayer(request.PlayerId);
            if (!IsSuccess)
            {
                return Result<string>.Failure(message);
            }
            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if (updatedCampaign is null)
            {
                return Result<string>.Failure("Failed to update campaign");
            }

            return Result<string>.Success(message);
        }

        public async Task<Result<string>> UpdateConfiguration(UpdateCampaignSettingsRequest request)
        {
            var campaignFound = await _campaignRepository.GetByIdAsync(request.CampaignId);
            if (campaignFound is null)
            {
                return Result<string>.Failure("Campaign not found");
            }

            campaignFound.UpdateSettings(request.Adapt<CampaignSettings>());

            var updatedCampaign = await _campaignRepository.UpdateAsync(campaignFound);
            if (updatedCampaign is null)
            {
                return Result<string>.Failure("Failed to update campaign settings");
            }

            return Result<string>.Success("Campaign settings updated successfully");
        }
    }
}
