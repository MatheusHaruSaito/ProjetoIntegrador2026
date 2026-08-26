using FluentValidation;
using RpgDex.Application.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Validators
{
    public class CreateCharacterRequestValidator : AbstractValidator<CreateCharacterRequest>
    {
        public CreateCharacterRequestValidator() {

            RuleFor(character => character.Name)
                .NotNull().WithMessage("Name can't be empty")
                .NotEmpty().WithMessage("Name can't be empty")
                .MaximumLength(60).WithMessage("Name can't exceed 60 digits");

            RuleFor(character => character.Description)
                .MaximumLength(2000).WithMessage("Description can't exceed 2000 digits");   

            long maxSizeBytes = 2 * 1024 * 1024;
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            When(character => character.Icon != null, () =>
            {
                RuleFor(character => character.Icon)
                .Must(file => allowedExtensions.Contains(System.IO.Path.GetExtension(file.FileName).ToLower())).WithMessage("Icon must be a JPG, JPEG, or PNG file")
                .Must(file => file.Length <= maxSizeBytes).WithMessage("Icon file size must not exceed 2MB");
            });
        }
    }
}
