using System.ComponentModel.DataAnnotations;

namespace Milan.API.Models.DTOs
{
    public class ProcessMasterDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string ChargeType { get; set; } = string.Empty;
        public bool IsUnitConversion { get; set; }
        public decimal Rate { get; set; }
        public string? FormulaParams { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateProcessMasterDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Code { get; set; } = string.Empty;
        
        public string ChargeType { get; set; } = string.Empty;
        public bool IsUnitConversion { get; set; }
        public decimal Rate { get; set; }
        public string? FormulaParams { get; set; }
    }

    public class UpdateProcessMasterDto : CreateProcessMasterDto
    {
    }
}
