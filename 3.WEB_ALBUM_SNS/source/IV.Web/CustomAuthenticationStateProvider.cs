using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using IV.Shared.Model;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;

namespace IV.Web;

public class CustomAuthenticationStateProvider(
        ProtectedLocalStorage protectedLocalStorage
        ) : AuthenticationStateProvider
    {
        private ClaimsPrincipal _currentUser = new ClaimsPrincipal(new ClaimsIdentity()); // 기본값: 익명 사용자

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity());

            try
            {
                // Retrieve and decrypt identity from local storage
                var storedPrincipal = await protectedLocalStorage.GetAsync<string>("identity");
                if (storedPrincipal.Success && !string.IsNullOrWhiteSpace(storedPrincipal.Value))
                {
                    // Use a try-catch block to handle deserialization errors
                    UserModel? user = JsonSerializer.Deserialize<UserModel>(storedPrincipal.Value);
                    if (user != null)
                    {
                        ClaimsIdentity identity = CreateIdentityFromUser(user);
                        principal = new ClaimsPrincipal(identity);
                    }
                }
            }
            catch (CryptographicException)
            {
                // Handle cryptographic exception (e.g. invalid or tampered data)
                Console.WriteLine("Decryption failed – clearing invalid data...");
                await protectedLocalStorage.DeleteAsync("identity");
            }
            catch (JsonException ex)
            {
                // Handle JSON deserialization errors
                Console.WriteLine($"Deserialization failed: {ex.Message}");
                await protectedLocalStorage.DeleteAsync("identity");
            }

            _currentUser = principal;
            return new AuthenticationState(_currentUser);
        }

        public async void MarkUserAsAuthenticated(UserModel user)
        {
            ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity());
            ClaimsIdentity identity = CreateIdentityFromUser(user);
            principal = new ClaimsPrincipal(identity);

            try
            {
                // Store the serialized user data
                await protectedLocalStorage.SetAsync("identity", JsonSerializer.Serialize(user));
                _currentUser = principal;

                // Notify authentication state changes
                NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to save user data: {ex.Message}");
            }
        }

        public async void MarkUserAsLoggedOut()
        {
            await protectedLocalStorage.DeleteAsync("identity");
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }

        private static ClaimsIdentity CreateIdentityFromUser(UserModel user)
        {
            return new ClaimsIdentity(new Claim[]
            {
                new (ClaimTypes.Sid, user.UserId.ToString()),
                new (ClaimTypes.Email, user.Email),
                new (ClaimTypes.Name, user.Username),
            }, "IV");
        }
    }