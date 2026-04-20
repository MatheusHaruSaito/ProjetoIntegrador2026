using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Aplication.Common;
using RpgDex.Aplication.Dto;
using RpgDex.Aplication.Interfaces;
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
    }
}
