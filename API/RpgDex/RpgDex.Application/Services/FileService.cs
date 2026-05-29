using Microsoft.AspNetCore.Http;
using RpgDex.Application.Interfaces;
using RpgDex.Domain.Entities;
using RpgDex.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Application.Services
{
    public class FileService : IFileService
    {
        private readonly IFileRepository _fileRepository;
        public FileService(IFileRepository fileRepository   )
        {
            _fileRepository = fileRepository;
        }
        public async Task<byte[]> DownloadFileAsync(string fileId)
        {
            return await _fileRepository.DownloadFileAsync(fileId);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string fileName)
        {
            if (file != null && file.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    var Extension = Path.GetExtension(file.FileName);
                    var ServerfileName = $"{fileName}_icon{Extension}";
                    return await _fileRepository.UploadFileAsync(ServerfileName, memoryStream);
                }
            }
            throw new ArgumentException("File is null or empty");
        }
    }
}
