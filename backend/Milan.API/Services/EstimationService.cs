using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;
using System.Linq;

namespace Milan.API.Services
{
    public interface IEstimationService
    {
        Task<int> CreateEstimationAsync(EstimationDto dto);
        Task<IEnumerable<EstimationDto>> GetAllAsync();
        Task<EstimationDto?> GetByIdAsync(int id);
        Task UpdateAsync(int id, EstimationDto dto);
        Task DeleteAsync(int id);
    }

    public class EstimationService : IEstimationService
    {
        private readonly IEstimationRepository _repository;
        private readonly IChargeTypeRepository _chargeTypeRepository;

        public EstimationService(IEstimationRepository repository, IChargeTypeRepository chargeTypeRepository)
        {
            _repository = repository;
            _chargeTypeRepository = chargeTypeRepository;
        }

        public async Task<int> CreateEstimationAsync(EstimationDto dto)
        {
            // Log incoming
            Console.WriteLine($"[CreateEstimation] Incoming JobCardNo: '{dto.JobCardNo}'");

            var estimation = await MapToDomain(dto); // Use helper, async because it needs DB lookup
            
            // Generate Job Card No if empty (for new creations)
            if (string.IsNullOrEmpty(estimation.JobCardNo))
            {
                Console.WriteLine("[CreateEstimation] JobCardNo is empty. Generating new...");
                estimation.JobCardNo = await _repository.GenerateNextJobCardNoAsync();
                Console.WriteLine($"[CreateEstimation] Generated JobCardNo: '{estimation.JobCardNo}'");
            }
            else
            {
                Console.WriteLine($"[CreateEstimation] Using provided JobCardNo: '{estimation.JobCardNo}'");
            }

            return await _repository.CreateFullAsync(estimation);
        }

        public async Task UpdateAsync(int id, EstimationDto dto)
        {
            var estimation = await MapToDomain(dto);
            estimation.Id = id; // Ensure ID is set
            await _repository.UpdateFullAsync(estimation);
        }

        private async Task<Estimation> MapToDomain(EstimationDto dto)
        {
             // 1. Fetch Charge Types for Lookup (Cached ideally)
            var chargeTypes = await _chargeTypeRepository.GetAllActiveAsync();
            var chargeTypeMap = chargeTypes.ToDictionary(k => k.Name, v => v.LogicCode);

            // 2. Map DTO to Domain & Validate
            var estimation = new Estimation
            {
                TenantId = 1, // Default or from Context
                JobCardNo = dto.JobCardNo, // User Provided or Auto-Gen logic here
                Date = dto.Date,
                ClientId = dto.ClientId,
                JobName = dto.JobName,
                JobPriority = dto.JobPriority,
                JobType = dto.JobType,
                Status = dto.Status,
                OrderQty = dto.OrderQty,
                CategoryId = dto.CategoryId,
                PoNumber = dto.PoNumber,
                DeliveryDate = dto.DeliveryDate,
                SalesPerson = dto.SalesPersonName, // Backend store name for easier display or ID
                TotalJobCost = dto.TotalJobCost,
                FinalPriceWithGST = dto.FinalPriceWithGST,
                UnitCost = dto.UnitCost,
                FinalSalesPrice = dto.FinalSalesPrice,
                TotalOrderValue = dto.TotalOrderValue,
                IsActive = true
            };

            Console.WriteLine($"[MapToDomain] Starting mapping. Content count: {dto.content?.Count ?? 0}");
            if (dto.content == null || dto.content.Count == 0)
            {
                Console.WriteLine("[MapToDomain] WARNING: Content array is NULL or EMPTY!");
            }

            foreach (var dDto in dto.content)
            {
                Console.WriteLine($"[MapToDomain] Processing Content: {dDto.ContentName}");
                Console.WriteLine($"  - ToolId: {dDto.ToolId}, ToolTeeth: {dDto.ToolTeeth}, ToolCircumMM: {dDto.ToolCircumferenceMM}");
                Console.WriteLine($"  - RollId: {dDto.RollId}, RollWidthMM: {dDto.RollWidthMM}, RollTotalGSM: {dDto.RollTotalGSM}");
                Console.WriteLine($"  - DieId: {dDto.DieId}");

                var detail = new EstimationDetail
                {
                    ContentName = dDto.ContentName,
                    MachineName = dDto.MachineName,
                    JobWidthMM = dDto.JobWidthMM,
                    JobHeightMM = dDto.JobHeightMM,
                    ColorsFront = dDto.ColorsFront,
                    ColorsBack = dDto.ColorsBack,
                    UpsAround = dDto.UpsAround,
                    TotalUps = dDto.TotalUps,
                    ToolId = dDto.ToolId,
                    ToolTeeth = dDto.ToolTeeth,
                    ToolCircumferenceMM = dDto.ToolCircumferenceMM,
                    ToolCircumferenceInch = dDto.ToolCircumferenceInch,
                    DieId = dDto.DieId,
                    RollId = dDto.RollId,
                    RollWidthMM = dDto.RollWidthMM > 0 ? dDto.RollWidthMM : (dDto.BaseRunningMtr > 0 ? dDto.BaseSqMtr / dDto.BaseRunningMtr * 1000 : 0),
                    RollTotalGSM = dDto.RollTotalGSM,
                    BaseRunningMtr = dDto.BaseRunningMtr,
                    BaseSqMtr = dDto.BaseSqMtr,
                    BaseKg = dDto.BaseKg,
                    WastagePercent = dDto.WastagePercent,
                    WastageRM = dDto.WastageRM,
                    TotalRunningMtr = dDto.TotalRunningMtr,
                    TotalSqMtr = dDto.TotalSqMtr,
                    TotalKg = dDto.TotalKg,
                    MaterialRate = dDto.MaterialRate,
                    MaterialCostAmount = dDto.MaterialCostAmount,
                    AdditionalCostPercent = dDto.AdditionalCostPercent,
                    AdditionalCostAmount = dDto.AdditionalCostAmount,
                    TotalJobCost = dDto.MaterialCostAmount + dDto.AdditionalCostAmount + dDto.processCosts.Sum(p => p.Amount),
                    TotalOrderValue = dto.TotalOrderValue // Placeholder
                };

                Console.WriteLine($"[MapToDomain] Mapped Detail - ToolTeeth: {detail.ToolTeeth}, RollWidthMM: {detail.RollWidthMM}, RollTotalGSM: {detail.RollTotalGSM}");

                foreach (var pDto in dDto.processCosts)
                {
                    // Hybrid Logic: Server Side Validation
                    // Find Logic Code
                    string logicCode = "";
                    if (chargeTypeMap.TryGetValue(pDto.RateType, out var code))
                    {
                        logicCode = code;
                    }
                    else if (pDto.RateType == "Printing (Advanced)")
                    {
                         logicCode = "PRINT_ADV"; // Fallback
                    }

                    var calcResult = EstimationCalculator.CalculateProcessCost(
                        logicCode,
                        pDto.Quantity,
                        pDto.Rate,
                        pDto.IsManualRate,
                        pDto.BaseRate,
                        pDto.ExtraColorRate,
                        pDto.BackPrintingRate,
                        dDto.ColorsFront,
                        dDto.ColorsBack
                    );

                    var cost = new EstimationProcessCost
                    {
                        ProcessId = pDto.ProcessId,
                        RateType = pDto.RateType,
                        Quantity = pDto.Quantity,
                        Rate = calcResult.CalculatedRate, // Use Server Calculated Rate
                        Amount = calcResult.CalculatedAmount, // Use Server Calculated Amount
                        IsManualQuantity = pDto.IsManualQuantity,
                        IsManualRate = pDto.IsManualRate,
                        BaseRate = pDto.BaseRate,
                        ExtraColorRate = pDto.ExtraColorRate,
                        BackPrintingRate = pDto.BackPrintingRate,
                        DebugInfo = calcResult.DebugInfo // Store Server Debug Info
                    };

                    detail.ProcessCosts.Add(cost);
                }

                estimation.details.Add(detail);
            }

            return estimation;
        }

        public async Task<IEnumerable<EstimationDto>> GetAllAsync()
        {
            var raw = await _repository.GetAllFullAsync();
            return raw.Select(MapToDto);
        }

        public async Task<EstimationDto?> GetByIdAsync(int id)
        {
            var raw = await _repository.GetByIdFullAsync(id);
            if (raw == null) return null;
            return MapToDto(raw);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id); // Uses BaseRepository
        }

        private EstimationDto MapToDto(Estimation e)
        {
            return new EstimationDto
            {
                Id = e.Id,
                JobCardNo = e.JobCardNo,
                Date = e.Date,
                ClientId = e.ClientId,
                ClientName = e.ClientName,
                JobName = e.JobName,
                JobPriority = e.JobPriority,
                JobType = e.JobType,
                Status = e.Status,
                OrderQty = e.OrderQty,
                CategoryId = e.CategoryId,
                PoNumber = e.PoNumber,
                DeliveryDate = e.DeliveryDate,
                SalesPersonName = e.SalesPerson,
                TotalJobCost = e.TotalJobCost,
                FinalPriceWithGST = e.FinalPriceWithGST,
                UnitCost = e.UnitCost,
                FinalSalesPrice = e.FinalSalesPrice,
                TotalOrderValue = e.TotalOrderValue,
                content = e.details.Select(d => new EstimationDetailDto
                {
                    Id = d.Id,
                    ContentName = d.ContentName,
                    MachineName = d.MachineName,
                    JobWidthMM = d.JobWidthMM,
                    JobHeightMM = d.JobHeightMM,
                    ColorsFront = d.ColorsFront,
                    ColorsBack = d.ColorsBack,
                    UpsAcross = d.UpsAcross,
                    UpsAround = d.UpsAround,
                    TotalUps = d.TotalUps,
                    ToolId = d.ToolId,
                    ToolTeeth = d.ToolTeeth,
                    ToolCircumferenceMM = d.ToolCircumferenceMM,
                    ToolCircumferenceInch = d.ToolCircumferenceInch,
                    DieId = d.DieId,
                    RollId = d.RollId,
                    RollWidthMM = d.RollWidthMM,
                    RollTotalGSM = d.RollTotalGSM,
                    BaseRunningMtr = d.BaseRunningMtr,
                    BaseSqMtr = d.BaseSqMtr,
                    BaseKg = d.BaseKg,
                    WastagePercent = d.WastagePercent,
                    WastageRM = d.WastageRM,
                    TotalRunningMtr = d.TotalRunningMtr,
                    TotalSqMtr = d.TotalSqMtr,
                    TotalKg = d.TotalKg,
                    MaterialRate = d.MaterialRate,
                    MaterialCostAmount = d.MaterialCostAmount,
                    AdditionalCostPercent = d.AdditionalCostPercent,
                    AdditionalCostAmount = d.AdditionalCostAmount,
                    processCosts = d.ProcessCosts.Select(p => new EstimationProcessCostDto
                    {
                        Id = p.Id,
                        ProcessId = p.ProcessId,
                        RateType = p.RateType,
                        Quantity = p.Quantity,
                        Rate = p.Rate,
                        Amount = p.Amount,
                        IsManualQuantity = p.IsManualQuantity,
                        IsManualRate = p.IsManualRate,
                        BaseRate = p.BaseRate,
                        ExtraColorRate = p.ExtraColorRate,
                        BackPrintingRate = p.BackPrintingRate,
                        DebugInfo = p.DebugInfo
                    }).ToList()
                }).ToList()
            };
        }
    }
}
