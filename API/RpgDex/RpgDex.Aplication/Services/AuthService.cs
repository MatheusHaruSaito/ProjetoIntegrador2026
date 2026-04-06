using Mapster;
using Microsoft.AspNetCore.Identity;
using RpgDex.Aplication.Dto;
using RpgDex.Aplication.Interfaces;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        
        private readonly RoleManager<ApplicationRole> _rolemanager;
        private readonly ITokenService _tokenService;
        public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService,RoleManager<ApplicationRole> rolemanager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _rolemanager = rolemanager;
        }
        public async Task<string> LogIn(AuthUserDTO authUser)
        {
            var user = await _userManager.FindByEmailAsync(authUser.Email);
            if (user is null) return null;

            var validUser = await _userManager.CheckPasswordAsync(user, authUser.Password);
            if (!validUser) return null;

            return _tokenService.GenerateToken(user);
        }

        public async Task<bool> RegisterUser(CreateUserDTO authUser) {
            var user = authUser.Adapt<ApplicationUser>();
            var result = await _userManager.CreateAsync(user, authUser.Password);
            return result.Succeeded;

        }
    }
}
