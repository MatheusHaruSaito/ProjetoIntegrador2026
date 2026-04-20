using RpgDex.Aplication.Common;
using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface IAuthService
    {
        Task<Result<bool>> RegisterUser(CreateUserDTO authUser);
        Task<Result<RefreshTokenModel>> LogIn(AuthUserDTO authUser);
        Task<Result<RefreshTokenModel>> RefreshTokenAsync(RefreshTokenModel refreshToken);

    }
}
