using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IToolRepository : IRepository<ToolMaster>
    {
    }

    public class ToolRepository : BaseRepository<ToolMaster>, IToolRepository
    {
        public ToolRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "ToolMasters")
        {
        }

        protected override string GetPrimaryKeyColumn() => "ToolId";

        public override async Task<int> CreateAsync(ToolMaster entity)
        {
            var sql = @"
                INSERT INTO ToolMasters (
                    TenantId, ToolPrefix, ToolNo, ItemCode, ToolName, ToolRefCode,
                    Location, Cabinet, Shelf, Bin, ToolType, MachineName,
                    CylinderType, Make, PrintType, Category, SupplierName, PurchaseDate,
                    Status, Remark, UsageCount, Size, Width, Height, Thickness, Unit,
                    DrawingNo, RevNo, NoOfTeeth, CircumferenceMM, CircumferenceInch,
                    HSNCode, PurchaseUnit, PurchaseRate, ColorDetails, Plates,
                    LPI, BCM, JobSize, AcrossUps, AroundUps, AcrossGap, AroundGap,
                    JobCode, JobName, ToolDescription,
                    IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @ToolPrefix, @ToolNo, @ItemCode, @ToolName, @ToolRefCode,
                    @Location, @Cabinet, @Shelf, @Bin, @ToolType, @MachineName,
                    @CylinderType, @Make, @PrintType, @Category, @SupplierName, @PurchaseDate,
                    @Status, @Remark, @UsageCount, @Size, @Width, @Height, @Thickness, @Unit,
                    @DrawingNo, @RevNo, @NoOfTeeth, @CircumferenceMM, @CircumferenceInch,
                    @HSNCode, @PurchaseUnit, @PurchaseRate, @ColorDetails, @Plates,
                    @LPI, @BCM, @JobSize, @AcrossUps, @AroundUps, @AcrossGap, @AroundGap,
                    @JobCode, @JobName, @ToolDescription,
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(ToolMaster entity)
        {
            var sql = @"
                UPDATE ToolMasters 
                SET 
                    ToolPrefix = @ToolPrefix,
                    ToolNo = @ToolNo,
                    ItemCode = @ItemCode,
                    ToolName = @ToolName,
                    ToolRefCode = @ToolRefCode,
                    Location = @Location,
                    Cabinet = @Cabinet,
                    Shelf = @Shelf,
                    Bin = @Bin,
                    ToolType = @ToolType,
                    MachineName = @MachineName,
                    CylinderType = @CylinderType,
                    Make = @Make,
                    PrintType = @PrintType,
                    Category = @Category,
                    SupplierName = @SupplierName,
                    PurchaseDate = @PurchaseDate,
                    Status = @Status,
                    Remark = @Remark,
                    UsageCount = @UsageCount,
                    Size = @Size,
                    Width = @Width,
                    Height = @Height,
                    Thickness = @Thickness,
                    Unit = @Unit,
                    DrawingNo = @DrawingNo,
                    RevNo = @RevNo,
                    NoOfTeeth = @NoOfTeeth,
                    CircumferenceMM = @CircumferenceMM,
                    CircumferenceInch = @CircumferenceInch,
                    HSNCode = @HSNCode,
                    PurchaseUnit = @PurchaseUnit,
                    PurchaseRate = @PurchaseRate,
                    ColorDetails = @ColorDetails,
                    Plates = @Plates,
                    LPI = @LPI,
                    BCM = @BCM,
                    JobSize = @JobSize,
                    AcrossUps = @AcrossUps,
                    AroundUps = @AroundUps,
                    AcrossGap = @AcrossGap,
                    AroundGap = @AroundGap,
                    JobCode = @JobCode,
                    JobName = @JobName,
                    ToolDescription = @ToolDescription,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE ToolId = @ToolId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
