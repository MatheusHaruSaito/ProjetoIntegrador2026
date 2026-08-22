using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Services;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ICharacterSevice, CharacterService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<ICampaignService, CampaignService>();
            services.AddScoped<IPasswordHasher<Campaign>, PasswordHasher<Campaign>>();
            return services;
        }
    }
}
