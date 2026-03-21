using RpgDex.Aplication.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterUser(CreateUserDTO authUser);
        Task<string> LogIn(AuthUserDTO authUser);
    }
}
