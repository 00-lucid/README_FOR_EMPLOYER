namespace IV.Shared.Interfaces.Services;

public interface IAzureFaceAiService
{
    public Task<string> BlurFacesIfNeededAsync(string imageUrl, CancellationToken cancellationToken = new());
}