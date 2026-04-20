using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver.Linq;
using RpgDex.Aplication.Dto;
using RpgDex.Aplication.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RpgDex.Aplication.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenRepository _tokenRepository;
        public TokenService(IConfiguration config, UserManager<ApplicationUser> userManager, ITokenRepository tokenRepository)
        {
            _config = config;
            _userManager = userManager;
            _tokenRepository = tokenRepository;
        }
        public async Task<string> GenerateTokenAsync(ApplicationUser authUser)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, authUser.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, authUser.UserName),
                new Claim(JwtRegisteredClaimNames.Email, authUser.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(authUser);
            foreach (var role in userRoles)
            {
                claims.Add( new Claim(ClaimTypes.Role, role));
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            _ = int.TryParse(_config["Jwt:TokenValidityInMinutes"],out int tokenExpiryDate);
            var tokenConfig = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(tokenExpiryDate),
                signingCredentials: credentials
                );
           return new JwtSecurityTokenHandler().WriteToken(tokenConfig);
        }

        public async Task<RefreshToken> GetRefreshTokenByToken(string Token) 
        { 
            return await _tokenRepository.GetRefreshTokenByTokenAsync(Token);
        }
        public async Task<RefreshToken> GetRefreshTokenByUserId(Guid userId)
        {
            var user = _userManager.FindByIdAsync(userId.ToString());
            if(user is null)
            {
                return null;
            }
            return await _tokenRepository.GetRefreshTokenByUserIdAsync(userId);
        }
        public async Task<bool> StoreRefreshTokenAsync(RefreshTokenModel refreshTokenModel, Guid userId)
        {
            _ = int.TryParse(_config["Jwt:RefreshTokenValidityInMinutes"], out int expiryDate);
            var refreshToken = new RefreshToken
            {
                Token = refreshTokenModel.RefreshToken,
                ExpiryDate = DateTime.UtcNow.AddMinutes(expiryDate),
                UserId = userId
            };
            var token = await _tokenRepository.StoreTokenAsync(refreshToken);
            if(token is null)
            {
                return false;
            }
            return true;
        }
        public string GenerateRefreshToken()
        {
            var randomNumber = new Byte[64];
            var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public Task<bool> RovokeTokenFromUserId(Guid userId)
        {
            return _tokenRepository.DeleteTokenByUserId(userId);
        }
    }
}
