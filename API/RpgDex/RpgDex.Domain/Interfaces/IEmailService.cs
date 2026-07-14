using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface IEmailService
    {
        Task<(bool isEmailSent, string message)> SendEmail(string receiverEmail, string receiverName, string subject, string htmlbody);
    }
}
