using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RpgDex.Application.Common;
using RpgDex.Application.Dto;
using RpgDex.Application.Interfaces;
using RpgDex.Application.Services;
using RpgDex.WebApi.Extensions;

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
            return result.ToIActionResult();
        }
        [HttpGet("{userId}/All")]
        public async Task<IActionResult> GetAll(Guid userId)
        {
            var result = await _campaignService.GetAll(userId);
            return result.ToIActionResult();
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _campaignService.GetById(id);
            return result.ToIActionResult();
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateCampaignRequest request)
        {
            var result = await _campaignService.Create(request);
            return result.ToIActionResult();
        }
        [HttpPut]
        public async Task<IActionResult> Update(UpdateCampaignRequest request)
        {
            var result = await _campaignService.Update(request);
            return result.ToIActionResult();
        }
        [HttpPut("SetActiveState/{Id}")]
        public async Task<IActionResult> SetActiveState(Guid Id, bool state)
        {

            var result = await _campaignService.SetActiveState(Id, state);
            return result.ToIActionResult();
        }
        [HttpPut("AddPlayer")]
        public async Task<IActionResult> JoinCampaignRequest(JoinCampaignRequest request)
        {

            var result = await _campaignService.AddPlayer(request);
            return result.ToIActionResult();
        }
        [HttpPut("AddCharacter")]
        public async Task<IActionResult> AddCharacterRequest(AddCharacterToCampaignRequest request)
        {

            var result = await _campaignService.AddCharacter(request);
            return result.ToIActionResult();
        }
        [HttpPut("AcceptCharacter")]
        public async Task<IActionResult> AcceptCharacter(AcceptCharacterToCampaignRequest request)
        {

            var result = await _campaignService.AcceptCharacter(request);
            return result.ToIActionResult();
        }

        [HttpPut("RemovePlayer")]
        public async Task<IActionResult> RemovePlayer(KickPlayerFromCampaignRequest request)
        {

            var result = await _campaignService.RemovePlayer(request);
            return result.ToIActionResult();
        }
        [HttpPut("UpdateSettings")]
        public async Task<IActionResult> UpdateSettings(UpdateCampaignSettingsRequest request)
        {

            var result = await _campaignService.UpdateConfiguration(request);
            return result.ToIActionResult();
        }
    }
}
