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
        public string? IconPath { get; set; }
        public IReadOnlyCollection<Guid>? PlayerIds { get; set; }
        public IReadOnlyCollection<Guid>? CharacterIds { get; set; }
        public IReadOnlyCollection<Guid>? CharacterRequests { get; set; }

    }
}
