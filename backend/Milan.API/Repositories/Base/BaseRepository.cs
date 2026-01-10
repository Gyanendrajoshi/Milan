using Dapper;
using Milan.API.Infrastructure.Database;
using System.Data;

namespace Milan.API.Repositories.Base
{
    public abstract class BaseRepository<T> : IRepository<T> where T : class
    {
        protected readonly IDbConnectionFactory _connectionFactory;
        protected readonly IHttpContextAccessor _httpContextAccessor;
        protected readonly string _tableName;

        protected BaseRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor,
            string tableName)
        {
            _connectionFactory = connectionFactory;
            _httpContextAccessor = httpContextAccessor;
            _tableName = tableName;
        }

        protected int GetTenantId()
        {
            var context = _httpContextAccessor.HttpContext;
            // TODO: Ensure header middleware populates this
            if (context?.Items["TenantId"] is int tenantId)
            {
                return tenantId;
            }
            
            // Temporary default for development
            return 1;
        }

        protected async Task<IEnumerable<T>> QueryAsync(string sql, object? param = null)
        {
            var tenantId = GetTenantId();
            var parameters = new DynamicParameters(param);
            parameters.Add("TenantId", tenantId);

            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<T>(sql, parameters);
        }

        protected async Task<T?> QueryFirstOrDefaultAsync(string sql, object? param = null)
        {
            var tenantId = GetTenantId();
            var parameters = new DynamicParameters(param);
            parameters.Add("TenantId", tenantId);

            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<T>(sql, parameters);
        }

        protected async Task<int> ExecuteScalarAsync(string sql, object? param = null)
        {
            var tenantId = GetTenantId();
            var parameters = new DynamicParameters(param);
            parameters.Add("TenantId", tenantId);

            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<int>(sql, parameters);
        }

        protected async Task<bool> ExecuteAsync(string sql, object? param = null)
        {
            var tenantId = GetTenantId();
            var parameters = new DynamicParameters(param);
            parameters.Add("TenantId", tenantId);

            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.ExecuteAsync(sql, parameters) > 0;
        }

        protected abstract string GetPrimaryKeyColumn();

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            var sql = $"SELECT * FROM {_tableName} WHERE TenantId = @TenantId";
            return await QueryAsync(sql);
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var sql = $"SELECT * FROM {_tableName} WHERE {GetPrimaryKeyColumn()} = @Id AND TenantId = @TenantId";
            return await QueryFirstOrDefaultAsync(sql, new { Id = id });
        }

        public virtual async Task<bool> DeleteAsync(int id)
        {
            var sql = $"DELETE FROM {_tableName} WHERE {GetPrimaryKeyColumn()} = @Id AND TenantId = @TenantId";
            return await ExecuteAsync(sql, new { Id = id });
        }

        public abstract Task<int> CreateAsync(T entity);
        public abstract Task<bool> UpdateAsync(T entity);
    }
}
