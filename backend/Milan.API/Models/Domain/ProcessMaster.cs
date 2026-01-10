using System;

namespace Milan.API.Models.Domain
{
    public class ProcessMaster
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string ChargeType { get; set; } = string.Empty;
        public bool IsUnitConversion { get; set; }
        public decimal Rate { get; set; }
        public string? FormulaParams { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
