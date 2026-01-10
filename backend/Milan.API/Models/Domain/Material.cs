using System;

namespace Milan.API.Models.Domain
{
    public class Material
    {
        public int MaterialId { get; set; }
        public int TenantId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? ShelfLifeDays { get; set; }
        public string ItemGroup { get; set; } = string.Empty;
        public string PurchaseUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        
        // Roll Specifics
        public decimal? GSM { get; set; }
        public decimal? WidthMm { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
