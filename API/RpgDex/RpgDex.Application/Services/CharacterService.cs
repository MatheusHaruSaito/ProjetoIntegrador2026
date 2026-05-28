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
        private readonly IFileRepository _fileRepository;

        public CharacterService(ICharacterRepository character, IUserRepository userRepository, IFileRepository fileRepository)
        {
            _character = character;
            _userRepository = userRepository;
            _fileRepository = fileRepository;
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
            
            if(request.Icon != null && request.Icon.Length > 0)
            {
                using(var memoryStream = new MemoryStream())
                {
                    await request.Icon.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    var Extension = Path.GetExtension(request.Icon.FileName);
                    var fileName = $"{character.Name}_icon{Extension}";
                    character.IconPath = await _fileRepository.UploadFileAsync(fileName, memoryStream);
                }
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

        public async Task<Result<IEnumerable<CharacterResponse>>> GetAllAsync()
        {
            //Retorna Todos os Perosnagens
            var characters =  await _character.GetAllAsync();
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
                return Result<CharacterResponse>.Failure($"Usuario de Id: {Id} Não Encontrado!!");
            }
            var response = data.Adapt<CharacterResponse>();
            return Result<CharacterResponse>.Success(response);
        }

        public async Task<Result<bool>> UpdateAsync(UpdateCharacterRequest request)
        {
            //Atualiza um personagem
            var updateCharacter = request.Adapt<Character>();
            var response = await _character.UpdateAsync(updateCharacter);

            if (!response) return Result<bool>.Failure("Não foi possivel atualizar o personagem");
            return Result<bool>.Success(response);
        }
    }
}
