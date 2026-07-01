using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Dto
{
    public class CreateCampaignRequest
    {
        public string Title { get; set; }
        public string? Description { get; set; }
        public Guid GameMasterId { get; set; }

    }
}
