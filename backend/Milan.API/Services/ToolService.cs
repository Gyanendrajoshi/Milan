using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IToolService
    {
        Task<IEnumerable<ToolMasterDto>> GetAllAsync();
        Task<ToolMasterDto?> GetByIdAsync(int id);
        Task<ToolMasterDto> CreateAsync(CreateToolMasterDto dto);
        Task<ToolMasterDto?> UpdateAsync(int id, UpdateToolMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class ToolService : IToolService
    {
        private readonly IToolRepository _repository;
        private readonly ILogger<ToolService> _logger;

        public ToolService(IToolRepository repository, ILogger<ToolService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ToolMasterDto>> GetAllAsync()
        {
            var tools = await _repository.GetAllAsync();
            return tools.Select(MapToDto);
        }

        public async Task<ToolMasterDto?> GetByIdAsync(int id)
        {
            var tool = await _repository.GetByIdAsync(id);
            return tool == null ? null : MapToDto(tool);
        }

        public async Task<ToolMasterDto> CreateAsync(CreateToolMasterDto dto)
        {
            var tool = new ToolMaster
            {
                ToolPrefix = dto.ToolPrefix,
                ToolNo = dto.ToolNo,
                ItemCode = dto.ItemCode,
                ToolName = dto.ToolName,
                ToolRefCode = dto.ToolRefCode,
                Location = dto.Location,
                Cabinet = dto.Cabinet,
                Shelf = dto.Shelf,
                Bin = dto.Bin,
                ToolType = dto.ToolType,
                MachineName = dto.MachineName,
                CylinderType = dto.CylinderType,
                Make = dto.Make,
                PrintType = dto.PrintType,
                Category = dto.Category,
                SupplierName = dto.SupplierName,
                PurchaseDate = dto.PurchaseDate,
                Status = dto.Status,
                Remark = dto.Remark,
                UsageCount = dto.UsageCount,
                Size = dto.Size,
                Width = dto.Width,
                Height = dto.Height,
                Thickness = dto.Thickness,
                Unit = dto.Unit,
                DrawingNo = dto.DrawingNo,
                RevNo = dto.RevNo,
                NoOfTeeth = dto.NoOfTeeth,
                CircumferenceMM = dto.CircumferenceMM,
                CircumferenceInch = dto.CircumferenceInch,
                HSNCode = dto.HSNCode,
                PurchaseUnit = dto.PurchaseUnit,
                PurchaseRate = dto.PurchaseRate,
                ColorDetails = dto.ColorDetails,
                Plates = dto.Plates,
                LPI = dto.LPI,
                BCM = dto.BCM,
                JobSize = dto.JobSize,
                AcrossUps = dto.AcrossUps,
                AroundUps = dto.AroundUps,
                AcrossGap = dto.AcrossGap,
                AroundGap = dto.AroundGap,
                JobCode = dto.JobCode,
                JobName = dto.JobName,
                ToolDescription = dto.ToolDescription,
                IsActive = true
            };

            var id = await _repository.CreateAsync(tool);
            tool.ToolId = id;
            tool.CreatedAt = DateTime.UtcNow;
            tool.UpdatedAt = DateTime.UtcNow;

            return MapToDto(tool);
        }

        public async Task<ToolMasterDto?> UpdateAsync(int id, UpdateToolMasterDto dto)
        {
            var tool = await _repository.GetByIdAsync(id);
            if (tool == null) return null;

            tool.ToolPrefix = dto.ToolPrefix;
            tool.ToolNo = dto.ToolNo;
            tool.ItemCode = dto.ItemCode;
            tool.ToolName = dto.ToolName;
            tool.ToolRefCode = dto.ToolRefCode;
            tool.Location = dto.Location;
            tool.Cabinet = dto.Cabinet;
            tool.Shelf = dto.Shelf;
            tool.Bin = dto.Bin;
            tool.ToolType = dto.ToolType;
            tool.MachineName = dto.MachineName;
            tool.CylinderType = dto.CylinderType;
            tool.Make = dto.Make;
            tool.PrintType = dto.PrintType;
            tool.Category = dto.Category;
            tool.SupplierName = dto.SupplierName;
            tool.PurchaseDate = dto.PurchaseDate;
            tool.Status = dto.Status;
            tool.Remark = dto.Remark;
            tool.UsageCount = dto.UsageCount ?? tool.UsageCount;
            tool.Size = dto.Size;
            tool.Width = dto.Width;
            tool.Height = dto.Height;
            tool.Thickness = dto.Thickness;
            tool.Unit = dto.Unit;
            tool.DrawingNo = dto.DrawingNo;
            tool.RevNo = dto.RevNo;
            tool.NoOfTeeth = dto.NoOfTeeth;
            tool.CircumferenceMM = dto.CircumferenceMM;
            tool.CircumferenceInch = dto.CircumferenceInch;
            tool.HSNCode = dto.HSNCode;
            tool.PurchaseUnit = dto.PurchaseUnit;
            tool.PurchaseRate = dto.PurchaseRate;
            tool.ColorDetails = dto.ColorDetails;
            tool.Plates = dto.Plates;
            tool.LPI = dto.LPI;
            tool.BCM = dto.BCM;
            tool.JobSize = dto.JobSize;
            tool.AcrossUps = dto.AcrossUps;
            tool.AroundUps = dto.AroundUps;
            tool.AcrossGap = dto.AcrossGap;
            tool.AroundGap = dto.AroundGap;
            tool.JobCode = dto.JobCode;
            tool.JobName = dto.JobName;
            tool.ToolDescription = dto.ToolDescription;
            
            if (dto.IsActive.HasValue) tool.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(tool);
            
            tool.UpdatedAt = DateTime.UtcNow;
            return MapToDto(tool);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static ToolMasterDto MapToDto(ToolMaster tool)
        {
            return new ToolMasterDto
            {
                ToolId = tool.ToolId,
                ToolPrefix = tool.ToolPrefix,
                ToolNo = tool.ToolNo,
                ItemCode = tool.ItemCode,
                ToolName = tool.ToolName,
                ToolRefCode = tool.ToolRefCode,
                Location = tool.Location,
                Cabinet = tool.Cabinet,
                Shelf = tool.Shelf,
                Bin = tool.Bin,
                ToolType = tool.ToolType,
                MachineName = tool.MachineName,
                CylinderType = tool.CylinderType,
                Make = tool.Make,
                PrintType = tool.PrintType,
                Category = tool.Category,
                SupplierName = tool.SupplierName,
                PurchaseDate = tool.PurchaseDate,
                Status = tool.Status,
                Remark = tool.Remark,
                UsageCount = tool.UsageCount,
                Size = tool.Size,
                Width = tool.Width,
                Height = tool.Height,
                Thickness = tool.Thickness,
                Unit = tool.Unit,
                DrawingNo = tool.DrawingNo,
                RevNo = tool.RevNo,
                NoOfTeeth = tool.NoOfTeeth,
                CircumferenceMM = tool.CircumferenceMM,
                CircumferenceInch = tool.CircumferenceInch,
                HSNCode = tool.HSNCode,
                PurchaseUnit = tool.PurchaseUnit,
                PurchaseRate = tool.PurchaseRate,
                ColorDetails = tool.ColorDetails,
                Plates = tool.Plates,
                LPI = tool.LPI,
                BCM = tool.BCM,
                JobSize = tool.JobSize,
                AcrossUps = tool.AcrossUps,
                AroundUps = tool.AroundUps,
                AcrossGap = tool.AcrossGap,
                AroundGap = tool.AroundGap,
                JobCode = tool.JobCode,
                JobName = tool.JobName,
                ToolDescription = tool.ToolDescription,
                IsActive = tool.IsActive,
                CreatedAt = tool.CreatedAt,
                UpdatedAt = tool.UpdatedAt
            };
        }
    }
}
