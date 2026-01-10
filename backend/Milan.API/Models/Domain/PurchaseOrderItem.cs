using System;

namespace Milan.API.Models.Domain
{
    public class PurchaseOrderItem
    {
        public int POItemId { get; set; }
        public int TenantId { get; set; }
        public int POId { get; set; }
        
        public string ItemType { get; set; } = string.Empty; // Roll / Material
        public int ItemId { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemName { get; set; }
        
        public decimal? RollWidthMM { get; set; }
        public decimal? RollTotalGSM { get; set; }
        
        public decimal? QtyKg { get; set; }
        public decimal? QtySqMtr { get; set; }
        public decimal? QtyRunMtr { get; set; }
        public decimal? QtyUnit { get; set; }
        
        public DateTime? ReqDate { get; set; }
        public decimal Rate { get; set; }
        public string RateType { get; set; } = string.Empty;
        
        public decimal BasicAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal CGST { get; set; }
        public decimal SGST { get; set; }
        public decimal IGST { get; set; }
        public decimal TotalAmount { get; set; }
        
        public string? HSNCode { get; set; }
        public decimal? GSTPercent { get; set; }
        
        public string? Remark { get; set; }
        
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
