using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IMaterialService
    {
        Task<IEnumerable<MaterialDto>> GetAllAsync();
        Task<MaterialDto?> GetByIdAsync(int id);
        Task<MaterialDto> CreateAsync(CreateMaterialDto dto);
        Task<MaterialDto?> UpdateAsync(int id, UpdateMaterialDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class MaterialService : IMaterialService
    {
        private readonly IMaterialRepository _repository;
        private readonly ILogger<MaterialService> _logger;

        public MaterialService(IMaterialRepository repository, ILogger<MaterialService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<MaterialDto>> GetAllAsync()
        {
            var materials = await _repository.GetAllAsync();
            return materials.Select(MapToDto);
        }

        public async Task<MaterialDto?> GetByIdAsync(int id)
        {
            var material = await _repository.GetByIdAsync(id);
            return material == null ? null : MapToDto(material);
        }

        public async Task<MaterialDto> CreateAsync(CreateMaterialDto dto)
        {
            var material = new Material
            {
                ItemCode = dto.ItemCode,
                ItemName = dto.ItemName,
                ShelfLifeDays = dto.ShelfLifeDays,
                ItemGroup = dto.ItemGroup,
                PurchaseUnit = dto.PurchaseUnit,
                PurchaseRate = dto.PurchaseRate,
                HSNCode = dto.HSNCode,
                GSM = dto.GSM,
                WidthMm = dto.WidthMm,
                IsActive = true
            };

            var id = await _repository.CreateAsync(material);
            material.MaterialId = id;
            material.CreatedAt = DateTime.UtcNow;
            material.UpdatedAt = DateTime.UtcNow;

            return MapToDto(material);
        }

        public async Task<MaterialDto?> UpdateAsync(int id, UpdateMaterialDto dto)
        {
            var material = await _repository.GetByIdAsync(id);
            if (material == null) return null;

            material.ItemCode = dto.ItemCode;
            material.ItemName = dto.ItemName;
            material.ShelfLifeDays = dto.ShelfLifeDays;
            material.ItemGroup = dto.ItemGroup;
            material.PurchaseUnit = dto.PurchaseUnit;
            material.PurchaseRate = dto.PurchaseRate;
            material.HSNCode = dto.HSNCode;
            material.GSM = dto.GSM;
            material.WidthMm = dto.WidthMm;
            
            if (dto.IsActive.HasValue) material.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(material);
            
            material.UpdatedAt = DateTime.UtcNow;
            return MapToDto(material);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static MaterialDto MapToDto(Material material)
        {
            return new MaterialDto
            {
                MaterialId = material.MaterialId,
                ItemCode = material.ItemCode,
                ItemName = material.ItemName,
                ShelfLifeDays = material.ShelfLifeDays,
                ItemGroup = material.ItemGroup,
                PurchaseUnit = material.PurchaseUnit,
                PurchaseRate = material.PurchaseRate,
                HSNCode = material.HSNCode,
                GSM = material.GSM,
                WidthMm = material.WidthMm,
                IsActive = material.IsActive,
                CreatedAt = material.CreatedAt,
                UpdatedAt = material.UpdatedAt
            };
        }
    }
}
