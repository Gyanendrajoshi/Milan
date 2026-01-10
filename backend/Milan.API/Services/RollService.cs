using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IRollService
    {
        Task<IEnumerable<RollMasterDto>> GetAllAsync();
        Task<RollMasterDto?> GetByIdAsync(int id);
        Task<RollMasterDto> CreateAsync(CreateRollMasterDto dto);
        Task<RollMasterDto?> UpdateAsync(int id, UpdateRollMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class RollService : IRollService
    {
        private readonly IRollRepository _repository;
        private readonly ILogger<RollService> _logger;

        public RollService(IRollRepository repository, ILogger<RollService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<RollMasterDto>> GetAllAsync()
        {
            var rolls = await _repository.GetAllAsync();
            return rolls.Select(MapToDto);
        }

        public async Task<RollMasterDto?> GetByIdAsync(int id)
        {
            var roll = await _repository.GetByIdAsync(id);
            return roll == null ? null : MapToDto(roll);
        }

        public async Task<RollMasterDto> CreateAsync(CreateRollMasterDto dto)
        {
            var roll = new RollMaster
            {
                ItemType = dto.ItemType,
                ItemCode = dto.ItemCode,
                ItemName = dto.ItemName,
                SupplierItemCode = dto.SupplierItemCode,
                Mill = dto.Mill,
                Quality = dto.Quality,
                RollWidthMM = dto.RollWidthMM,
                ThicknessMicron = dto.ThicknessMicron,
                Density = dto.Density,
                FaceGSM = dto.FaceGSM,
                ReleaseGSM = dto.ReleaseGSM,
                AdhesiveGSM = dto.AdhesiveGSM,
                TotalGSM = dto.TotalGSM,
                ShelfLifeDays = dto.ShelfLifeDays,
                PurchaseUnit = dto.PurchaseUnit,
                StockUnit = dto.StockUnit,
                PurchaseRate = dto.PurchaseRate,
                HSNCode = dto.HSNCode,
                Location = dto.Location,
                SupplierName = dto.SupplierName,
                IsActive = true
            };

            var id = await _repository.CreateAsync(roll);
            roll.RollId = id;
            roll.CreatedAt = DateTime.UtcNow;
            roll.UpdatedAt = DateTime.UtcNow;

            return MapToDto(roll);
        }

        public async Task<RollMasterDto?> UpdateAsync(int id, UpdateRollMasterDto dto)
        {
            var roll = await _repository.GetByIdAsync(id);
            if (roll == null) return null;

            roll.ItemType = dto.ItemType;
            roll.ItemCode = dto.ItemCode;
            roll.ItemName = dto.ItemName;
            roll.SupplierItemCode = dto.SupplierItemCode;
            roll.Mill = dto.Mill;
            roll.Quality = dto.Quality;
            roll.RollWidthMM = dto.RollWidthMM;
            roll.ThicknessMicron = dto.ThicknessMicron;
            roll.Density = dto.Density;
            roll.FaceGSM = dto.FaceGSM;
            roll.ReleaseGSM = dto.ReleaseGSM;
            roll.AdhesiveGSM = dto.AdhesiveGSM;
            roll.TotalGSM = dto.TotalGSM;
            roll.ShelfLifeDays = dto.ShelfLifeDays;
            roll.PurchaseUnit = dto.PurchaseUnit;
            roll.StockUnit = dto.StockUnit;
            roll.PurchaseRate = dto.PurchaseRate;
            roll.HSNCode = dto.HSNCode;
            roll.Location = dto.Location;
            roll.SupplierName = dto.SupplierName;
            
            if (dto.IsActive.HasValue) roll.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(roll);
            
            roll.UpdatedAt = DateTime.UtcNow;
            return MapToDto(roll);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static RollMasterDto MapToDto(RollMaster roll)
        {
            return new RollMasterDto
            {
                RollId = roll.RollId,
                ItemType = roll.ItemType,
                ItemCode = roll.ItemCode,
                ItemName = roll.ItemName,
                SupplierItemCode = roll.SupplierItemCode,
                Mill = roll.Mill,
                Quality = roll.Quality,
                RollWidthMM = roll.RollWidthMM,
                ThicknessMicron = roll.ThicknessMicron,
                Density = roll.Density,
                FaceGSM = roll.FaceGSM,
                ReleaseGSM = roll.ReleaseGSM,
                AdhesiveGSM = roll.AdhesiveGSM,
                TotalGSM = roll.TotalGSM,
                ShelfLifeDays = roll.ShelfLifeDays,
                PurchaseUnit = roll.PurchaseUnit,
                StockUnit = roll.StockUnit,
                PurchaseRate = roll.PurchaseRate,
                HSNCode = roll.HSNCode,
                Location = roll.Location,
                SupplierName = roll.SupplierName,
                IsActive = roll.IsActive,
                CreatedAt = roll.CreatedAt,
                UpdatedAt = roll.UpdatedAt
            };
        }
    }
}
