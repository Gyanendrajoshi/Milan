using System;

namespace Milan.API.Models.Domain
{
    public class ToolMaster
    {
        public int ToolId { get; set; }
        public int TenantId { get; set; }
        
        public string ToolPrefix { get; set; } = string.Empty;
        public string ToolNo { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ToolName { get; set; } = string.Empty;
        public string? ToolRefCode { get; set; }
        
        public string? Location { get; set; }
        public string? Cabinet { get; set; }
        public string? Shelf { get; set; }
        public string? Bin { get; set; }
        public string? ToolType { get; set; }
        public string? MachineName { get; set; }
        public string? CylinderType { get; set; }
        public string? Make { get; set; }
        public string? PrintType { get; set; }
        public string? Category { get; set; }
        
        public string? SupplierName { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string? Status { get; set; }
        public string? Remark { get; set; }
        public int UsageCount { get; set; }
        
        public string? Size { get; set; }
        public string? Width { get; set; }
        public string? Height { get; set; }
        public string? Thickness { get; set; }
        public string? Unit { get; set; }
        public string? DrawingNo { get; set; }
        public string? RevNo { get; set; }
        
        public decimal? NoOfTeeth { get; set; }
        public decimal? CircumferenceMM { get; set; }
        public decimal? CircumferenceInch { get; set; }
        
        public string? HSNCode { get; set; }
        public string? PurchaseUnit { get; set; }
        public decimal? PurchaseRate { get; set; }
        
        public string? ColorDetails { get; set; }
        public string? Plates { get; set; }
        
        public string? LPI { get; set; }
        public string? BCM { get; set; }
        
        public string? JobSize { get; set; }
        public decimal? AcrossUps { get; set; }
        public decimal? AroundUps { get; set; }
        public decimal? AcrossGap { get; set; }
        public decimal? AroundGap { get; set; }

        public string? JobCode { get; set; }
        public string? JobName { get; set; }
        public string? ToolDescription { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
