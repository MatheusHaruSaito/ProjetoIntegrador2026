using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result<bool>> RegisterUser(CreateUserDTO authUser);
        Task<Result<RefreshTokenModel>> LogIn(AuthUserDTO authUser);
        Task<Result<RefreshTokenModel>> RefreshTokenAsync(RefreshTokenModel refreshToken);

    }
}
