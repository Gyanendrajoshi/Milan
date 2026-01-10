using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IProcessService
    {
        Task<IEnumerable<ProcessMasterDto>> GetAllAsync();
        Task<ProcessMasterDto?> GetByIdAsync(int id);
        Task<ProcessMasterDto> CreateAsync(CreateProcessMasterDto dto);
        Task<ProcessMasterDto> UpdateAsync(int id, UpdateProcessMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class ProcessService : IProcessService
    {
        private readonly IProcessRepository _repository;

        public ProcessService(IProcessRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ProcessMasterDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        public async Task<ProcessMasterDto?> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<ProcessMasterDto> CreateAsync(CreateProcessMasterDto dto)
        {
            var code = await _repository.GetNextCodeAsync();
            
            var entity = new ProcessMaster
            {
                Name = dto.Name,
                Code = code,
                ChargeType = dto.ChargeType,
                IsUnitConversion = dto.IsUnitConversion,
                Rate = dto.Rate,
                FormulaParams = dto.FormulaParams,
                IsActive = true
            };

            var id = await _repository.CreateAsync(entity);
            entity.Id = id;
            return MapToDto(entity);
        }

        public async Task<ProcessMasterDto> UpdateAsync(int id, UpdateProcessMasterDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException($"Process with ID {id} not found.");

            entity.Name = dto.Name;
            // Code is immutable and should not be changed during update
            // entity.Code = dto.Code; 
            entity.ChargeType = dto.ChargeType;
            entity.IsUnitConversion = dto.IsUnitConversion;
            entity.Rate = dto.Rate;
            entity.FormulaParams = dto.FormulaParams;

            var result = await _repository.UpdateAsync(entity);
            if (!result) throw new Exception($"Failed to update process with ID {id}");
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static ProcessMasterDto MapToDto(ProcessMaster entity) => new ProcessMasterDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            ChargeType = entity.ChargeType,
            IsUnitConversion = entity.IsUnitConversion,
            Rate = entity.Rate,
            FormulaParams = entity.FormulaParams,
            IsActive = entity.IsActive
        };
    }
}
