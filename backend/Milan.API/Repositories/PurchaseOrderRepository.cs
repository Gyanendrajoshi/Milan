using Dapper;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;
using System.Data;

namespace Milan.API.Repositories
{
    public interface IPurchaseOrderRepository : IRepository<PurchaseOrder>
    {
        Task<PurchaseOrder?> GetWithItemsAsync(int id);
        Task<string> GetNextPONumberAsync();
    }

    public class PurchaseOrderRepository : BaseRepository<PurchaseOrder>, IPurchaseOrderRepository
    {
        public PurchaseOrderRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "PurchaseOrders")
        {
        }

        protected override string GetPrimaryKeyColumn() => "POId";

        public override async Task<IEnumerable<PurchaseOrder>> GetAllAsync()
        {
            var tenantId = GetTenantId();
            var sql = @"
                SELECT po.*, s.SupplierName
                FROM PurchaseOrders po
                LEFT JOIN Suppliers s ON po.SupplierId = s.SupplierId
                WHERE po.TenantId = @TenantId
                ORDER BY po.POId DESC";

            // Dapper will automatically map 'SupplierName' column to PurchaseOrder.SupplierName property
            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<PurchaseOrder>(sql, new { TenantId = tenantId });
        }

        public override async Task<int> CreateAsync(PurchaseOrder entity)
        {
            var tenantId = GetTenantId();
            var sqlHeader = @"
                INSERT INTO PurchaseOrders (
                    TenantId, PONumber, PODate, SupplierId, Status, Remarks,
                    OtherCharges, OtherChargeDescription, GrandBasic, GrandTax, GrandTotal,
                    IsActive, CreatedAt, UpdatedAt
                ) VALUES (
                    @TenantId, @PONumber, @PODate, @SupplierId, @Status, @Remarks,
                    @OtherCharges, @OtherChargeDescription, @GrandBasic, @GrandTax, @GrandTotal,
                    @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            var sqlItem = @"
                INSERT INTO PurchaseOrderItems (
                    TenantId, POId, ItemType, ItemId, ItemCode, ItemName,
                    RollWidthMM, RollTotalGSM, QtyKg, QtySqMtr, QtyRunMtr, QtyUnit,
                    ReqDate, Rate, RateType, BasicAmount, TaxAmount,
                    CGST, SGST, IGST, TotalAmount, HSNCode, GSTPercent, Remark,
                    IsActive, CreatedAt, UpdatedAt
                ) VALUES (
                    @TenantId, @POId, @ItemType, @ItemId, @ItemCode, @ItemName,
                    @RollWidthMM, @RollTotalGSM, @QtyKg, @QtySqMtr, @QtyRunMtr, @QtyUnit,
                    @ReqDate, @Rate, @RateType, @BasicAmount, @TaxAmount,
                    @CGST, @SGST, @IGST, @TotalAmount, @HSNCode, @GSTPercent, @Remark,
                    @IsActive, GETDATE(), GETDATE()
                );";

            using var connection = await _connectionFactory.CreateConnectionAsync();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Create Header
                entity.TenantId = tenantId;
                // ExecuteScalarAsync is Dapper extension, needs connection
                var poId = await connection.ExecuteScalarAsync<int>(sqlHeader, entity, transaction);

                // 2. Create Items
                if (entity.Items != null && entity.Items.Count > 0)
                {
                    foreach (var item in entity.Items)
                    {
                        item.TenantId = tenantId;
                        item.POId = poId;
                        item.IsActive = true;
                    }
                    await connection.ExecuteAsync(sqlItem, entity.Items, transaction);
                }

                transaction.Commit();
                return poId;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<PurchaseOrder?> GetWithItemsAsync(int id)
        {
            var tenantId = GetTenantId();
            var sql = @"
                SELECT * FROM PurchaseOrders WHERE POId = @POId AND TenantId = @TenantId;
                SELECT * FROM PurchaseOrderItems WHERE POId = @POId AND TenantId = @TenantId;";

            using var connection = await _connectionFactory.CreateConnectionAsync();
            using var multi = await connection.QueryMultipleAsync(sql, new { POId = id, TenantId = tenantId });
            
            var po = await multi.ReadFirstOrDefaultAsync<PurchaseOrder>();
            if (po != null)
            {
                var items = await multi.ReadAsync<PurchaseOrderItem>();
                po.Items = items.AsList();
            }
            return po;
        }

        public override async Task<bool> UpdateAsync(PurchaseOrder entity)
        {
             var sql = @"
                UPDATE PurchaseOrders 
                SET 
                    PONumber = @PONumber,
                    PODate = @PODate,
                    SupplierId = @SupplierId,
                    Status = @Status,
                    Remarks = @Remarks,
                    OtherCharges = @OtherCharges,
                    OtherChargeDescription = @OtherChargeDescription,
                    GrandBasic = @GrandBasic,
                    GrandTax = @GrandTax,
                    GrandTotal = @GrandTotal,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE POId = @POId AND TenantId = @TenantId";
            
            // Re-assign tenantId to ensure security
            entity.TenantId = GetTenantId();
            return await ExecuteAsync(sql, entity);
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var tenantId = GetTenantId();
            var sqlItems = "DELETE FROM PurchaseOrderItems WHERE POId = @POId AND TenantId = @TenantId";
            var sqlHeader = "DELETE FROM PurchaseOrders WHERE POId = @POId AND TenantId = @TenantId";

            using var connection = await _connectionFactory.CreateConnectionAsync();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Delete Items first
                await connection.ExecuteAsync(sqlItems, new { POId = id, TenantId = tenantId }, transaction);
                
                // Delete Header
                var rows = await connection.ExecuteAsync(sqlHeader, new { POId = id, TenantId = tenantId }, transaction);

                transaction.Commit();
                return rows > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        public async Task<string> GetNextPONumberAsync()
        {
            var tenantId = GetTenantId();
            // Format: PO{SEQ(5)}-{YY} e.g. PO00001-24
            // We need to find the latest number for current year or overall?
            // Let's stick to simple auto-increment logic based on string parsing or just a Count+1 for now?
            // Robust way: Parse Max PONumber. 
            // Warning: String max is tricky. 
            // Let's assume user wants sequential. I'll get the count for now or try to parse max ID.
            
            var sql = "SELECT TOP 1 PONumber FROM PurchaseOrders WHERE TenantId = @TenantId ORDER BY POId DESC";
            using var connection = await _connectionFactory.CreateConnectionAsync();
            var lastPO = await connection.ExecuteScalarAsync<string>(sql, new { TenantId = tenantId });

            int nextSeq = 1;
            int year = DateTime.Now.Year % 100;

            if (!string.IsNullOrEmpty(lastPO))
            {
                // Expected format PO00001-24
                var parts = lastPO.Split('-');
                if (parts.Length == 2 && parts[0].StartsWith("PO"))
                {
                    if (int.TryParse(parts[0].Substring(2), out int currentSeq))
                    {
                        nextSeq = currentSeq + 1;
                    }
                }
            }

            return $"PO{nextSeq.ToString("D5")}-{year}";
        }
    }
}
