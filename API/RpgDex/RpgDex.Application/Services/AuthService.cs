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
        public async Task<Result<LoginResponse>> LogIn(AuthUserDTO authUser)
        {
            var user = await _userManager.FindByEmailAsync(authUser.Email);
            if (user is null) return Result<LoginResponse>.Failure("Invalid Credentials");

            var validUser = await _userManager.CheckPasswordAsync(user, authUser.Password);
            if (!validUser) return Result<LoginResponse>.Failure("Invalid Credentials");

            var IsEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if(!IsEmailConfirmed) return Result<LoginResponse>.Failure("Email not confirmed");

            var response = new LoginResponse();

            if (user.TwoFactorEnabled)
            {
               response.TwoFactorEnabled = true;
               response.Email = user.Email;

               return await SendTwoFatorEmail(user,response);
            }

            var accessToken = await _tokenService.GenerateTokenAsync(user);

            var newRefreshToken = await GenerateRefreshTokenModelAsync(user);

            response.RefreshToken = newRefreshToken;


            return Result<LoginResponse>.Success(response);
        }

        public async Task<Result<AuthOptionsResponse>> GetUserAuthOptions(Guid UserId)
        {
            var user = await _userManager.FindByIdAsync(UserId.ToString());
            if(user is null)
            {
                return Result<AuthOptionsResponse>.Failure("Failed to return User");
            }
            var hasPassword = await _userManager.HasPasswordAsync(user);
            var isTwoFactorEnabled = user.TwoFactorEnabled;

            var logins = await _userManager.GetLoginsAsync(user);
            var extrenalProviders = logins.Select(l => l.LoginProvider).ToList();
            var authoptions = new AuthOptionsResponse
            {
                HasPassword = hasPassword,
                ExternalProviders = extrenalProviders,
                IsTwoFactorEnabled = isTwoFactorEnabled,

            };
            return Result<AuthOptionsResponse>.Success(authoptions);
        }
        public async Task<Result<RefreshTokenModel>> ValidateTwoFactor(ValidateTwoFactorRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if(user is null)
            {
                return Result<RefreshTokenModel>.Failure("Invalid two-factor code or user request");
            }

            var isTokenValid = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, request.Token);

            if (!isTokenValid)
            {
                return Result<RefreshTokenModel>.Failure("Invalid two-factor code or user request");
            }

            return await LogInAsync(user);
        }
        public async Task<Result<string>> RequestTwoFAActivation(ValidateTwoFactorRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user is null)
            {
                return Result<string>.Failure("Invalid two-factor code or user request");
            }
            var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider,request.Token);

            if (!isValid)
            {
                return Result<string>.Failure("Invalid two-factor code or user request");
            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, true);
            if (!result.Succeeded)
            {
                return Result<string>.Failure("Unable to activate Twho Factor Authentication");

            }
            return Result<string>.Success("Two Factor Authentication Activated");
        }

        public async Task<Result<string>> SendTwoFactorAuthEmailRequest(TwoFactorAuthEmailRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user is null) return Result<string>.Failure("User not found");

            return await SendTwoFatorEmail(user, "Confirmation Code sent to your email");
        }

        public async Task<Result<RefreshTokenModel>> RefreshTokenAsync(RefreshTokenModel tokenModel)
        {
            if (tokenModel is null)
            {
                return Result<RefreshTokenModel>.Failure("Invalid token");
            }
            var token = await _tokenService.GetRefreshTokenByToken(tokenModel.RefreshToken);
            if(token is null)
            {
                return Result<RefreshTokenModel>.Failure("Invalid token");
            }

            var principal = _tokenService.GetPrincipalFromExpiredToken(tokenModel.AccessToken);
            if(principal is null)
            {
                return Result<RefreshTokenModel>.Failure("Invalid token");

            }

            string userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null|| tokenModel.RefreshToken != token.Token)
            {
                return Result<RefreshTokenModel>.Failure("Invalid user token");
            }

            var tokenRevoked = await _tokenService.RevokeTokenByValue(tokenModel.RefreshToken);
            if (!tokenRevoked) { 
                return Result<RefreshTokenModel>.Failure("Invalid token");
            }

            var newTokenModel = await GenerateRefreshTokenModelAsync(user);

            if (newTokenModel is null)
            {
                return Result<RefreshTokenModel>.Failure("It was not possible to generate a new token");
            }
            return Result<RefreshTokenModel>.Success(newTokenModel);
        }

        public async Task<Result<string>> RegisterUser(CreateUserDTO authUser) {
            var user = authUser.Adapt<ApplicationUser>();
            var result = await _userManager.CreateAsync(user, authUser.Password);
            if (!result.Succeeded)
            {
                return Result<string>.Failure("It was not possible to register the user");
            }
            return await SendEmailVerificationAsync(authUser.Email);

        }

        public async Task<Result<string>> ValidateEmailByTokenAsync(ValidateEmailByTokenRequest request)
        {
            var isValid = await _tokenService.ValidateEmailToken(request.UserId, request.Token);
            if(isValid)
            {
                return Result<string>.Success("Email verified successfully");
            }
            return Result<string>.Failure("Invalid or expired token");
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
                return Result<RefreshTokenModel>.Failure("Invalid Google token");
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
                        return Result<RefreshTokenModel>.Failure("An error occurred while linking the Google account");
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
                IconPath = googleUser.iconUrl,
                EmailConfirmed = true
            };
            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                //var errors = string.Join(" | ", createResult.Errors.Select(e => e.Description));
                //return Result<RefreshTokenModel>.Failure(errors);
                return Result<RefreshTokenModel>.Failure("An error occurred while creating the user");
            }
            var userLoginInfo = new UserLoginInfo(GoogleProvider, googleUser.googleId, GoogleProvider);
            await _userManager.AddLoginAsync(user, userLoginInfo);


            return await LogInAsync(user);
        }

        public async Task<Result<RefreshTokenModel>> DiscordSignUp()
        {
            var discorduser = await _discordAuthService.GetDiscordUserAsync();
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
                DisplayName = discorduser.DisplayName,
                UserName = discorduser.Email,
                Email = discorduser.Email,
                IconPath = discorduser.IconUrl,
                EmailConfirmed = true
            };

            var createdResult =  await _userManager.CreateAsync(user);
            if(!createdResult.Succeeded)
            {
                return Result<RefreshTokenModel>.Failure("An error occurred while creating the user");
            }
            await _userManager.AddLoginAsync(user, userLoginInfo);



            return await LogInAsync(user);
        }
        private async Task<Result<string>> SendEmailVerificationAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null)
            {
                return Result<string>.Failure("User not found");
            }

            var token = await _tokenService.GenerateEmailTokenVerificationAsync(user.Id);
            if (token is null)
            {
                return Result<string>.Failure("It was not possible to generate the verification token");
            }
            string verificationLink = $"/emailConfirmation?userid={user.Id}&token={token}";
            var htmlBody = _emailService.GenerateEmailVerificationHTMLTemplate(verificationLink, user.UserName);
            var (isEmailSent, message) = await _emailService.SendEmailAsync(user.Email, user.UserName, "Email Verification", htmlBody);
            if (!isEmailSent)
            {
                return Result<string>.Failure(message);
            }
            return Result<string>.Success(message);
        }

        private async Task<Result<RefreshTokenModel>> LogInAsync(ApplicationUser user)
        {

            var newRefreshToken = await GenerateRefreshTokenModelAsync(user);
            if (newRefreshToken is null)
            {
                return Result<RefreshTokenModel>.Failure("It was not possible to generate a new token");
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

        private async Task<Result<T>> SendTwoFatorEmail<T>(ApplicationUser user, T response)
        {
            try
            {
                var twoFactorToken = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);

                //Generate Email and sendUser
                var htmlTemplate = _emailService.GenerateTwoFactorEmailHTMLTemplate(twoFactorToken, user.DisplayName);
                var emailResult = await _emailService.SendEmailAsync(user.Email, user.DisplayName, "Two Factor Authentication", htmlTemplate);

                if (!emailResult.isEmailSent)
                {
                    return Result<T>.Failure("An Error has occured sending the Two Factor Code");
                }
                return Result<T>.Success(response);
            }
            catch
            {
                return Result<T>.Failure("An Error has occured while genereting the Two Factor Code");
            }
        }
    }
}