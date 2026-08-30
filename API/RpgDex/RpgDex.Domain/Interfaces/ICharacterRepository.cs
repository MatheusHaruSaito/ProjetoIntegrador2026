using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ICharacterRepository
    {
        Task<Character> InsertAsync(Character character);
        Task<IEnumerable<Character>> GetAllByUserIdAsync(Guid userId, int page = 1, int pageSize = 5);
        Task<Character> GetByIdAsync(Guid id);
        Task<bool> UpdateAsync(Character NewCharacter);
        Task<bool> SetActiveState(Guid Id,bool ActiveState);


    }

}
