using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using RpgDex.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Entities
{
    public class Character
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string IconPath { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        public List<ValueObjects.Attribute> Attributes { get; set; } = new List<ValueObjects.Attribute>();
        public List<Skill> Skills { get; set; } = new List<Skill>();

    }
}
