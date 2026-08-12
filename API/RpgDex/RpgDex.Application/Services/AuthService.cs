using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace RpgDex.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _rolemanager;

        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly IDiscordAuthService _discordAuthService;


        private const string GoogleProvider = "Google";
        private const string DiscordProvider = "Discord";


        private readonly IConfiguration _configuration;
        public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService, IEmailService emailService, IGoogleAuthService googleAuthService, RoleManager<ApplicationRole> rolemanager, IConfiguration configuration, IDiscordAuthService discordAuthService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _googleAuthService = googleAuthService;
            _rolemanager = rolemanager;
            _configuration = configuration;
            _discordAuthService = discordAuthService;
        }
        public async Task<Result<RefreshTokenModel>> LogIn(AuthUserDTO authUser)
        {
            var user = await _userManager.FindByEmailAsync(authUser.Email);
            if (user is null) return Result<RefreshTokenModel>.Failure("Credenciais Invalidas");

            var validUser = await _userManager.CheckPasswordAsync(user, authUser.Password);
            if (!validUser) return Result<RefreshTokenModel>.Failure("Credenciais Invalidas");

            var IsEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if(!IsEmailConfirmed) return Result<RefreshTokenModel>.Failure("Email não confirmado");


            var accessToken = await _tokenService.GenerateTokenAsync(user);

            var newRefreshToken = await GenerateRefreshTokenModelAsync(user);
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
                return Result<RefreshTokenModel>.Failure("o token atual é invalido");
            }

            var principal = _tokenService.GetPrincipalFromExpiredToken(tokenModel.AccessToken);
            if(principal is null)
            {
                return Result<RefreshTokenModel>.Failure("o token atual é invalido");

            }

            string userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null|| tokenModel.RefreshToken != token.Token)
            {
                return Result<RefreshTokenModel>.Failure("o token do usuario é invalido");
            }

            var tokenRevoked = await _tokenService.RevokeTokenByValue(tokenModel.RefreshToken);
            if (!tokenRevoked) { 
                return Result<RefreshTokenModel>.Failure("Token Invalido");
            }

            var newTokenModel = await GenerateRefreshTokenModelAsync(user);

            if (newTokenModel is null)
            {
                return Result<RefreshTokenModel>.Failure("Não foi possivel cadastrar o token");
            }
            return Result<RefreshTokenModel>.Success(newTokenModel);
        }

        public async Task<Result<string>> RegisterUser(CreateUserDTO authUser) {
            var user = authUser.Adapt<ApplicationUser>();
            var result = await _userManager.CreateAsync(user, authUser.Password);
            if (!result.Succeeded)
            {
                return Result<string>.Failure("Não foi possivel Registrar o usuario");
            }
            return await SendEmailVerificationAsync(authUser.Email);

        }

        private async Task<Result<string>> SendEmailVerificationAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if(user is null)
            {
                return Result<string>.Failure("Usuario não encontrado");
            }

            var token = await _tokenService.GenerateEmailTokenVerificationAsync(user.Id);
            if (token is null)
            {
                return Result<string>.Failure("Não foi possivel gerar o token de verificação");
            }
            //Quando a pagina no front Estiver pronta, colocar o link correto
            string verificationLink = $"http://localhost:4200/emailConfirmation?userid={user.Id}&token={token}";
            var htmlBody = _emailService.GenerateEmailVerificationHTMLTemplate(verificationLink, user.UserName);
            var (isEmailSent, message) = await _emailService.SendEmailAsync(user.Email, user.UserName, "Verificação de Email", htmlBody);
            if (!isEmailSent)
            {
                return Result<string>.Failure(message);
            }
            return Result<string>.Success(message);
        }
        public async Task<Result<string>> ValidateEmailByTokenAsync(ValidateEmailByTokenRequest request)
        {
            var isValid = await _tokenService.ValidateEmailToken(request.UserId, request.Token);
            if(isValid)
            {
                return Result<string>.Success("Email verificado com sucesso");
            }
            return Result<string>.Failure("Token inválido ou expirado");
        }

        public async Task<Result<string>> ResendEmailVerificationAsync(ResendEmailVerificationRequest request)
        {
          return await SendEmailVerificationAsync(request.Email);
        }

        public async Task<Result<RefreshTokenModel>> GoogleSignUp(GoogleLoginRequest request)
        {
            var googleUser = await _googleAuthService.ValidateTokenAsync(request.Token);
            if (googleUser is null)
            {
                return Result<RefreshTokenModel>.Failure("Token do Google inválido");
            }
            var userDb = await _userManager.FindByEmailAsync(googleUser.email);
            if (userDb is not null) {
                //User Exists, but is the user already linked with Google?
                var userLogins = await _userManager.GetLoginsAsync(userDb);

                var googleLoginInfo = userLogins.FirstOrDefault(l => l.LoginProvider == GoogleProvider && l.ProviderKey == googleUser.googleId);
                
                if (googleLoginInfo is null)
                {
                    // User exists but is not linked with Google
                    var userDbLoginInfo = new UserLoginInfo(GoogleProvider, googleUser.googleId, GoogleProvider);
                    var addLoginResult =await _userManager.AddLoginAsync(userDb, userDbLoginInfo);
                    if (!addLoginResult.Succeeded)
                    {
                        return Result<RefreshTokenModel>.Failure("Erro ao vincular conta Google");
                    }
                }

                return await LogInAsync(userDb);
            }

            //User does not exist, create a new user and link with Google
            var user = new ApplicationUser
            {
                DisplayName = googleUser.displayName,
                UserName = googleUser.email,
                Email = googleUser.email,
                EmailConfirmed = true
            };
            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                //var errors = string.Join(" | ", createResult.Errors.Select(e => e.Description));
                //return Result<RefreshTokenModel>.Failure(errors);
                return Result<RefreshTokenModel>.Failure("Erro ao Criar Usuario");
            }
            var userLoginInfo = new UserLoginInfo(GoogleProvider, googleUser.googleId, GoogleProvider);
            await _userManager.AddLoginAsync(user, userLoginInfo);


            return await LogInAsync(user);
        }
        private async Task<Result<RefreshTokenModel>> LogInAsync(ApplicationUser user)
        {

            var newRefreshToken = await GenerateRefreshTokenModelAsync(user);
            if (newRefreshToken is null)
            {
                return Result<RefreshTokenModel>.Failure("Não foi possivel cadastrar o token");
            }
            return Result<RefreshTokenModel>.Success(newRefreshToken);
        }

        private async Task<RefreshTokenModel> GenerateRefreshTokenModelAsync(ApplicationUser user)
        {
            var accessToken = await _tokenService.GenerateTokenAsync(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var newRefreshToken = new RefreshTokenModel
            {
                RefreshToken = refreshToken,
                AccessToken = accessToken,

            };
            var result = await _tokenService.StoreRefreshTokenAsync(newRefreshToken.AccessToken, newRefreshToken.RefreshToken, user.Id);

            if (!result)
            {
                return null;
            }

            return newRefreshToken;
        }

        public async Task<Result<RefreshTokenModel>> DiscordSignUp()
        {
            var discorduser = await _discordAuthService.GetDiscordUserAsync();
            Console.WriteLine(discorduser.Id);
            Console.WriteLine(discorduser.Username);
            Console.WriteLine(discorduser.Email);
            var userLoginInfo = new UserLoginInfo(DiscordProvider, discorduser.Id, DiscordProvider);
            //Verify if user exists in the database
            var userDb = await _userManager.FindByEmailAsync(discorduser.Email);
            if (userDb is not null)
            {
                //User Exists, but is the user already linked with Discord?
                var userLogins = await _userManager.GetLoginsAsync(userDb);
                if (!userLogins.Any(x => x.LoginProvider == DiscordProvider))
                {
                    //Account exists but is not linked with Discord, link the account
                    await _userManager.AddLoginAsync(userDb, userLoginInfo);
                }
                //User Login with Discord already exists, proceed to login
                return await LogInAsync(userDb);
            }
            //User does not exist, create a new user and link with Discord
            var user = new ApplicationUser
            {
                //Change this later when DisplayName is available
                UserName = discorduser.Email,
                Email = discorduser.Email,
                EmailConfirmed = true
            };

            var createdResult =  await _userManager.CreateAsync(user);
            if(!createdResult.Succeeded)
            {
                return Result<RefreshTokenModel>.Failure("Erro ao criar usuário");
            }
            await _userManager.AddLoginAsync(user, userLoginInfo);



            return await LogInAsync(user);
        }
    }
}