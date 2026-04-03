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
        public async Task<ActionResult<IEnumerable<CharacterResponse>>> GetAll()
        {
            try
            {
                return Ok(await _characterSevice.GetAllAsync());

            }
            catch (Exception ex)
            {
                return NotFound(new {message = ex.Message});
            }
        }
        [HttpGet("{Id}")]
        public async Task<ActionResult<CharacterResponse>> GetById(Guid Id)
        { 
            try
            {
                return Ok(await _characterSevice.GetByIdAsync(Id));

            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpDelete("{Id}")]
        public async Task<ActionResult<string>> Delete(Guid Id)
        {
            try
            {
                await _characterSevice.DeleteAsync(Id);
                return Ok($"Personagem de Id: {Id} Deletado!!");

            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        [HttpPut]
        public async Task<ActionResult> Update(UpdateCharacterRequest request)
        {
            try
            {
                await _characterSevice.UpdateAsync(request);
                return Ok($"{request.Name} Foi Alterado com Sucesso!!");
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
