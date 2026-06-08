using Microsoft.AspNetCore.Http;
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
        public IFormFile Icon { get; set; }
        public Guid UserId { get; set; }
        public string? Properties { get; set; }

    }
}
