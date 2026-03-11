using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RpgDex.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Dto
{
    public class CharacterResponse
    {
        public Guid UserId { get; set; }
        public string IconPath { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<AttributeDTO> Attributes { get; set; } = new List<AttributeDTO>();
        public List<Skill> Skills { get; set; } = new List<Skill>();
    }
}
