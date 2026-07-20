using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface IEmailService
    {
        Task<(bool isEmailSent, string message)> SendEmailAsync(string receiverEmail, string receiverName, string subject, string htmlbody);
        string GenerateEmailVerificationHTMLTemplate(string endpoint, string token);

    }
}
