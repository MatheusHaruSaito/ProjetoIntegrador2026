using RpgDex.Aplication.Common;
using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface ICharacterSevice
    {
        Task<Result<CharacterResponse>> Create(CreateCharacterRequest request);
        Task<Result<IEnumerable<CharacterResponse>>> GetAllAsync();
        Task<Result<CharacterResponse>> GetByIdAsync(Guid Id);
        Task<Result<bool>> UpdateAsync(UpdateCharacterRequest request);
        Task<Result<CharacterResponse>> SetActiveState(Guid Id,bool ActiveState);
    }
}
