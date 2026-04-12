using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterUser(CreateUserDTO authUser);
        Task<RefreshTokenModel> LogIn(AuthUserDTO authUser);
        Task<RefreshTokenModel> RefreshTokenAsync(RefreshTokenModel refreshToken);

    }
}
