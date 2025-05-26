using System.Data;
using System.Dynamic;
using Microsoft.Data.SqlClient;

namespace SchemaLens
{
    public class DatabaseAccesser(IConfiguration configuration) : IDatabaseAccesser
    {
        public SqlConnection connection { get; } = new SqlConnection(configuration.GetConnectionString("Default"));

        public async Task<List<T>> FindData<T>(string procedure, SqlParameter[] parameters, Func<SqlDataReader, T> map)
        {
            try
            {
                List<T> result = new List<T>();

                // 요청마다 새 SqlConnection을 생성 (ADO.NET의 Connection Pooling 덕에 웬만한 순간적으로 많은 요청에도 안전)
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        foreach (SqlParameter prameter in parameters)
                        {
                            command.Parameters.Add(prameter);
                        }

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(map(reader)); // 데이터 읽고 변환하여 리스트에 추가
                            }
                        }

                        return result;
                    }   
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }

        }

        public async Task SaveData(string procedure, SqlParameter[] parameters)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        foreach (SqlParameter prameter in parameters)
                        {
                            command.Parameters.Add(prameter);
                        }

                        await command.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public async Task UpdateData(string procedure, SqlParameter[] parameters)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        foreach (SqlParameter prameter in parameters)
                        {
                            command.Parameters.Add(prameter);
                        }

                        await command.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public async Task DestroyData(string procedure, SqlParameter[] parameters)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        foreach (SqlParameter prameter in parameters)
                        {
                            command.Parameters.Add(prameter);
                        }

                        await command.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public async Task<IEnumerable<dynamic>> QueryForDynamic(string queryString)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(queryString, connection))
                    {
                        SqlDataReader reader = await command.ExecuteReaderAsync();
                        List<dynamic> results = new List<dynamic>();

                        while (await reader.ReadAsync())
                        {
                            var expando = new ExpandoObject() as IDictionary<string, object>;
                            for (int i = 0; i < reader.FieldCount; i++)
                            {
                                expando[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                            }
                            results.Add(expando);
                        }

                        return results;
                    }
                }

            } catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }
        }

        public async Task<bool> CheckDataExists(string procedure, SqlParameter[] parameters)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(configuration.GetConnectionString("Default")))
                {
                    await connection.OpenAsync();
                    using (SqlCommand command = new SqlCommand(procedure, connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        foreach (SqlParameter parameter in parameters)
                        {
                            command.Parameters.Add(parameter);
                        }

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            return await reader.ReadAsync(); // 결과값이 있으면 true, 없으면 false
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
            finally
            {
                connection.Close();
            }
        }
    }
}
