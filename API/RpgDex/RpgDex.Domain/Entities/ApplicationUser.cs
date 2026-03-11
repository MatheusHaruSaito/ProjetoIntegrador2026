using AspNetCore.Identity.MongoDbCore.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Entities
{
    public class ApplicationUser : MongoIdentityUser<Guid>
    {
        public List<Guid> CharactersId { get; set; }  = new List<Guid>();
        public List<Guid> Tables { get; set; } = new List<Guid>();

    }
}
