using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Dto
{
    public class CreateCharacterRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public List<AttributeDTO> Attributes { get; set; }
    }
}
