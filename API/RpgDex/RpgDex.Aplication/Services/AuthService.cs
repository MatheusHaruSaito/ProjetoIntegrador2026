using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RpgDex.Aplication.Common;
using RpgDex.Aplication.Dto;
using RpgDex.Aplication.Interfaces;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RpgDex.Aplication.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _rolemanager;
        private readonly ITokenService _tokenService;

        private readonly IConfiguration _configuration;
        public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService,RoleManager<ApplicationRole> rolemanager, IConfiguration configuration)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _rolemanager = rolemanager;
            _configuration = configuration;
        }
        public async Task<Result<RefreshTokenModel>> LogIn(AuthUserDTO authUser)
        {
            var user = await _userManager.FindByEmailAsync(authUser.Email);
            if (user is null) throw new Exception("User Not Found");

            var validUser = await _userManager.CheckPasswordAsync(user, authUser.Password);
            if (!validUser) throw new Exception("Wrong Credentials");

            var accessToken = await _tokenService.GenerateTokenAsync(user);

            var newRefreshToken = new RefreshTokenModel
            {
                RefreshToken = _tokenService.GenerateRefreshToken(),
                AccessToken = accessToken,
    
            };
            await _tokenService.StoreRefreshTokenAsync(newRefreshToken, user.Id);

            return Result<RefreshTokenModel>.Success(newRefreshToken);
        }

        public async Task<Result<RefreshTokenModel>> RefreshTokenAsync(RefreshTokenModel tokenModel)
        {
            if (tokenModel is null)
            {
                return Result<RefreshTokenModel>.Failure("o token atual é invalido");
            }
            var token = await _tokenService.GetRefreshTokenByToken(tokenModel.RefreshToken);
            if(token is null)
            {
                Result<RefreshTokenModel>.Failure("o token atual é invalido");
            }

            var principal = GetPrincipalFromExpiredToken(tokenModel.AccessToken);
            if(principal is null)
            {
                return Result<RefreshTokenModel>.Failure("o token atual é invalido");

            }

            string userName = principal.Identity.Name;
            var user = await _userManager.FindByNameAsync(userName);

            if(user is null|| tokenModel.RefreshToken != token.Token)
            {
                return Result<RefreshTokenModel>.Failure("o token do usuario é invalido");
            }

            await _tokenService.RovokeTokenFromUserId(user.Id);

            var newAcessToken = await _tokenService.GenerateTokenAsync(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            var newTokenModel = new RefreshTokenModel
            {
                AccessToken = newAcessToken,
                RefreshToken = newRefreshToken
            };
            var savedToken = await _tokenService.StoreRefreshTokenAsync(newTokenModel,user.Id);

            if (!savedToken)
            {
                return Result<RefreshTokenModel>.Failure("Não foi possivel cadastrar o token");
            }
            return Result<RefreshTokenModel>.Success(newTokenModel);
        }

        public async Task<Result<bool>> RegisterUser(CreateUserDTO authUser) {
            var user = authUser.Adapt<ApplicationUser>();
            var result = await _userManager.CreateAsync(user, authUser.Password);
            if (!result.Succeeded)
            {
                return Result<bool>.Failure("Não foi possivel Registrar o usuario");
            }

            return Result<bool>.Success(true);

        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])),
            };
            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(token, TokenValidationParameters, out SecurityToken securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid Token");

            return principal;
        }
    }
}
