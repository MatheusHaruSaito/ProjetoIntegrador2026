using RpgDex.Aplication.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface ICharacterSevice
    {
        public Task<CharacterResponse> Create(CreateCharacterRequest request);
        public Task<IEnumerable<CharacterResponse>> GetAll();

    }
}
