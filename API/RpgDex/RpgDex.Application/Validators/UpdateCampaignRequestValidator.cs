using FluentValidation;
using RpgDex.Application.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Validators
{
    public class UpdateCampaignRequestValidator : AbstractValidator<UpdateCampaignRequest>
    {
        public UpdateCampaignRequestValidator() {
            RuleFor(campaign => campaign.Title)
            .NotNull().WithMessage("Title can't be empty")
            .NotEmpty().WithMessage("Title can't be empty")
            .MaximumLength(60).WithMessage("Title can't exceed 60 digits");
            RuleFor(campaign => campaign.Description)
            .MaximumLength(1000).WithMessage("Description can't exceed 1000 digits");


            When(campaign => campaign.Icon != null, () =>
            {
                long maxSizeBytes = 5 * 1024 * 1024;
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                RuleFor(campaign => campaign.Icon)
                .Must(file => allowedExtensions.Contains(System.IO.Path.GetExtension(file.FileName).ToLower())).WithMessage("Icon must be a JPG, JPEG, or PNG file")
                .Must(file => file.Length <= maxSizeBytes).WithMessage("Icon file size must not exceed 5MB");
            });

        }
    }
}
