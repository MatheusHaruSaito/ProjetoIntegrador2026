using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class AddCharacterToCampaignRequest
    {
        public Guid CampaignId { get; set; }
        public Guid CharacterId { get; set; }
    }
}
