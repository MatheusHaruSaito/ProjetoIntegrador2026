using Mapster;
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
        private readonly IFileService _fileService;
        public UserService(UserManager<ApplicationUser> userManager, IFileService fileService)
        {
            _userManager = userManager;
            _fileService = fileService;
        }

        public async Task<Result<UserResponse>> GetUserById(Guid Id)
        {
            var user = await _userManager.FindByIdAsync(Id.ToString());
            if (user is null)
            {
                return Result<UserResponse>.Failure("User not found.");
            }
            var userResponse = user.Adapt<UserResponse>();
            return Result<UserResponse>.Success(userResponse);
        }

        public async Task<Result<string>> UpdateUserProfileAsync(Guid Id,UpdateUserProfileDTO updatedUser)
        {
            var user = await _userManager.FindByIdAsync(Id.ToString());
            if(user is null)
            {
                return Result<string>.Failure("Usuario Invalido");
            }
            user.UserName = updatedUser.UserName;

            try
            {
                user.IconPath = await _fileService.UploadFileAsync(updatedUser.Icon, user.Id.ToString());
            }
            catch (Exception ex)
            {
                return Result<string>.Failure($"Erro ao salvar a imagem: {ex.Message}");
            }

            await _userManager.UpdateAsync(user);
            return Result<string>.Success("Perfil atualizado com sucesso!");
        }
    }
}
