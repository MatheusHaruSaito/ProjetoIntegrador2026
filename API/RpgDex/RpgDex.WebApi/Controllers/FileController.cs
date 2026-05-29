using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Services;

namespace RpgDex.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        public FileController(IFileService fileService)
        {
            _fileService = fileService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(string id)
        {
            if (string.IsNullOrEmpty(id) || id.Length != 24)
            {
                return BadRequest("O ID fornecido é inválido.");
            }

            var (fileBytes, extension) = await _fileService.DownloadFileAsync(id);
            if (fileBytes == null || fileBytes.Length == 0)
            {
                return NotFound("Imagem não encontrada.");
            }
            return File(fileBytes, extension);
        }
    }
}
