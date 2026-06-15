using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Entities
{
    public class Campaign
    {
        public Guid Id{ get; set; }
        public string Title{ get; set; }
        public string? Description{ get; set; }
        public Guid GameMasterId{ get; set; }
        public Guid[]? PlayersId { get; set; }
        public Guid[]? CharactersId { get; set; }


    }
}
