using Microsoft.AspNetCore.Identity;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace RpgDex.Infrastructure.Services
{
    public class DiscordAuthService : IDiscordAuthService
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        public DiscordAuthService(SignInManager<ApplicationUser> signInManager)
        {
            _signInManager = signInManager;
        }
        public async Task<DiscordUser> GetDiscordUserAsync()
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if(info is null)
            {
                throw new InvalidOperationException("User not found");
            }

            var emailClaim = info.Principal.FindFirstValue(ClaimTypes.Email);
            var nameClaim = info.Principal.FindFirstValue(ClaimTypes.Name);
            var discordId = info.ProviderKey;

            return new DiscordUser(discordId, nameClaim, emailClaim);
        }
    }
}
