using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ICharacterRepository
    {
        Task<Character> Create(Character character);
        Task<IEnumerable<Character>> GetAll();
    }
}
