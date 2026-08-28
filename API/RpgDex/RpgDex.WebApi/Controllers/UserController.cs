using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Dto;
using RpgDex.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;



namespace RpgDex.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetUserById(Guid Id)
        {
            var result = await _userService.GetUserById(Id);
            return result.ToIActionResult();
        }
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateUserProfile(Guid Id,UpdateUserProfileDTO updateUserProfileDTO)
        {
            var result = await _userService.UpdateUserProfileAsync(Id, updateUserProfileDTO);
            return result.ToIActionResult();
        }

    }
}
