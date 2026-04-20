using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ITokenRepository
    {
        Task<RefreshToken> StoreTokenAsync(RefreshToken token);
        Task<RefreshToken> GetRefreshTokenByTokenAsync(string Token);
        Task<RefreshToken> GetRefreshTokenByUserIdAsync(Guid userId);
        Task<bool> DeleteTokenByUserId(Guid userId);


    }
}