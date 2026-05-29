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
        public async Task<(byte[] fileBytes, string extension)> DownloadFileAsync(string fileId)
        {
            var fileBytes = await _fileRepository.DownloadFileAsync(fileId);
            var extension = GetImageContentType(fileBytes);
            return (fileBytes, extension);
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
        private string GetImageContentType(byte[] bytes)
        {
            if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            {
                return "image/jpeg";
            }

            if (bytes.Length >= 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            {
                return "image/png";
            }

            if (bytes.Length >= 12 && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
            {
                return "image/webp";
            }

            if (bytes.Length >= 4 && bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38)
            {
                return "image/gif";
            }

            // Se não reconhecer, retorna um tipo genérico ou PNG por padrão
            return "application/octet-stream";
        }
    }
}
