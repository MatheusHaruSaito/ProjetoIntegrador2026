using MongoDB.Driver;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly MongoDbContext _mongoDbContext;
        private readonly IMongoCollection<ApplicationUser> _users;

        public UserRepository(MongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
            _users = mongoDbContext.Users;
        }
        public async Task<bool> PushCharacterAsync(Guid userId, Guid characterId)
        {
            var filter = Builders<ApplicationUser>.Filter.Eq(u => u.Id, userId);
            var update = Builders<ApplicationUser>.Update
                .AddToSet(u => u.CharactersId, characterId);

            var result = await _users.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0;
        }
        public async Task<bool> PullCharacterAsync(Guid userId, Guid characterId)
        {
            var filter = Builders<ApplicationUser>.Filter.Eq(u => u.Id, userId);
            var update = Builders<ApplicationUser>.Update
                .Pull(u => u.CharactersId, characterId);

            var result = await _users.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0;
        }
    }
}
