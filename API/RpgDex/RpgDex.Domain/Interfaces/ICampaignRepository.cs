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
        Task<Campaign> GetByIdAsync(Guid Id);
    }
}
