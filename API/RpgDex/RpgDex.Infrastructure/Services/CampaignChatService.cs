using Microsoft.AspNetCore.SignalR;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Hubs;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Infrastructure.Services
{
    public class CampaignChatService(IHubContext<CampaignChatHub> campaignChatHub) : ICampaignChatService
    {
        public async Task SendMessage(string campaignId, string user, string message)
        {
            await campaignChatHub.Clients
                .Group($"campaign-{campaignId}")
                .SendAsync("ReceiveMessage",user,message);
        }
    }
}
