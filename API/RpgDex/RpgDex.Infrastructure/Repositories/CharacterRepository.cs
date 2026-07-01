using MongoDB.Driver;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Infrastructure.Services
{

    public class CharacterRepository : ICharacterRepository
    {
        private readonly MongoDbContext _context;
        private readonly IMongoCollection<Character> _entitie;

        public CharacterRepository(MongoDbContext context)
        {
            _context = context;
            _entitie = context.Character;
        }

        public async Task<Character> InsertAsync(Character character)
        {
            await _entitie.InsertOneAsync(character);

            return await _entitie.Find(o => o.Id == character.Id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Character>> GetAllByUserIdAsync(Guid userId)
        {
            var filter = Builders<Character>.Filter.Eq(c => c.UserId, userId) 
                & Builders<Character>.Filter.Eq(c => c.IsActive, true);
            return await _entitie.Find(filter).ToListAsync();
        }

        public async Task<Character> GetByIdAsync(Guid Id)
        {
            return await _entitie.Find(u => u.Id == Id).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(Character newCharacter)
        {
            var filter = Builders<Character>.Filter.Eq(c => c.Id, newCharacter.Id);
            var updateCharacter = Builders<Character>.Update
                .Set(c => c.IconPath, newCharacter.IconPath)
                .Set(c => c.Name, newCharacter.Name)
                .Set(c => c.Description, newCharacter.Description)
                .Set(c => c.Properties, newCharacter.Properties);
            var result = await _entitie.UpdateOneAsync(filter, updateCharacter);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetActiveState(Guid Id, bool ActiveState)
        {
            var filter = Builders<Character>.Filter.Eq(c => c.Id, Id);
            var updateCharacter = Builders<Character>.Update
                .Set(c => c.IsActive, ActiveState);

            var result = await _entitie.UpdateOneAsync(filter, updateCharacter);
            return result.ModifiedCount > 0;
        }
    }
}
