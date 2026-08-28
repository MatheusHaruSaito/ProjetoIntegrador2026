using FluentValidation;
using Mapster;
using Microsoft.AspNetCore.Identity;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Extension;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Validators;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;


namespace RpgDex.Application.Services
{
    public class CharacterService(ICharacterRepository character, IUserRepository userRepository,
        IFileService fileService, IValidator<CreateCharacterRequest> createCharacterRequestValidator,
        IValidator<UpdateCharacterRequest> updateCharacterRequestValidator) : ICharacterService
    {
        private readonly ICharacterRepository _character = character;

        public async Task<Result<CharacterResponse>> Create(CreateCharacterRequest request)
        {
            var checkCharacterValid = createCharacterRequestValidator.Validate(request);
            if (!checkCharacterValid.IsValid) return checkCharacterValid.ReturnErrors<CharacterResponse>();
            //Converts request to character
            var character = request.Adapt<Character>();
            character.Id = Guid.NewGuid();
            character.UserId = request.UserId;

            //Verifies if character exists
            var user = await userRepository.GetByIdAsync(request.UserId);
            if (user is null) return Result<CharacterResponse>.Failure("User Not Found");

            if (request.Icon is not null)
            {
                // Icon save
                try
                {
                    character.IconPath = await fileService.UploadFileAsync(request.Icon, character.Id.ToString());
                }
                catch
                {
                    return Result<CharacterResponse>.Failure("Error saving icon");
                }
            }
            
            // push character to database
            var response = await _character.InsertAsync(character);

            //push character to user list
            var data = await userRepository.PushCharacterAsync(request.UserId, response.Id);
            if (!data) return Result<CharacterResponse>.Failure("Failed to add character to user");

            return Result<CharacterResponse>.Success(response.Adapt<CharacterResponse>());
        }

        public async Task<Result<CharacterResponse>> SetActiveState(Guid Id, bool ActiveState)
        {
            //Verifies if character exists
            var characterFound = await _character.GetByIdAsync(Id);
            if(characterFound is null) return Result<CharacterResponse>.Failure("Failed to get character");

            //Verifies if character is deactivated
            bool modified = await _character.SetActiveState(Id,ActiveState);
            if (!modified) return Result<CharacterResponse>.Failure("Failed to deactivate character");

            //Verifica se o Personagem foi deletado do Usuario
            //bool deletedFromUser = await _userRepository.PullCharacterAsync(characterFound.UserId, Id);
            //if (!deletedFromUser)
            //{
            //    return Result<CharacterResponse>.Failure("Falha ao desativar personagem do usuario");
            //}
            return Result<CharacterResponse>.Success(characterFound.Adapt<CharacterResponse>());
        }

        public async Task<Result<IEnumerable<CharacterResponse>>> GetAllByUserIdAsync(Guid userId)
        {
            //Return all characters
            var characters =  await _character.GetAllByUserIdAsync(userId);
            if (characters is null) return Result<IEnumerable<CharacterResponse>>.Failure("Failed to get character");

            var response = characters.Adapt<List<CharacterResponse>>();
            return  Result<IEnumerable<CharacterResponse>>.Success(response);
        }

        public async Task<Result<CharacterResponse>> GetByIdAsync(Guid Id)
        {
            //Return a character
            var data = await _character.GetByIdAsync(Id);
            if(data is null)
            {
                return Result<CharacterResponse>.Failure($"Character not found");
            }
            var response = data.Adapt<CharacterResponse>();
            return Result<CharacterResponse>.Success(response);
        }

        public async Task<Result<bool>> UpdateAsync(UpdateCharacterRequest request)
        {
           var checkUpdateCharacterRequest = updateCharacterRequestValidator.Validate(request);
            if (!checkUpdateCharacterRequest.IsValid) return checkUpdateCharacterRequest.ReturnErrors<bool>();
            var updateCharacter = request.Adapt<Character>();
            if(request.Icon is not null)
            {
                try
                {
                    updateCharacter.IconPath = await fileService.UploadFileAsync(request.Icon, updateCharacter.Id.ToString());
                }
                catch
                {
                    return Result<bool>.Failure($"Error saving icon");
                }
            }
            else
            {
                var characterFound = await _character.GetByIdAsync(request.Id);
                if (characterFound is null) return Result<bool>.Failure("Character not found");
                updateCharacter.IconPath = characterFound.IconPath;
            }


            var response = await _character.UpdateAsync(updateCharacter);
            //Verifies if character was updated
            if (!response) return Result<bool>.Failure("It was not possible to update character");
            return Result<bool>.Success(response);
        }
    }
}
