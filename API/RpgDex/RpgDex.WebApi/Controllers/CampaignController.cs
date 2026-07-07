using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Services;

namespace RpgDex.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampaignController : ControllerBase
    {
        ICampaignService _campaignService;
        public CampaignController(ICampaignService campaignService)
        {
            _campaignService = campaignService;
        }
        [HttpGet()]
        public async Task<IActionResult> GetAll()
        {
            var result = await _campaignService.GetAll();
            if (result.IsFailure)
            {
                return BadRequest(new
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
        [HttpGet("{userId}/All")]
        public async Task<IActionResult> GetAll(Guid userId)
        {
            var result = await _campaignService.GetAll(userId);
            if (result.IsFailure)
            {
                return BadRequest(new
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
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _campaignService.GetById(id);
            if (result.IsFailure)
            {
                return BadRequest(new
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
        [HttpPost]
        public async Task<IActionResult> Create(CreateCampaignRequest request)
        {
            var result = await _campaignService.Create(request);
            if (result.IsFailure)
            {
                return BadRequest(new
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
        public async Task<IActionResult> Update(UpdateCampaignRequest request)
        {
            var result = await _campaignService.Update(request);
            if (result.IsFailure)
            {
                return BadRequest(new
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
        public async Task<ActionResult<bool>> SetActiveState(Guid Id, bool state)
        {

            var result = await _campaignService.SetActiveState(Id, state);

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
        [HttpPut("AddPlayer")]
        public async Task<ActionResult<bool>> JoinCampaignRequest(JoinCampaignRequest request)
        {

            var result = await _campaignService.AddPlayer(request);

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
        [HttpPut("AddCharacter")]
        public async Task<ActionResult<string>> AddCharacterRequest(AddCharacterToCampaignRequest request)
        {

            var result = await _campaignService.AddCharacter(request);

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
        [HttpPut("AcceptCharacter")]
        public async Task<ActionResult<string>> AcceptCharacter(AcceptCharacterToCampaignRequest request)
        {

            var result = await _campaignService.AcceptCharacter(request);

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
