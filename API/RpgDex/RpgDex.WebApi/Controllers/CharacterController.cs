using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.WebApi.Extensions;
using System.Security.Claims;


namespace RpgDex.WebApi.Controllers
        {
        [Route("api/[controller]")]
        [ApiController]
        public class CharacterController : ControllerBase
        {
            private readonly ICharacterService _characterSevice;
            public CharacterController(ICharacterService characterSevice)
            {
                _characterSevice = characterSevice;
            }

            [HttpPost]
            public async Task<IActionResult> CreateCharacter(CreateCharacterRequest request)
            {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier);
            var result = await _characterSevice.Create(userId.Value, request);
                return result.ToIActionResult();
            }

            [HttpGet("{userId}/All")]
            public async Task<IActionResult> GetAllByUserId(Guid userId)
            {
            var result = await _characterSevice.GetAllByUserIdAsync(userId);
                return result.ToIActionResult();

            }

            [HttpGet("{Id}")]
            public async Task<IActionResult> GetById(Guid Id)
            { 

                var result = await _characterSevice.GetByIdAsync(Id);
                return result.ToIActionResult();
            }

            [HttpPut("SetActiveState/{Id}")]
            public async Task<IActionResult> SetActiveState(Guid Id,bool state)
            {

                var result = await _characterSevice.SetActiveState(Id, state);
                return result.ToIActionResult();
            }

            [HttpPut]
            public async Task<IActionResult> Update(UpdateCharacterRequest request)
            {

                var result = await _characterSevice.UpdateAsync(request);
                return result.ToIActionResult();
            }
            
        }
    }
