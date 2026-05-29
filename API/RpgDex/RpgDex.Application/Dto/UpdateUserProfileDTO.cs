using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class UpdateUserProfileDTO
    {
        public string UserName { get; set; }
        public IFormFile Icon { get; set; }
    }
}
