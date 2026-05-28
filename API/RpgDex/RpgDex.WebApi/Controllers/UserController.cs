using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Dto;



namespace RpgDex.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult<string>> UpdateUserProfile(Guid Id,UpdateUserProfileDTO updateUserProfileDTO)
        {
            var result = await _userService.UpdateUserProfileAsync(Id, updateUserProfileDTO);

            if (result.IsFailure)
            {
                return NotFound(new
                {
                    success = result.IsSuccess,
                    message = result.Error,
                    data = result.Value
                });
            }
            if (result.IsSuccess)
            {
                return Ok(new
                {
                    success = result.IsSuccess,
                    data = result.Value
                });
            }
            return StatusCode(500,"Unexpected Error has occurred");
        }

    }
}
