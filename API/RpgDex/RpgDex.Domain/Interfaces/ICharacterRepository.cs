using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ICharacterRepository
    {
        Task<Character> InsertAsync(Character character);
        Task<IEnumerable<Character>> GetAllAsync();
        Task<Character> GetByIdAsync(Guid Id);
        Task<bool> UpdateAsync(Character NewCharacter);
        Task<bool> DeleteAsync(Guid Id);
    }

}
