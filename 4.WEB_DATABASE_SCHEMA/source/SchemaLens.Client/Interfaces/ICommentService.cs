using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface ICommentService
    {
        public Task<List<CommentModel>> GetCommentsByObjectIdAsync(int objectId);
        public Task PostCommentsByIpAsync(int objectId, string text, string ip);
    }
}
