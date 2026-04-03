using Mapster;
using Microsoft.AspNetCore.Identity;
using RpgDex.Aplication.Dto;
using RpgDex.Aplication.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Services
{
    public class CharacterService : ICharacterSevice
    {
        private readonly ICharacterRepository _character;
        private readonly IUserRepository _userRepository;

        public CharacterService(ICharacterRepository character, IUserRepository userRepository)
        {
            _character = character;
            _userRepository = userRepository;
        }
        public async Task<CharacterResponse> Create(CreateCharacterRequest request)
        {

            //Converte a requisição em um objeto Character
            var character = request.Adapt<Character>();
            character.Id = Guid.NewGuid();
            character.UserId = request.UserId;

            // coloca o personagem no banco
            var response = await _character.InsertAsync(character);

            //Adiciona o Personagem A lista do Usuario
            var data = await _userRepository.PushCharacterAsync(request.UserId, response.Id);
            if (!data) throw new Exception("Falha ao adicinar personagem ao usuario");

            return response.Adapt<CharacterResponse>();
        }

        public async Task<bool> DeleteAsync(Guid Id)
        {
            //Verifica se o Personagem Existe
            var characterFound = await _character.GetByIdAsync(Id) ?? throw new Exception("Personagem não encontrado");

            //Verifica se o Personagem foi deletado
            bool deleted = await _character.DeleteAsync(Id);
            if (!deleted) throw new Exception("Falha ao deletar usuario");

            //Verifica se o Personagem foi deletado do Usuario
            bool deletedFromUser = await _userRepository.PullCharacterAsync(characterFound.UserId, Id);
            if (!deletedFromUser)
            {
                throw new Exception("Falha ao remover personagem do usuario");
            }
            return true;
        }

        public async Task<IEnumerable<CharacterResponse>> GetAllAsync()
        {
            //Retorna Todos os Perosnagens
            var characters =  await _character.GetAllAsync();
            if (characters is null) throw new Exception("Falha ao obter Personagens");
            var response = characters.Adapt<List<CharacterResponse>>();
            return  response;
        }

        public async Task<CharacterResponse> GetByIdAsync(Guid Id)
        {
            //Retorna Um dos Perosnagens
            var data = await _character.GetByIdAsync(Id) ?? throw new Exception($"Usuario de Id: {Id} Não Encontrado!!");
            var response = data.Adapt<CharacterResponse>();
            return response;
        }

        public async Task<bool> UpdateAsync(UpdateCharacterRequest request)
        {
            //Atualiza um personagem
            var updateCharacter = request.Adapt<Character>();
            var response = await _character.UpdateAsync(updateCharacter);

            if (!response) throw new Exception("Não foi possivel atualizar o personagem");

            return true;
        }
    }
}
