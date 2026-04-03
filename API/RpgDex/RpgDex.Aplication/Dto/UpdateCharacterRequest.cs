using RpgDex.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;
using Attribute = RpgDex.Domain.ValueObjects.Attribute;

namespace RpgDex.Aplication.Dto
{
    public class UpdateCharacterRequest
    {
        public Guid Id { get; set; }
        public string IconPath { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<AttributeDTO> Attributes { get; set; }
        public List<SkillDTO> Skills { get; set; }
    }
}
