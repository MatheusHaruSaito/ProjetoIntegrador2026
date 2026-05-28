using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace RpgDex.Application.Dto
{
    public class UpdateCharacterRequest
    {
        public Guid Id { get; set; }
        public string IconPath { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Dictionary<string, JsonElement> Properties { get; set; } = new Dictionary<string, JsonElement>();

    }
}
