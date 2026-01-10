using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface ISupplierRepository : IRepository<Supplier>
    {
    }

    public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
    {
        public SupplierRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Suppliers")
        {
        }

        protected override string GetPrimaryKeyColumn() => "SupplierId";

        public override async Task<int> CreateAsync(Supplier entity)
        {
            var sql = @"
                INSERT INTO Suppliers (
                    TenantId, SupplierName, Address, MobileNumber, Email, 
                    GSTNumber, ExcessQuantityTolerance, State, Country, 
                    IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @SupplierName, @Address, @MobileNumber, @Email, 
                    @GSTNumber, @ExcessQuantityTolerance, @State, @Country, 
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(Supplier entity)
        {
            var sql = @"
                UPDATE Suppliers 
                SET 
                    SupplierName = @SupplierName,
                    Address = @Address,
                    MobileNumber = @MobileNumber,
                    Email = @Email,
                    GSTNumber = @GSTNumber,
                    ExcessQuantityTolerance = @ExcessQuantityTolerance,
                    State = @State,
                    Country = @Country,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE SupplierId = @SupplierId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
