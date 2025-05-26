namespace IV.Shared.Interfaces.Services;

public interface IAlbumMediaService
{
    /// <summary>
    /// 앨범 ID와 미디어 ID를 받아 해당 미디어를 삭제하는 메서드
    /// </summary>
    /// <param name="albumId">삭제할 앨범의 ID</param>
    /// <param name="mediaId">삭제할 미디어의 ID</param>
    /// <param name="mediaType">삭제할 미디어의 종류</param>
    /// <returns>삭제 성공 여부: 성공(true), 실패(false)</returns>
    Task<bool> DeleteMediaAsyncByMediaId(int albumId, int mediaId, string mediaType);
}