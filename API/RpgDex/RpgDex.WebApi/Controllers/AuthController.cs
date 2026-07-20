using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.WebApi.Extensions;
namespace RpgDex.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authSerice;
        public AuthController(IAuthService authSerice)
        {
            _authSerice = authSerice;
        }
        [HttpPost]
        public async Task<ActionResult<bool>> Register(CreateUserDTO user)
        {
            var result = await _authSerice.RegisterUser(user);
            if (result.IsFailure)
            {
                return NotFound(new
                {
                    success = result.IsSuccess,
                    message = result.Error,
                    data = result.Value
                });
            }
            return Ok(new
            {
                success= result.IsSuccess,
                data = result.Value,
            });
        }
        [HttpPost("Login")]
        public async Task<ActionResult<RefreshTokenModel>> LogIn(AuthUserDTO user)
        {
            var result = await _authSerice.LogIn(user);

            if (result.IsFailure)
            {
                return NotFound(new
                {
                    success = result.IsSuccess,
                    message = result.Error,
                    data = result.Value
                });
            }
            return Ok(new
            {
                success = result.IsSuccess,
                data = result.Value,
            });

        }
        [HttpPost("RefreshToken")]
        public async Task<ActionResult<RefreshTokenModel>> RefreshToken(RefreshTokenModel refreshToken)
        {

                var result = await _authSerice.RefreshTokenAsync(refreshToken);
                if (result.IsFailure)
                {
                    return NotFound(new
                    {
                        success = result.IsSuccess,
                        message = result.Error,
                        data = result.Value
                    });
                }
                return Ok(new
                {
                    success = result.IsSuccess,
                    data = result.Value,
                });

        }

        [HttpPut("ValidateEmail/")]
        public async Task<IActionResult> ValidateEmailByToken(ValidateEmailByTokenRequest request)
        {
            var result = await _authSerice.ValidateEmailByTokenAsync(request);
            return result.ToIActionResult();
        }

        [HttpPost("ResendEmailVerification")]
        public async Task<IActionResult> ResendEmailVerification(ResendEmailVerificationRequest request)
        {
            var result = await _authSerice.ResendEmailVerificationAsync(request);
            return result.ToIActionResult();
        }
    }
}
