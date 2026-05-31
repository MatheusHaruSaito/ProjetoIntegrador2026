using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface ICharacterSevice
    {
        Task<Result<CharacterResponse>> Create(CreateCharacterRequest request);
        Task<Result<IEnumerable<CharacterResponse>>> GetAllByUserIdAsync(Guid userId);
        Task<Result<CharacterResponse>> GetByIdAsync(Guid Id);
        Task<Result<bool>> UpdateAsync(UpdateCharacterRequest request);
        Task<Result<CharacterResponse>> SetActiveState(Guid Id,bool ActiveState);
    }
}
