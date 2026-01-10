using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IRollRepository : IRepository<RollMaster>
    {
    }

    public class RollRepository : BaseRepository<RollMaster>, IRollRepository
    {
        public RollRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "RollMasters")
        {
        }

        protected override string GetPrimaryKeyColumn() => "RollId";

        public override async Task<int> CreateAsync(RollMaster entity)
        {
            var sql = @"
                INSERT INTO RollMasters (
                    TenantId, ItemType, ItemCode, ItemName, SupplierItemCode,
                    Mill, Quality, RollWidthMM, ThicknessMicron, Density,
                    FaceGSM, ReleaseGSM, AdhesiveGSM, TotalGSM,
                    ShelfLifeDays, PurchaseUnit, StockUnit, PurchaseRate,
                    HSNCode, Location, SupplierName,
                    IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @ItemType, @ItemCode, @ItemName, @SupplierItemCode,
                    @Mill, @Quality, @RollWidthMM, @ThicknessMicron, @Density,
                    @FaceGSM, @ReleaseGSM, @AdhesiveGSM, @TotalGSM,
                    @ShelfLifeDays, @PurchaseUnit, @StockUnit, @PurchaseRate,
                    @HSNCode, @Location, @SupplierName,
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(RollMaster entity)
        {
            var sql = @"
                UPDATE RollMasters 
                SET 
                    ItemType = @ItemType,
                    ItemCode = @ItemCode,
                    ItemName = @ItemName,
                    SupplierItemCode = @SupplierItemCode,
                    Mill = @Mill,
                    Quality = @Quality,
                    RollWidthMM = @RollWidthMM,
                    ThicknessMicron = @ThicknessMicron,
                    Density = @Density,
                    FaceGSM = @FaceGSM,
                    ReleaseGSM = @ReleaseGSM,
                    AdhesiveGSM = @AdhesiveGSM,
                    TotalGSM = @TotalGSM,
                    ShelfLifeDays = @ShelfLifeDays,
                    PurchaseUnit = @PurchaseUnit,
                    StockUnit = @StockUnit,
                    PurchaseRate = @PurchaseRate,
                    HSNCode = @HSNCode,
                    Location = @Location,
                    SupplierName = @SupplierName,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE RollId = @RollId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
