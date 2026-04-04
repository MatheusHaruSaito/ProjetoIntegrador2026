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
        public async Task<string> LogIn(AuthUserDTO user)
        {
            return await _authSerice.LogIn(user);
        }
    }
}
