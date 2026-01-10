using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IHSNRepository : IRepository<HSNMaster>
    {
    }

    public class HSNRepository : BaseRepository<HSNMaster>, IHSNRepository
    {
        public HSNRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "HSNMasters")
        {
        }

        protected override string GetPrimaryKeyColumn() => "HSNId";

        public override async Task<int> CreateAsync(HSNMaster entity)
        {
            var sql = @"
                INSERT INTO HSNMasters (
                    TenantId, Name, HSNCode, GSTPercentage, 
                    IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @Name, @HSNCode, @GSTPercentage, 
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(HSNMaster entity)
        {
            var sql = @"
                UPDATE HSNMasters 
                SET 
                    Name = @Name,
                    HSNCode = @HSNCode,
                    GSTPercentage = @GSTPercentage,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE HSNId = @HSNId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
