using System;

namespace Milan.API.Models.DTOs
{
    public class RollMasterDto
    {
        public int RollId { get; set; }
        public string ItemType { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string? SupplierItemCode { get; set; }
        public string? Mill { get; set; }
        public string? Quality { get; set; }
        public decimal RollWidthMM { get; set; }
        public decimal? ThicknessMicron { get; set; }
        public decimal? Density { get; set; }
        public decimal? FaceGSM { get; set; }
        public decimal? ReleaseGSM { get; set; }
        public decimal? AdhesiveGSM { get; set; }
        public decimal? TotalGSM { get; set; }
        public int? ShelfLifeDays { get; set; }
        public string PurchaseUnit { get; set; } = string.Empty;
        public string StockUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public string? Location { get; set; }
        public string? SupplierName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateRollMasterDto
    {
        public string ItemType { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string? SupplierItemCode { get; set; }
        public string? Mill { get; set; }
        public string? Quality { get; set; }
        public decimal RollWidthMM { get; set; }
        public decimal? ThicknessMicron { get; set; }
        public decimal? Density { get; set; }
        public decimal? FaceGSM { get; set; }
        public decimal? ReleaseGSM { get; set; }
        public decimal? AdhesiveGSM { get; set; }
        public decimal? TotalGSM { get; set; }
        public int? ShelfLifeDays { get; set; }
        public string PurchaseUnit { get; set; } = string.Empty;
        public string StockUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public string? Location { get; set; }
        public string? SupplierName { get; set; }
    }

    public class UpdateRollMasterDto
    {
        public string ItemType { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string? SupplierItemCode { get; set; }
        public string? Mill { get; set; }
        public string? Quality { get; set; }
        public decimal RollWidthMM { get; set; }
        public decimal? ThicknessMicron { get; set; }
        public decimal? Density { get; set; }
        public decimal? FaceGSM { get; set; }
        public decimal? ReleaseGSM { get; set; }
        public decimal? AdhesiveGSM { get; set; }
        public decimal? TotalGSM { get; set; }
        public int? ShelfLifeDays { get; set; }
        public string PurchaseUnit { get; set; } = string.Empty;
        public string StockUnit { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public string? HSNCode { get; set; }
        public string? Location { get; set; }
        public string? SupplierName { get; set; }
        public bool? IsActive { get; set; }
    }
}
