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
    }
}
