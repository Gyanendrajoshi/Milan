using Dapper;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IProcessRepository : IRepository<ProcessMaster>
    {
        Task<string> GetNextCodeAsync();
    }



    public class ProcessRepository : BaseRepository<ProcessMaster>, IProcessRepository
    {
        public ProcessRepository(IDbConnectionFactory connectionFactory, IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "ProcessMasters")
        {
        }

        protected override string GetPrimaryKeyColumn() => "Id";

        public override async Task<int> CreateAsync(ProcessMaster entity)
        {
            var sql = @"
                INSERT INTO ProcessMasters (
                    TenantId, Name, Code, ChargeType, IsUnitConversion, Rate, FormulaParams, CreatedAt, UpdatedAt, IsActive, IsDeleted
                ) VALUES (
                    @TenantId, @Name, @Code, @ChargeType, @IsUnitConversion, @Rate, @FormulaParams, GETDATE(), GETDATE(), @IsActive, @IsDeleted
                );
                SELECT CAST(SCOPE_IDENTITY() as int)";
            
            entity.TenantId = GetTenantId();
            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(ProcessMaster entity)
        {
            var sql = @"
                UPDATE ProcessMasters 
                SET Name = @Name,
                    Code = @Code,
                    ChargeType = @ChargeType,
                    IsUnitConversion = @IsUnitConversion,
                    Rate = @Rate,
                    FormulaParams = @FormulaParams,
                    UpdatedAt = GETDATE(),
                    IsActive = @IsActive
                WHERE Id = @Id AND TenantId = @TenantId";
                
            entity.TenantId = GetTenantId();
            // Removed duplicate assignment
            Console.WriteLine($"[Repo] Executing Update SQL for ID: {entity.Id}, Tenant: {entity.TenantId}, Code: {entity.Code}");
            var rows = await ExecuteAsync(sql, entity);
            Console.WriteLine($"[Repo] Rows affected: {(rows ? 1 : 0)}");
            return rows;
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var sql = @"
                UPDATE ProcessMasters 
                SET IsDeleted = 1, 
                    UpdatedAt = GETDATE()
                WHERE Id = @Id AND TenantId = @TenantId";
                
            return await ExecuteAsync(sql, new { Id = id });
        }

        public override async Task<IEnumerable<ProcessMaster>> GetAllAsync()
        {
            var sql = @"
                SELECT * FROM ProcessMasters 
                WHERE IsDeleted = 0 AND TenantId = @TenantId
                ORDER BY CreatedAt DESC";
                
            return await QueryAsync(sql);
        }

        public async Task<string> GetNextCodeAsync()
        {
            var sql = @"
                SELECT TOP 1 Code 
                FROM ProcessMasters 
                WHERE TenantId = @TenantId AND Code LIKE 'PM%'
                ORDER BY Id DESC";
            
            var tenantId = GetTenantId();
            using var connection = await _connectionFactory.CreateConnectionAsync();
            var lastCode = await connection.QueryFirstOrDefaultAsync<string>(sql, new { TenantId = tenantId });

            if (string.IsNullOrEmpty(lastCode))
            {
                return "PM00001";
            }

            if (lastCode.Length > 2 && int.TryParse(lastCode.Substring(2), out int number))
            {
                return $"PM{(number + 1):D5}";
            }

            return "PM00001"; // Fallback if format is weird
        }
    }
}
