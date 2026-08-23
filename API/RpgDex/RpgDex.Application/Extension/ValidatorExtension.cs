using FluentValidation.Results;
using RpgDex.Application.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Extension
{
    public static class ValidatorExtension
    {
        public static Result<T> ReturnErrors<T>(this ValidationResult result)
        {
            var errrorMessage = string.Join(", ", result.Errors.Select(e => e.ErrorMessage));
            return Result<T>.Failure(errrorMessage);
        }
    }
}
