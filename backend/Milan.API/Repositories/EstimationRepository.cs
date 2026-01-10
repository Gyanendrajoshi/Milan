using Dapper;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;
using System.Data;
using System.Data.SqlClient;

namespace Milan.API.Repositories
{
    public interface IEstimationRepository : IRepository<Estimation>
    {
        Task<int> CreateFullAsync(Estimation estimation);
        Task UpdateFullAsync(Estimation estimation);
        Task<IEnumerable<Estimation>> GetAllFullAsync();
        Task<Estimation?> GetByIdFullAsync(int id);
        Task<string> GenerateNextJobCardNoAsync();
    }

    public class EstimationRepository : BaseRepository<Estimation>, IEstimationRepository
    {
        public EstimationRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Estimations")
        {
        }

        protected override string GetPrimaryKeyColumn() => "Id";

        // Implement Abstract Base Methods by redirecting to Full methods
        public override async Task<int> CreateAsync(Estimation entity)
        {
            return await CreateFullAsync(entity);
        }

        public override async Task<bool> UpdateAsync(Estimation entity)
        {
            await UpdateFullAsync(entity);
            return true;
        }

        public async Task<int> CreateFullAsync(Estimation estimation)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            connection.Open(); // Standard IDbConnection might need Open, or Factory returns open. Usually Factory returns open, but Open() is safe.
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Insert Header
                Console.WriteLine($"[Repository] Inserting Estimation. JobCardNo: '{estimation.JobCardNo}'");
                var sqlHeader = @"
                    INSERT INTO Estimations (
                        TenantId, JobCardNo, Date, ClientId, JobName, JobPriority, JobType, Status,
                        OrderQty, CategoryId, PoNumber, DeliveryDate, SalesPerson,
                        TotalJobCost, FinalPriceWithGST, UnitCost, FinalSalesPrice, TotalOrderValue,
                        CreatedAt, UpdatedAt, IsActive, IsDeleted
                    ) 
                    VALUES (
                        @TenantId, @JobCardNo, @Date, @ClientId, @JobName, @JobPriority, @JobType, @Status,
                        @OrderQty, @CategoryId, @PoNumber, @DeliveryDate, @SalesPerson,
                        @TotalJobCost, @FinalPriceWithGST, @UnitCost, @FinalSalesPrice, @TotalOrderValue,
                        GETDATE(), GETDATE(), @IsActive, @IsDeleted
                    );
                    SELECT CAST(SCOPE_IDENTITY() as int);";

                var estimationId = await connection.ExecuteScalarAsync<int>(sqlHeader, estimation, transaction);

                // 2. Insert Details & Costs
                foreach (var detail in estimation.details)
                {
                    detail.EstimationId = estimationId;
                    
                    var sqlDetail = @"
                        INSERT INTO EstimationDetails (
                            EstimationId, ContentName, MachineName,
                            JobWidthMM, JobHeightMM, ColorsFront, ColorsBack, UpsAcross, UpsAround, TotalUps,
                            ToolId, ToolTeeth, ToolCircumferenceMM, ToolCircumferenceInch,
                            DieId, RollId, RollWidthMM, RollTotalGSM,
                            BaseRunningMtr, BaseSqMtr, BaseKg,
                            WastagePercent, WastageRM,
                            TotalRunningMtr, TotalSqMtr, TotalKg,
                            MaterialRate, MaterialCostAmount,
                            AdditionalCostPercent, AdditionalCostAmount,
                            TotalJobCost, TotalOrderValue
                        )
                        VALUES (
                            @EstimationId, @ContentName, @MachineName,
                            @JobWidthMM, @JobHeightMM, @ColorsFront, @ColorsBack, @UpsAcross, @UpsAround, @TotalUps,
                            @ToolId, @ToolTeeth, @ToolCircumferenceMM, @ToolCircumferenceInch,
                            @DieId, @RollId, @RollWidthMM, @RollTotalGSM,
                            @BaseRunningMtr, @BaseSqMtr, @BaseKg,
                            @WastagePercent, @WastageRM,
                            @TotalRunningMtr, @TotalSqMtr, @TotalKg,
                            @MaterialRate, @MaterialCostAmount,
                            @AdditionalCostPercent, @AdditionalCostAmount,
                            @TotalJobCost, @TotalOrderValue
                        );
                        SELECT CAST(SCOPE_IDENTITY() as int);";

                    var detailId = await connection.ExecuteScalarAsync<int>(sqlDetail, detail, transaction);

                    // 3. Insert Process Costs
                    if (detail.ProcessCosts != null && detail.ProcessCosts.Any())
                    {
                        foreach (var cost in detail.ProcessCosts)
                        {
                            cost.EstimationDetailId = detailId;
                        }

                        var sqlCost = @"
                            INSERT INTO EstimationProcessCosts (
                                EstimationDetailId, ProcessId, RateType,
                                Quantity, Rate, Amount, IsManualQuantity, IsManualRate,
                                BaseRate, ExtraColorRate, BackPrintingRate, DebugInfo
                            )
                            VALUES (
                                @EstimationDetailId, @ProcessId, @RateType,
                                @Quantity, @Rate, @Amount, @IsManualQuantity, @IsManualRate,
                                @BaseRate, @ExtraColorRate, @BackPrintingRate, @DebugInfo
                            )";
                        
                        await connection.ExecuteAsync(sqlCost, detail.ProcessCosts, transaction);
                    }
                }

                transaction.Commit();
                return estimationId;
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task UpdateFullAsync(Estimation estimation)
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            connection.Open();
            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Update Header
                var sqlHeader = @"
                    UPDATE Estimations SET
                        JobCardNo = @JobCardNo,
                        Date = @Date,
                        ClientId = @ClientId,
                        JobName = @JobName,
                        JobPriority = @JobPriority,
                        JobType = @JobType,
                        Status = @Status,
                        OrderQty = @OrderQty,
                        CategoryId = @CategoryId,
                        PoNumber = @PoNumber,
                        DeliveryDate = @DeliveryDate,
                        SalesPerson = @SalesPerson,
                        TotalJobCost = @TotalJobCost,
                        FinalPriceWithGST = @FinalPriceWithGST,
                        UnitCost = @UnitCost,
                        FinalSalesPrice = @FinalSalesPrice,
                        TotalOrderValue = @TotalOrderValue,
                        UpdatedAt = GETDATE()
                    WHERE Id = @Id
                ";
                await connection.ExecuteAsync(sqlHeader, estimation, transaction);

                // 2. Clear Old Details
                var sqlDeleteDetails = "DELETE FROM EstimationDetails WHERE EstimationId = @Id";
                await connection.ExecuteAsync(sqlDeleteDetails, new { estimation.Id }, transaction);

                // 3. Re-Insert Details
                foreach (var detail in estimation.details)
                {
                    detail.EstimationId = estimation.Id;

                    var sqlDetail = @"
                        INSERT INTO EstimationDetails (
                            EstimationId, ContentName, MachineName,
                            JobWidthMM, JobHeightMM, ColorsFront, ColorsBack, UpsAcross, UpsAround, TotalUps,
                            ToolId, ToolTeeth, ToolCircumferenceMM, ToolCircumferenceInch,
                            DieId, RollId, RollWidthMM, RollTotalGSM,
                            BaseRunningMtr, BaseSqMtr, BaseKg,
                            WastagePercent, WastageRM,
                            TotalRunningMtr, TotalSqMtr, TotalKg,
                            MaterialRate, MaterialCostAmount,
                            AdditionalCostPercent, AdditionalCostAmount,
                            TotalJobCost, TotalOrderValue
                        )
                        VALUES (
                            @EstimationId, @ContentName, @MachineName,
                            @JobWidthMM, @JobHeightMM, @ColorsFront, @ColorsBack, @UpsAcross, @UpsAround, @TotalUps,
                            @ToolId, @ToolTeeth, @ToolCircumferenceMM, @ToolCircumferenceInch,
                            @DieId, @RollId, @RollWidthMM, @RollTotalGSM,
                            @BaseRunningMtr, @BaseSqMtr, @BaseKg,
                            @WastagePercent, @WastageRM,
                            @TotalRunningMtr, @TotalSqMtr, @TotalKg,
                            @MaterialRate, @MaterialCostAmount,
                            @AdditionalCostPercent, @AdditionalCostAmount,
                            @TotalJobCost, @TotalOrderValue
                        );
                        SELECT CAST(SCOPE_IDENTITY() as int);";

                    var detailId = await connection.ExecuteScalarAsync<int>(sqlDetail, detail, transaction);

                    // 4. Re-Insert Process Costs
                    if (detail.ProcessCosts != null && detail.ProcessCosts.Any())
                    {
                        foreach (var cost in detail.ProcessCosts)
                        {
                            cost.EstimationDetailId = detailId;
                        }

                        var sqlCost = @"
                            INSERT INTO EstimationProcessCosts (
                                EstimationDetailId, ProcessId, RateType,
                                Quantity, Rate, Amount, IsManualQuantity, IsManualRate,
                                BaseRate, ExtraColorRate, BackPrintingRate, DebugInfo
                            )
                            VALUES (
                                @EstimationDetailId, @ProcessId, @RateType,
                                @Quantity, @Rate, @Amount, @IsManualQuantity, @IsManualRate,
                                @BaseRate, @ExtraColorRate, @BackPrintingRate, @DebugInfo
                            )";
                        
                        await connection.ExecuteAsync(sqlCost, detail.ProcessCosts, transaction);
                    }
                }

                transaction.Commit();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<IEnumerable<Estimation>> GetAllFullAsync()
        {
            var sql = @"
                SELECT e.*, c.ClientName as ClientName 
                FROM Estimations e
                LEFT JOIN Clients c ON e.ClientId = c.ClientId
                WHERE e.IsDeleted = 0 
                ORDER BY e.CreatedAt DESC";
            return await QueryAsync(sql);
        }

        public async Task<Estimation?> GetByIdFullAsync(int id)
        {
            var sql = @"
                SELECT e.*, c.ClientName as ClientName 
                FROM Estimations e
                LEFT JOIN Clients c ON e.ClientId = c.ClientId
                WHERE e.Id = @Id;

                SELECT * FROM EstimationDetails WHERE EstimationId = @Id;
                SELECT pc.* 
                FROM EstimationProcessCosts pc
                JOIN EstimationDetails ed ON pc.EstimationDetailId = ed.Id
                WHERE ed.EstimationId = @Id;
            ";

            using var connection = await _connectionFactory.CreateConnectionAsync();
            using var multi = await connection.QueryMultipleAsync(sql, new { Id = id });

            var estimation = await multi.ReadSingleOrDefaultAsync<Estimation>();
            if (estimation == null) return null;

            var details = (await multi.ReadAsync<EstimationDetail>()).ToList();
            var costs = (await multi.ReadAsync<EstimationProcessCost>()).ToList();

            foreach (var detail in details)
            {
                detail.ProcessCosts = costs.Where(c => c.EstimationDetailId == detail.Id).ToList();
                estimation.details.Add(detail);
            }

            return estimation;
        }

        public override async Task<bool> DeleteAsync(int id)
        {
             using var connection = await _connectionFactory.CreateConnectionAsync();
             connection.Open();
             var sql = "DELETE FROM Estimations WHERE Id = @Id";
             return await connection.ExecuteAsync(sql, new { Id = id }) > 0;
        }

        public async Task<string> GenerateNextJobCardNoAsync()
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            // Get the last JobCardNo
            var sql = "SELECT TOP 1 JobCardNo FROM Estimations ORDER BY Id DESC";
            var lastJc = await connection.QueryFirstOrDefaultAsync<string>(sql);
            Console.WriteLine($"[GenerateNextJobCardNoAsync] Last JobCardNo found: '{lastJc}'");

            int nextNum = 1;
            string finYear = DateTime.Now.Month >= 4 
                ? $"{DateTime.Now.Year % 100}-{(DateTime.Now.Year + 1) % 100}" 
                : $"{(DateTime.Now.Year - 1) % 100}-{DateTime.Now.Year % 100}";

            if (!string.IsNullOrEmpty(lastJc))
            {
                // Format: JC0001/25-26
                // Split by / to separate Number and FinYear
                var parts = lastJc.Split('/');
                if (parts.Length > 0)
                {
                    // Extract Number part (JC0001)
                    var numPart = parts[0].Replace("JC", "");
                    if (int.TryParse(numPart, out int currentNum))
                    {
                        nextNum = currentNum + 1;
                    }
                }
            }

            return $"JC{nextNum:D4}/{finYear}";
        }
    }
}
