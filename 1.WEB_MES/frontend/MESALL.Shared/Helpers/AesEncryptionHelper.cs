using System.Security.Cryptography;
using System.Text;

namespace MESALL.Shared.Helpers;

public static class AesEncryptionHelper
{
    // TODO appsettings의 Encrypt 사용하기
    private static readonly string Key = "YourEncryptionKey1234567"; // 16, 24, 또는 32자로 설정해야 함
    private static readonly string IV = "YourEncryptionIV";   // 반드시 16자로 설정해야 함

    /// <summary>
    /// 문자열을 AES 암호화를 사용하여 암호화합니다.
    /// </summary>
    public static string Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(Key);
        aes.IV = Encoding.UTF8.GetBytes(IV);

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using (var writer = new StreamWriter(cs))
            {
                writer.Write(plainText);
            }
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    /// <summary>
    /// AES 암호화된 문자열을 복호화합니다.
    /// </summary>
    public static string Decrypt(string cipherText)
    {
        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(Key);
        aes.IV = Encoding.UTF8.GetBytes(IV);

        var buffer = Convert.FromBase64String(cipherText);

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream(buffer);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using (var reader = new StreamReader(cs))
        {
            return reader.ReadToEnd();
        }
    }
}