using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public Task<bool> Register(CreateUserDTO user)
        {
            return _authSerice.RegisterUser(user);
        }
        [HttpPost("Login")]
        public async Task<ActionResult<RefreshTokenModel>> LogIn(AuthUserDTO user)
        {
            try
            {
                var result = await _authSerice.LogIn(user);
                return Ok(new { AccessToken = result.AccessToken,
                                RefreshToken = result.RefreshToken});
            }catch(Exception ex)
            {
                return NotFound(new {Token= ex.Message});
            }

        }
        [HttpPost("RefreshToken")]
        public async Task<ActionResult<RefreshTokenModel>> RefreshToken(RefreshTokenModel refreshToken)
        {
            try
            {
                var Token = await _authSerice.RefreshTokenAsync(refreshToken);
                return Ok(new { Token });
            }
            catch (Exception ex)
            {
                return NotFound(new { Token = ex.Message });
            }

        }
    }
}
