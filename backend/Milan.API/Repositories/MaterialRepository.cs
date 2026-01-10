using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IMaterialRepository : IRepository<Material>
    {
    }

    public class MaterialRepository : BaseRepository<Material>, IMaterialRepository
    {
        public MaterialRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Materials")
        {
        }

        protected override string GetPrimaryKeyColumn() => "MaterialId";

        public override async Task<int> CreateAsync(Material entity)
        {
            var sql = @"
                INSERT INTO Materials (
                    TenantId, ItemCode, ItemName, ShelfLifeDays, ItemGroup, 
                    PurchaseUnit, PurchaseRate, HSNCode, GSM, WidthMm,
                    IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @ItemCode, @ItemName, @ShelfLifeDays, @ItemGroup, 
                    @PurchaseUnit, @PurchaseRate, @HSNCode, @GSM, @WidthMm,
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(Material entity)
        {
            var sql = @"
                UPDATE Materials 
                SET 
                    ItemCode = @ItemCode,
                    ItemName = @ItemName,
                    ShelfLifeDays = @ShelfLifeDays,
                    ItemGroup = @ItemGroup,
                    PurchaseUnit = @PurchaseUnit,
                    PurchaseRate = @PurchaseRate,
                    HSNCode = @HSNCode,
                    GSM = @GSM,
                    WidthMm = @WidthMm,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE MaterialId = @MaterialId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
