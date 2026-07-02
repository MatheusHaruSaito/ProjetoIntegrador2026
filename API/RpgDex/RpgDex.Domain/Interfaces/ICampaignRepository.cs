using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ICampaignRepository
    {
        Task<Campaign> InsertAsync(Campaign campaign);
        Task<IEnumerable<Campaign>> GetAllAsync();
        Task<IEnumerable<Campaign>> GetAllAsync(Guid userId);
        Task<Campaign> GetByIdAsync(Guid id);
        Task<Campaign> UpdateAsync(Campaign newCampaign);
        Task<bool> SetActiveState(Guid Id, bool ActiveState);
        Task<Campaign> PushPlayer(Guid campaignId, Guid playerId);


    }
}
