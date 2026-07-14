using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Settings;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        public EmailService(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }
        public async Task<(bool isEmailSent, string message)> SendEmail(string receiverEmail,string receiverName, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("RpgDex", _settings.Username));
            message.To.Add(new MailboxAddress(receiverName, receiverEmail));
            message.Subject = subject;
            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };

            try
            {
                using (var client = new SmtpClient()) {
                    await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, true);

                    await client.AuthenticateAsync(_settings.Username, _settings.Password);

                    await client.SendAsync(message);

                    await client.DisconnectAsync(true);
                }
            }
            catch(Exception ex) {
                return (false, "Error sending email: " + ex.Message);
            }

            return (true, "Email sent successfully.");
        }
    }
}
