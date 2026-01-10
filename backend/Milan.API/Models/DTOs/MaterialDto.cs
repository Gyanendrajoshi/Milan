using System;

namespace Milan.API.Models.DTOs
{
    public class MaterialDto
    {
        public int MaterialId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? ShelfLifeDays { get; set; }
        public string ItemGroup { get; set; } = string.Empty;
        public string PurchaseUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public decimal? GSM { get; set; }
        public decimal? WidthMm { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMaterialDto
    {
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? ShelfLifeDays { get; set; }
        public string ItemGroup { get; set; } = string.Empty;
        public string PurchaseUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public decimal? GSM { get; set; }
        public decimal? WidthMm { get; set; }
    }

    public class UpdateMaterialDto
    {
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? ShelfLifeDays { get; set; }
        public string ItemGroup { get; set; } = string.Empty;
        public string PurchaseUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public decimal? GSM { get; set; }
        public decimal? WidthMm { get; set; }
        public bool? IsActive { get; set; }
    }
}
