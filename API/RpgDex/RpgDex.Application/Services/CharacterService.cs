using Mapster;
using Microsoft.AspNetCore.Identity;
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
    public class CharacterService : ICharacterSevice
    {
        private readonly ICharacterRepository _character;
        private readonly IUserRepository _userRepository;
        private readonly IFileService _fileService;

        public CharacterService(ICharacterRepository character, IUserRepository userRepository, IFileService fileService)
        {
            _character = character;
            _userRepository = userRepository;
            _fileService = fileService;
        }
        public async Task<Result<CharacterResponse>> Create(CreateCharacterRequest request)
        {

            //Converte a requisição em um objeto Character
            var character = request.Adapt<Character>();
            character.Id = Guid.NewGuid();
            character.UserId = request.UserId;

            //Verifica se o Usuario Existe
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user is null) return Result<CharacterResponse>.Failure("Usuario não encontrado");

            // Salva Imagem
            try
            {
                character.IconPath = await _fileService.UploadFileAsync(request.Icon, character.Id.ToString());
            }
            catch (Exception ex)
            {
                return Result<CharacterResponse>.Failure($"Erro ao salvar a imagem: {ex.Message}");
            }
            
            
            // coloca o personagem no banco
            var response = await _character.InsertAsync(character);

            //Adiciona o Personagem A lista do Usuario
            var data = await _userRepository.PushCharacterAsync(request.UserId, response.Id);
            if (!data) return Result<CharacterResponse>.Failure("Falha ao Adicionar personagem ao usuario");

            return Result<CharacterResponse>.Success(response.Adapt<CharacterResponse>());
        }

        public async Task<Result<CharacterResponse>> SetActiveState(Guid Id, bool ActiveState)
        {
            //Verifica se o Personagem Existe
            var characterFound = await _character.GetByIdAsync(Id);
            if(characterFound is null) return Result<CharacterResponse>.Failure("Falha ao achar personagem");

            //Verifica se o Personagem foi deletado
            bool modified = await _character.SetActiveState(Id,ActiveState);
            if (!modified) return Result<CharacterResponse>.Failure("Falha ao desativar personagem");

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
            //Retorna Todos os Perosnagens
            var characters =  await _character.GetAllByUserIdAsync(userId);
            if (characters is null) return Result<IEnumerable<CharacterResponse>>.Failure("Falha ao Obter personagem");

            var response = characters.Adapt<List<CharacterResponse>>();
            return  Result<IEnumerable<CharacterResponse>>.Success(response);
        }

        public async Task<Result<CharacterResponse>> GetByIdAsync(Guid Id)
        {
            //Retorna Um dos Perosnagens
            var data = await _character.GetByIdAsync(Id);
            if(data is null)
            {
                return Result<CharacterResponse>.Failure($"Personagem de Id: {Id} Não Encontrado!!");
            }
            var response = data.Adapt<CharacterResponse>();
            return Result<CharacterResponse>.Success(response);
        }

        public async Task<Result<bool>> UpdateAsync(UpdateCharacterRequest request)
        {
            var updateCharacter = request.Adapt<Character>();

            //Aqui Colocar o codigo que altera a foto
            try
            {
                updateCharacter.IconPath = await _fileService.UploadFileAsync(request.Icon, updateCharacter.Id.ToString());
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Erro ao salvar a imagem: {ex.Message}");
            }


            var response = await _character.UpdateAsync(updateCharacter);
            //Verifica se o Personagem foi atualizado
            if (!response) return Result<bool>.Failure("Não foi possivel atualizar o personagem");
            return Result<bool>.Success(response);
        }
    }
}
