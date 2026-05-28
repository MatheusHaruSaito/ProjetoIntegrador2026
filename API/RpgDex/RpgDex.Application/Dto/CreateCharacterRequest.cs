using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace RpgDex.Application.Dto
{
    public class CreateCharacterRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid UserId { get; set; }
        public Dictionary<string, JsonElement> Properties { get; set; } = new Dictionary<string, JsonElement>();

    }
}
