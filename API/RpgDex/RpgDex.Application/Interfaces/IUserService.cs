using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface IUserService
    {
        Task<Result<string>> UpdateUserProfileAsync(Guid UserId,UpdateUserProfileDTO updatedUser);
    }
}
