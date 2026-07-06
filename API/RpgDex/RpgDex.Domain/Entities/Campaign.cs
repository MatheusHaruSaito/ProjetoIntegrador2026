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
        public string? Password { get; set; }
        public int MaxPlayers { get; set; }
        public string? IconPath { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid GameMasterId{ get; set; }
        public IEnumerable<Guid>? PlayerIds { get; set; }
        public IEnumerable<Guid>? CharacterIds { get; set; }

        public Campaign()
        {
            PlayerIds = new List<Guid>();
            CharacterIds = new List<Guid>();
        }

        public bool TryAddPlayer(Guid playerId)
        {
            if (PlayerIds == null)
                PlayerIds = new List<Guid>();

            if (PlayerIds.Count() >= MaxPlayers)
                return false;

            ((List<Guid>)PlayerIds).Add(playerId);
            return true;
        }
    }
}
