using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class AuthenticationService(
        IDatabaseAccesser db,
        AuthenticationStateProvider _authenticationStateProvider,
        string procedure = "[dbo].[UsersProcedure]"
        ) : IAuthenticationService
    {
        public async Task<bool> Login(string username, string password)
        {
            LoginModel loginModel= new LoginModel()
            {
                Username = username,
                PasswordHash = password,
            };

            SqlParameter[] parameters1 = new SqlParameter[3];
            parameters1[0] = new SqlParameter("@CRUD", "R10");
            parameters1[1] = new SqlParameter("@Username", loginModel.Username);
            parameters1[2] = new SqlParameter("@PasswordHash", loginModel.PasswordHash);
            
            bool isLogin = await db.CheckDataExists(procedure, parameters1);

            // TODO PasswordHash 한번만 보내게 변경
            SqlParameter[] parameters2 = new SqlParameter[3];
            parameters2[0] = new SqlParameter("@CRUD", "R10");
            parameters2[1] = new SqlParameter("@Username", loginModel.Username);
            parameters2[2] = new SqlParameter("@PasswordHash", loginModel.PasswordHash);
            
            if (isLogin)
            {
                List<UserModel> userModels = await db.FindData(procedure, parameters2, reader => new UserModel()
                {
                    UserId = (Int32)reader["UserId"],
                    Username = (String)reader["Username"],
                    Email = (String)reader["Email"],
                    CreatedAt = (DateTime)reader["CreatedAt"],
                    LastLoginAt = (DateTime)reader["LastLoginAt"],
                    Authority = (String)reader["Authority"],
                    Name = (String)reader["Name"],
                });
            
                UserModel userModel = userModels.FirstOrDefault()!;

                ((CustomAuthenticationStateProvider)_authenticationStateProvider).MarkUserAsAuthenticated(userModel);
            }

            return isLogin;
        }

        public async Task Logout()
        {
            ((CustomAuthenticationStateProvider)_authenticationStateProvider).MarkUserAsLoggedOut();
        }
    }
}
