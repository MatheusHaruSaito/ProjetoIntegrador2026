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
            var response = await _character.Post(character);

            //Adiciona o Personagem A lista do Usuario
            var data = await _userRepository.PushCharacterAsync(request.UserId, response.Id);
            if (!data) throw new Exception("Falha ao adicinar personagem ao usuario");

            return response.Adapt<CharacterResponse>();
        }

        public async Task<IEnumerable<CharacterResponse>> GetAll()
        {
            var characters =  await _character.GetAll();
            var response = characters.Adapt<List<CharacterResponse>>();
            return  response;
        }
    }
}
