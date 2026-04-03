using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> PushCharacterAsync(Guid UserId, Guid CharacterID);
        Task<bool> PullCharacterAsync(Guid userId, Guid characterId);

    }
}
