using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Interfaces
{
    public  interface ITokenService
    {
        Task<string> GenerateToken(ApplicationUser authUser);
    }
}
