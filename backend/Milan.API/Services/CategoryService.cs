using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryMasterDto>> GetAllAsync();
        Task<CategoryMasterDto?> GetByIdAsync(int id);
        Task<CategoryMasterDto> CreateAsync(CreateCategoryMasterDto dto);
        Task<CategoryMasterDto> UpdateAsync(int id, UpdateCategoryMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;

        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CategoryMasterDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        public async Task<CategoryMasterDto?> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<CategoryMasterDto> CreateAsync(CreateCategoryMasterDto dto)
        {
            var entity = new CategoryMaster
            {
                Name = dto.Name,
                Description = dto.Description,
                IsActive = true
            };

            var id = await _repository.CreateAsync(entity);
            
            // Handle Processes Link
            if (dto.ProcessIds != null && dto.ProcessIds.Any())
            {
                await _repository.UpdateProcessesAsync(id, dto.ProcessIds);
            }

            // Refetch to get full object with standard hydration
            var created = await _repository.GetByIdAsync(id);
            return MapToDto(created!);
        }

        public async Task<CategoryMasterDto> UpdateAsync(int id, UpdateCategoryMasterDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException($"Category with ID {id} not found.");

            entity.Name = dto.Name;
            entity.Description = dto.Description;

            var result = await _repository.UpdateAsync(entity);
            if (!result) throw new Exception($"Failed to update category with ID {id}");
            await _repository.UpdateProcessesAsync(id, dto.ProcessIds);

            // Refetch
            var updated = await _repository.GetByIdAsync(id);
            return MapToDto(updated!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static CategoryMasterDto MapToDto(CategoryMaster entity) => new CategoryMasterDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            IsActive = entity.IsActive,
            ProcessIds = entity.Processes.Select(p => p.Id),
            Processes = entity.Processes.Select(p => new ProcessMasterDto
            {
                Id = p.Id,
                Name = p.Name,
                Code = p.Code,
                ChargeType = p.ChargeType,
                Rate = p.Rate,
                IsUnitConversion = p.IsUnitConversion,
                IsActive = p.IsActive
            })
        };
    }
}
