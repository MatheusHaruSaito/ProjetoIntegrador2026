using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class AcceptCharacterToCampaignRequest
    {
        public Guid UserId { get; set; }
        public Guid CampaignId { get; set; }
        public Guid CharacterId { get; set; }
        public bool IsAccepted { get; set; }

    }
}