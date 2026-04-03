using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface ICharacterSevice
    {
        Task<CharacterResponse> Create(CreateCharacterRequest request);
        Task<IEnumerable<CharacterResponse>> GetAllAsync();
        Task<CharacterResponse> GetByIdAsync(Guid Id);
        Task<bool> UpdateAsync(UpdateCharacterRequest request);
        Task<bool> DeleteAsync(Guid Id);
    }
}
