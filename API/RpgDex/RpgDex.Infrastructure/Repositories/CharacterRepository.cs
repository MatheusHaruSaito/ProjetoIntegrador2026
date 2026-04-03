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

        public async Task<IEnumerable<Character>> GetAllAsync()
        {
            return await _entitie.Find(_ => true).ToListAsync();
        }

        public async Task<Character> GetByIdAsync(Guid Id)
        {
            return await _entitie.Find(u => u.Id == Id).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(Character NewCharacter)
        {
            var filter = Builders<Character>.Filter.Eq(c => c.Id, NewCharacter.Id);
            var updateUser = Builders<Character>.Update
                .Set(u => u.IconPath, NewCharacter.IconPath)
                .Set(u => u.Name, NewCharacter.Name)
                .Set(u => u.Description, NewCharacter.Description)
                .Set(u => u.Attributes, NewCharacter.Attributes)
                .Set(u => u.Skills, NewCharacter.Skills);
            var result = await _entitie.UpdateOneAsync(filter, updateUser);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(Guid Id)
        {
            var filter = Builders<Character>.Filter.Eq(c => c.Id, Id);
            var result = await _entitie.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }
    }
}
