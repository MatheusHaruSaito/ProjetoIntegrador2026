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
        public Guid[]? PlayersId { get; set; }
        public Guid[]? CharactersId { get; set; }

    }
}
