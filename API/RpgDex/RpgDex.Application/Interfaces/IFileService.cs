using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface IFileService
    {
        Task<byte[]> DownloadFileAsync(string filePath);
        Task<string> UploadFileAsync(IFormFile file, string fileName);
    }
}
