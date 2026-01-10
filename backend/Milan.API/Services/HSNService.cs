using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IHSNService
    {
        Task<IEnumerable<HSNMasterDto>> GetAllAsync();
        Task<HSNMasterDto?> GetByIdAsync(int id);
        Task<HSNMasterDto> CreateAsync(CreateHSNMasterDto dto);
        Task<HSNMasterDto?> UpdateAsync(int id, UpdateHSNMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class HSNService : IHSNService
    {
        private readonly IHSNRepository _repository;
        private readonly ILogger<HSNService> _logger;

        public HSNService(IHSNRepository repository, ILogger<HSNService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<HSNMasterDto>> GetAllAsync()
        {
            var hsnList = await _repository.GetAllAsync();
            return hsnList.Select(MapToDto);
        }

        public async Task<HSNMasterDto?> GetByIdAsync(int id)
        {
            var hsn = await _repository.GetByIdAsync(id);
            return hsn == null ? null : MapToDto(hsn);
        }

        public async Task<HSNMasterDto> CreateAsync(CreateHSNMasterDto dto)
        {
            var hsn = new HSNMaster
            {
                Name = dto.Name,
                HSNCode = dto.HSNCode,
                GSTPercentage = dto.GSTPercentage,
                IsActive = true
            };

            var id = await _repository.CreateAsync(hsn);
            hsn.HSNId = id;
            hsn.CreatedAt = DateTime.UtcNow;
            hsn.UpdatedAt = DateTime.UtcNow;

            return MapToDto(hsn);
        }

        public async Task<HSNMasterDto?> UpdateAsync(int id, UpdateHSNMasterDto dto)
        {
            var hsn = await _repository.GetByIdAsync(id);
            if (hsn == null) return null;

            hsn.Name = dto.Name;
            hsn.HSNCode = dto.HSNCode;
            hsn.GSTPercentage = dto.GSTPercentage;
            
            if (dto.IsActive.HasValue) hsn.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(hsn);
            
            hsn.UpdatedAt = DateTime.UtcNow;
            return MapToDto(hsn);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static HSNMasterDto MapToDto(HSNMaster hsn)
        {
            return new HSNMasterDto
            {
                HSNId = hsn.HSNId,
                Name = hsn.Name,
                HSNCode = hsn.HSNCode,
                GSTPercentage = hsn.GSTPercentage,
                IsActive = hsn.IsActive,
                CreatedAt = hsn.CreatedAt,
                UpdatedAt = hsn.UpdatedAt
            };
        }
    }
}
