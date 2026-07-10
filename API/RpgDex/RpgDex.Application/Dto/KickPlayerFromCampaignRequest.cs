using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class KickPlayerFromCampaignRequest
    {
        public Guid CampaignId { get; set; }
        public Guid IssuerPlayerId { get; set; }
        public Guid PlayerId { get; set; }
    }
}
