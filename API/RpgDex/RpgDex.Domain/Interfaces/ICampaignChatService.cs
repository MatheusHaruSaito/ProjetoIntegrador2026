using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface ICampaignChatService
    {
        Task SendMessage(string campaignId, string user, string message);
    }
}
