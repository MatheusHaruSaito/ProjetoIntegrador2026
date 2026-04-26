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
    public class CharacterController : ControllerBase
    {
        private readonly ICharacterSevice _characterSevice;
        public CharacterController(ICharacterSevice characterSevice)
        {
            _characterSevice = characterSevice;
        }
        [HttpPost]
        public async Task<ActionResult<CharacterResponse>> CreateCharacter(CreateCharacterRequest request)
        {

            var result = await _characterSevice.Create(request);
            if (result.IsFailure)
            {
                return BadRequest(new{success = result.IsSuccess,
                                      message = result.Error,
                                      data = result.Value});
            }


            return Ok(new {success= result.IsSuccess,
                           data = result.Value});
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CharacterResponse>>> GetAll()
        {
            var result = await _characterSevice.GetAllAsync();

            if(result.IsFailure)
            {
                return NotFound(new{ success = result.IsSuccess,
                    message = result.Error,
                    data = result.Value
                });
            }
            return Ok(new
            {
                success = result.IsSuccess,
                data = result.Value
            });

        }
        [HttpGet("{Id}")]
        public async Task<ActionResult<CharacterResponse>> GetById(Guid Id)
        { 

             var result = await _characterSevice.GetByIdAsync(Id);

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
                data = result.Value
            });
        }
        [HttpPut("SetActiveState/{Id}")]
        public async Task<ActionResult<CharacterResponse>> SetActiveState(Guid Id,bool state)
        {

            var result = await _characterSevice.SetActiveState(Id, state);

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
                data = result.Value
            });
        }
        [HttpPut]
        public async Task<ActionResult> Update(UpdateCharacterRequest request)
        {

            var result = await _characterSevice.UpdateAsync(request);
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
                data = result.Value
            });
        }
            
    }
}
