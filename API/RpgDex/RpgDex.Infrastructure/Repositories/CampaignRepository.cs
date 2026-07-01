using MongoDB.Driver;
using RpgDex.Domain.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Infrastructure.Repositories
{
    public class CampaignRepository : ICampaignRepository
    {
        private readonly MongoDbContext _context;
        private readonly IMongoCollection<Campaign> _entitie;
        public CampaignRepository(MongoDbContext context)
        {
            _context = context;
            _entitie = context.Campaigns;
        }
        public async Task<Campaign> InsertAsync(Campaign campaign)
        {
            await _entitie.InsertOneAsync(campaign);

            return await _entitie.Find(o => o.Id == campaign.Id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Campaign>> GetAllAsync()
        {
            return await _entitie.Find(_ => true).ToListAsync();
        }
        public async Task<IEnumerable<Campaign>> GetAllAsync(Guid userId)
        {
            var filter = Builders<Campaign>.Filter.Eq(c => c.GameMasterId, userId);
            return await _entitie.Find(filter).ToListAsync();

        }
        public async Task<Campaign> GetByIdAsync(Guid id)
        {
            return await _entitie.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public Task<bool> UpdateAsync(Campaign newCampaign)
        {
            var filter = Builders<Campaign>.Filter.Eq(c => c.Id, newCampaign.Id);
            var updatedCampaign = Builders<Campaign>.Update
                .Set(c => c.Description, newCampaign.Description)
                .Set(c => c.Title, newCampaign.Title)
                .Set(c => c.IsActive, newCampaign.IsActive)
                .Set(c => c.PlayersId, newCampaign.PlayersId)
                .Set(c => c.CharactersId, newCampaign.CharactersId);
            _entitie.UpdateOneAsync(filter, updatedCampaign);
            throw new NotImplementedException();
        }
    }
}
