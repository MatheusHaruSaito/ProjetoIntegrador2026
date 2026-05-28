using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Interfaces
{
    public interface IFileService
    {
        Task<byte[]> DownloadFileAsync(string filePath);
    }
}
