using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver.Linq;
using RpgDex.Domain.Interfaces;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using RpgDex.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace RpgDex.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _settings;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenRepository _tokenRepository;
        public TokenService(IOptions<JwtSettings> settings, UserManager<ApplicationUser> userManager, ITokenRepository tokenRepository)
        {
            _settings = settings.Value;
            _userManager = userManager;
            _tokenRepository = tokenRepository;
        }
        public async Task<string> GenerateTokenAsync(ApplicationUser authUser)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, authUser.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var userRoles = await _userManager.GetRolesAsync(authUser);
            foreach (var role in userRoles)
            {
                claims.Add( new Claim(ClaimTypes.Role, role));
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var tokenConfig = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_settings.TokenValidityInMinutes),
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
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if(user is null)
            {
                return null;
            }
            return await _tokenRepository.GetRefreshTokenByUserIdAsync(userId);
        }
        public async Task<bool> StoreRefreshTokenAsync(string accessToken, string refreshToken, Guid userId)
        {
            var newRefreshToken = new RefreshToken
            {
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddMinutes(_settings.RefreshTokenValidityInMinutes),
                UserId = userId
            };
            var token = await _tokenRepository.StoreTokenAsync(newRefreshToken);

            return token is not null;
        }
        public string GenerateRefreshToken()
        {
            var randomNumber = new Byte[64];
            var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public Task<bool> RevokeTokenByValue(string token)
        {
            return _tokenRepository.DeleteTokenByValueAsync(token);
        }
        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key)),
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
