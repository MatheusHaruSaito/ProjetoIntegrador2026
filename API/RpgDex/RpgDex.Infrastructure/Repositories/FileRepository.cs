using MongoDB.Driver.GridFS;
using MongoDbGenericRepository;
using RpgDex.Domain.Interfaces;

namespace RpgDex.Infrastructure.Repositories
{
    public class FileRepository : IFileRepository
    {
        //SOLUÇÃO TEMPORARIA PARA O USO DO CLOUD FLARE R2, DEPOIS IMPLEMENTAR O USO DO CLOUD FLARE R2 AQUI
        //Por enquanto os arquivos são salvos no mongo, mas futuramente serão salvos no cloud flare r2
        private readonly IGridFSBucket _gridFSBucket;
        public FileRepository(IGridFSBucket gridFSBucket)
        {
            _gridFSBucket = gridFSBucket;
        }

        public async Task<byte[]> DownloadFileAsync(string fileId)
        {
            try
            {
                var objectId = new MongoDB.Bson.ObjectId(fileId);

                return await _gridFSBucket.DownloadAsBytesAsync(objectId);
            }
            catch (GridFSFileNotFoundException)
            {
                return null;
            }
        }

        public async Task<string> UploadFileAsync(string fileName, Stream fileStream)
        {
            var fileId = await _gridFSBucket.UploadFromStreamAsync(fileName, fileStream);
            return fileId.ToString();
        }
    }
}
