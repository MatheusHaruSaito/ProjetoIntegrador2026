using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Common
{
    public class Result<T>
    {
        public T? Value { get;}
        public string? Error { get;}
        public bool IsSuccess { get;}
        public bool IsFailure => !IsSuccess;

        public Result(bool IsSuccess, T? Value, string Error)
        {
            this.IsSuccess = IsSuccess;
            this.Value = Value;
            this.Error = Error;
        }

        public static Result<T> Success(T Value) => new Result<T>(true, Value, null);
        public static Result<T> Failure(string Error) => new Result<T>(true, default, Error);


    }
}
