using Mapster;
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

        public CharacterService(ICharacterRepository character)
        {
            _character = character;
        }
        public async Task<CharacterResponse> Create(CreateCharacterRequest request)
        {

            var character = request.Adapt<Character>();
            character.UserId = Guid.NewGuid(); //TEMPORARIO, MUDAR PARA O USUARIO LOGADO DEPOIS

            var response =await _character.Create(character);
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
