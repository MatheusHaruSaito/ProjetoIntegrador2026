using Microsoft.AspNetCore.Identity;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result<string>> UpdateUserProfileAsync(Guid UserId,UpdateUserProfileDTO updatedUser)
        {
            var user = await _userManager.FindByIdAsync(UserId.ToString());
            if(user is null)
            {
                return Result<string>.Failure("Usuario Invalido");
            }

            user.UserName = updatedUser.UserName;
            //Implementar a troca de foto aqui depois

            await _userManager.UpdateAsync(user);
            return Result<string>.Success("Perfil atualizado com sucesso!");
        }
    }
}
