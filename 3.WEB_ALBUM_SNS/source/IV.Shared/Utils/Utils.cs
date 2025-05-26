using IV.Shared.Helpers;
using IV.Shared.Interfaces.Services;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.Extensions.Configuration;

namespace SchemaLens.Client.Utils
{
    public static class Common
    {
        public static string GetTimeElapsedText(DateTime? createdAt)
        {
            if (createdAt == null)
            {
                return "날짜 정보가 없습니다.";
            }

            // null이 아니라면 .Value를 사용해 DateTime으로 접근
            var timeSpan = DateTime.Now - createdAt.Value;

            if (timeSpan.TotalSeconds < 60)
            {
                return $"{(int)timeSpan.TotalSeconds}초 전";
            }
            else if (timeSpan.TotalMinutes < 60)
            {
                return $"{(int)timeSpan.TotalMinutes}분 전";
            }
            else if (timeSpan.TotalHours < 24)
            {
                return $"{(int)timeSpan.TotalHours}시간 전";
            }
            else if (timeSpan.TotalDays < 30)
            {
                return $"{(int)timeSpan.TotalDays}일 전";
            }
            else if (timeSpan.TotalDays < 365)
            {
                return $"{(int)(timeSpan.TotalDays / 30)}개월 전";
            }
            else
            {
                return $"{(int)(timeSpan.TotalDays / 365)}년 전";
            }
        }

        public static string ConvertBitsToBytes(string bitSize)
        {
            if (string.IsNullOrWhiteSpace(bitSize))
            {
                return "Invalid input. Please provide a valid bit size.";
            }

            if (!long.TryParse(bitSize, out long bits))
            {
                return "Invalid input. Bit size must be a numeric value.";
            }

            if (bits < 0)
            {
                return "Invalid input. Bit size cannot be negative.";
            }

            long bytes = bits / 8;
            return $"{bytes} Bytes";
        }

        /// <summary>
        /// AuthenticationState에서 특정 Claim을 가져옵니다.
        /// </summary>
        /// <param name="authStateTask">Task로 받은 AuthenticationState</param>
        /// <param name="claimType">가져오고자 하는 Claim의 Type</param>
        /// <returns>Claim 값, 없으면 null</returns>
        public static async Task<string?> GetClaimValueAsync(Task<AuthenticationState>? authStateTask, string claimType)
        {
            // AuthenticationState가 null이면 null 반환
            if (authStateTask == null) 
                return null;

            // AuthenticationState를 기다리고 Claims에서 claimType과 일치하는 값 반환
            var authState = await authStateTask;

            return authState.User?.Claims.FirstOrDefault(c => c.Type.Contains(claimType))?.Value;
        }
        
        /// <summary>
        /// 로그인 여부를 반환합니다.
        /// </summary>
        /// <param name="authStateTask">Task로 받은 AuthenticationState</param>
        /// <returns>로그인 여부</returns>
        public static async Task<bool> GetIsAuthenticationAsync(Task<AuthenticationState>? authStateTask)
        {
            // AuthenticationState가 null이면 null 반환
            if (authStateTask == null) 
                return false;

            // AuthenticationState를 기다리고 Claims에서 claimType과 일치하는 값 반환
            var authState = await authStateTask;

            return authState.User?.Identity?.IsAuthenticated ?? false;
        }
        
        public static async Task<int> GetNetworkConcurrencyLevelAsync()
        {
            try
            {
                // 테스트할 대상 URL 또는 IP (빠르게 응답 가능한 서버)
                string testHost = "google.com";
                using var ping = new System.Net.NetworkInformation.Ping();

                // Ping을 통한 네트워크 상태 측정 (RTT: 밀리초)
                var reply = await ping.SendPingAsync(testHost, 1000); // 1초 타임아웃
                if (reply.Status == System.Net.NetworkInformation.IPStatus.Success)
                {
                    long roundTripTime = reply.RoundtripTime;

                    // RTT 기반으로 동시성 계수 조정
                    if (roundTripTime < 50)
                    {
                        return 6; // 매우 빠른 네트워크 (동시 업로드 6개)
                    }
                    if (roundTripTime < 150)
                    {
                        return 4; // 적당한 네트워크 속도 (동시 업로드 4개)
                    }
                }

                return 2; // 느린 네트워크 (동시 업로드 2개)
            }
            catch
            {
                // 측정 실패 시 기본 설정 (느린 네트워크로 간주)
                return 2;
            }
        }
    }

    public static class ChunkFileSystem
    {
        /// <summary>
        /// 단일 파일을 청크 단위로 업로드하는 메서드입니다.
        /// </summary>
        public static async Task<string> UploadChunkFile(IBrowserFile file, string type, string container, int albumId, string azureConnection)
        {
            AzureBlobUploadHelper helper = new AzureBlobUploadHelper(azureConnection, container);

            // 1GB 예시 (필요에 따라 조절)
            using var fileStream = file.OpenReadStream(maxAllowedSize: 1024 * 1024 * 1024);

            const int chunkSize = 2 * 1024 * 1024; // 2MB
            var buffer = new byte[chunkSize];
            int bytesRead;
            int chunkIndex = 0;

            // 서버에서 청크를 구별할 임시 ID
            string fileId = Guid.NewGuid().ToString();
        
            // chunkSize 단위로 반복해서 읽어 서버에 업로드
            while ((bytesRead = await fileStream.ReadAsync(buffer, 0, chunkSize)) > 0)
            {
                var chunkData = new byte[bytesRead];
                Array.Copy(buffer, 0, chunkData, 0, bytesRead);

                await helper.UploadChunkAsyncByAlbumId(
                    albumId,
                    chunkData,
                    chunkIndex,
                    fileId
                );
                chunkIndex++;
            }


            string fileUri = await helper.MergeChunksAsync(
                albumId,
                fileId,
                file.Name
            );

            return fileUri;
        }
    }
}
