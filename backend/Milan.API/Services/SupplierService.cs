using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierDto>> GetAllAsync();
        Task<SupplierDto?> GetByIdAsync(int id);
        Task<SupplierDto> CreateAsync(CreateSupplierDto dto);
        Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _repository;
        private readonly ILogger<SupplierService> _logger;

        public SupplierService(ISupplierRepository repository, ILogger<SupplierService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<SupplierDto>> GetAllAsync()
        {
            var suppliers = await _repository.GetAllAsync();
            return suppliers.Select(MapToDto);
        }

        public async Task<SupplierDto?> GetByIdAsync(int id)
        {
            var supplier = await _repository.GetByIdAsync(id);
            return supplier == null ? null : MapToDto(supplier);
        }

        public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                SupplierName = dto.SupplierName,
                Address = dto.Address,
                MobileNumber = dto.MobileNumber,
                Email = dto.Email,
                GSTNumber = dto.GSTNumber,
                ExcessQuantityTolerance = dto.ExcessQuantityTolerance,
                State = dto.State,
                Country = dto.Country,
                IsActive = true
            };

            var id = await _repository.CreateAsync(supplier);
            supplier.SupplierId = id;
            supplier.CreatedAt = DateTime.UtcNow;
            supplier.UpdatedAt = DateTime.UtcNow;

            return MapToDto(supplier);
        }

        public async Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto)
        {
            var supplier = await _repository.GetByIdAsync(id);
            if (supplier == null) return null;

            supplier.SupplierName = dto.SupplierName;
            supplier.Address = dto.Address;
            supplier.MobileNumber = dto.MobileNumber;
            supplier.Email = dto.Email;
            supplier.GSTNumber = dto.GSTNumber;
            supplier.ExcessQuantityTolerance = dto.ExcessQuantityTolerance;
            supplier.State = dto.State;
            supplier.Country = dto.Country;
            
            if (dto.IsActive.HasValue) supplier.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(supplier);
            
            supplier.UpdatedAt = DateTime.UtcNow;
            return MapToDto(supplier);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static SupplierDto MapToDto(Supplier supplier)
        {
            return new SupplierDto
            {
                SupplierId = supplier.SupplierId,
                SupplierName = supplier.SupplierName,
                Address = supplier.Address,
                MobileNumber = supplier.MobileNumber,
                Email = supplier.Email,
                GSTNumber = supplier.GSTNumber,
                ExcessQuantityTolerance = supplier.ExcessQuantityTolerance,
                State = supplier.State,
                Country = supplier.Country,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt,
                UpdatedAt = supplier.UpdatedAt
            };
        }
    }
}
