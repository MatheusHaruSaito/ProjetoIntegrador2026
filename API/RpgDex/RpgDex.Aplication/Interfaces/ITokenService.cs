using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateTokenAsync(ApplicationUser authUser);
        string GenerateRefreshToken();
        Task<RefreshToken> GetRefreshTokenByToken(string Token);
        Task<RefreshToken> GetRefreshTokenByUserId(Guid userId);
        Task<bool> StoreRefreshTokenAsync(RefreshTokenModel refreshTokenModel, Guid userId);
        Task<bool> RovokeTokenFromUserId(Guid userId);



    }
}
