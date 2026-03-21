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

        public async Task<Character> Post(Character character)
        {
            await _entitie.InsertOneAsync(character);

            return await _entitie.Find(o => o.Id == character.Id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Character>> GetAll()
        {
            return await _entitie.Find(_ => true).ToListAsync();
        }
    }
}
