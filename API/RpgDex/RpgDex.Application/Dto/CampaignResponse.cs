using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class CampaignResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid GameMasterId { get; set; }
        public int MaxPlayers { get; set; }
        public IEnumerable<Guid>? PlayerIds { get; set; }
        public IEnumerable<Guid>? CharacterIds { get; set; }

    }
}
