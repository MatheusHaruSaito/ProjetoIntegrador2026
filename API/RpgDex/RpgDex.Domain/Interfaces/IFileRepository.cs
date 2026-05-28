using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Interfaces
{
    public interface IFileRepository
    {
        Task<string> UploadFileAsync(string fileName, Stream fileStream);
        Task<byte[]> DownloadFileAsync(string fileId);
    }
}
