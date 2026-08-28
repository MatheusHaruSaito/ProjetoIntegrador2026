using FluentValidation;
using Mapster;
using Microsoft.AspNetCore.Identity;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Extension;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Services
{
    public class UserService(UserManager<ApplicationUser> userManager, IFileService fileService, IValidator<UpdateUserProfileDTO> updateUserProfileValidator) : IUserService
    {
        public async Task<Result<UserResponse>> GetUserById(Guid Id)
        {
            var user = await userManager.FindByIdAsync(Id.ToString());
            if (user is null)
            {
                return Result<UserResponse>.Failure("User not found.");
            }
            var userResponse = user.Adapt<UserResponse>();
            return Result<UserResponse>.Success(userResponse);
        }

        public async Task<Result<string>> UpdateUserProfileAsync(Guid Id,UpdateUserProfileDTO updatedUser)
        {
            var checkUpdateUserValid = updateUserProfileValidator.Validate(updatedUser);
            if (!checkUpdateUserValid.IsValid) return checkUpdateUserValid.ReturnErrors<string>();
            var user = await userManager.FindByIdAsync(Id.ToString());

            if(user is null)
            {
                return Result<string>.Failure("Invalid User");
            }
            user.DisplayName = updatedUser.DisplayName;

            if(updatedUser.Icon is not null)
            {
                try
                {
                    user.IconPath = await fileService.UploadFileAsync(updatedUser.Icon, user.Id.ToString());
                }
                catch (Exception ex)
                {
                    return Result<string>.Failure($"Error occurred while saving the image: {ex.Message}");
                }
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return Result<string>.Failure("Failed to update profile." + string.Join(" ", result.Errors.Select(e => e.Description)));
            }
            return Result<string>.Success("Profile updated successfully!");
        }
    }
}
