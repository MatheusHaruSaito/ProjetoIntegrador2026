using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            try
            {
                return await _characterSevice.Create(request);
            }
            catch (Exception ex)
            {
                return NotFound(new {message = ex.Message});
            }
        }
        [HttpGet]
        public async Task<IEnumerable<CharacterResponse>> GetAll()
        {
            return await _characterSevice.GetAll();
        }
    }
}
