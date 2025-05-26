using Microsoft.Extensions.Configuration;

namespace IV.Shared.Interfaces.Services;

public interface IAzureService
{
    public Task<bool> UploadChunkAsync(byte[] chunkData, int chunkIndex, string fileId, string containerName = "images");

    public Task<string> MergeChunksAsync(string fileId, string? finalExtension = null, string containerName = "images");

    public Task<string> GenerateAndUploadThumbnailAsync(string videoUrl, string containerName = "images");
}