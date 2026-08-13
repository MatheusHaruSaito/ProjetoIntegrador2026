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

        public async Task<(bool isEmailSent, string message)> SendEmailAsync(string receiverEmail, string receiverName, string subject, string htmlBody)
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
                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, true);
                    await client.AuthenticateAsync(_settings.Username, _settings.Password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                return (false, "Error sending email: " + ex.Message);
            }

            return (true, "Email sent successfully.");
        }

        public string GenerateEmailVerificationHTMLTemplate(string verificationLink, string userName)
        {
            return $@"<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Confirme seu email — RPGDex</title>
</head>
<body style=""margin:0;padding:0;background-color:#f4f2fb;font-family:'Segoe UI',Arial,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f4f2fb;padding:40px 20px;"">
    <tr>
      <td align=""center"">
        <table width=""100%"" cellpadding=""0"" cellspacing=""0""
               style=""max-width:520px;background:#ffffff;border-radius:20px;
                       box-shadow:0 8px 40px rgba(100,60,200,0.12);overflow:hidden;"">

          <!-- Header gradiente -->
          <tr>
            <td style=""background:linear-gradient(135deg,#7c3aed,#a855f7);
                        padding:40px 40px 32px;text-align:center;"">
              <p style=""margin:0;font-family:'Segoe UI',Arial,sans-serif;
                         font-weight:900;font-size:2rem;color:#ffffff;
                         letter-spacing:-1px;"">RPGDex</p>
              <p style=""margin:10px 0 0;font-size:0.9rem;color:rgba(255,255,255,0.8);"">
                Sua plataforma de campanhas e fichas
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style=""padding:40px 40px 32px;"">

              <!-- Ícone -->
              <div style=""text-align:center;margin-bottom:24px;"">
                <div style=""display:inline-block;width:72px;height:72px;
                             border-radius:50%;background:#f3eeff;
                             border:3px solid #7c3aed;line-height:72px;
                             font-size:2rem;color:#7c3aed;text-align:center;"">
                  ✉
                </div>
              </div>

              <h1 style=""margin:0 0 8px;font-size:1.5rem;font-weight:800;
                          color:#1a1033;text-align:center;"">
                Confirme seu email
              </h1>
              <p style=""margin:0 0 24px;font-size:1rem;color:#555;
                         text-align:center;line-height:1.6;"">
                Olá, <strong style=""color:#7c3aed;"">{userName}</strong>!<br>
                Clique no botão abaixo para confirmar seu endereço de email
                e ativar sua conta no RPGDex.
              </p>

              <!-- Botão CTA -->
              <div style=""text-align:center;margin:32px 0;"">
                <a href=""{verificationLink}""
                   style=""display:inline-block;padding:16px 40px;
                           background:linear-gradient(135deg,#7c3aed,#a855f7);
                           color:#ffffff;font-size:1rem;font-weight:800;
                           text-decoration:none;border-radius:10px;
                           letter-spacing:0.04em;text-transform:uppercase;
                           box-shadow:0 4px 18px rgba(124,58,237,0.4);"">
                  Verificar email
                </a>
              </div>

              <!-- Aviso de expiração -->
              <p style=""margin:0 0 20px;font-size:0.85rem;color:#888;
                         text-align:center;line-height:1.5;"">
                Este link expirará em <strong>24 horas</strong>.<br>
                Se você não criou uma conta no RPGDex, ignore este email.
              </p>

              <!-- Link alternativo -->
              <div style=""background:#f8f6ff;border:1px solid #e5dff8;
                           border-radius:10px;padding:14px 16px;"">
                <p style=""margin:0 0 6px;font-size:0.78rem;font-weight:700;
                           color:#7c3aed;text-transform:uppercase;
                           letter-spacing:0.06em;"">
                  Link não funciona?
                </p>
                <p style=""margin:0;font-size:0.8rem;color:#666;
                           word-break:break-all;line-height:1.5;"">
                  Copie e cole o endereço abaixo no seu navegador:<br>
                  <span style=""color:#7c3aed;"">{verificationLink}</span>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:#f8f6ff;padding:20px 40px;text-align:center;
                        border-top:1px solid #ede9f8;"">
              <p style=""margin:0;font-size:0.8rem;color:#aaa;line-height:1.6;"">
                © {DateTime.UtcNow.Year} RPGDex · Este é um email automático, não responda.<br>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>";
        }
    }
}