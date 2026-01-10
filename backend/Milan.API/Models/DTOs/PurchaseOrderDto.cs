using System;
using System.Collections.Generic;

namespace Milan.API.Models.DTOs
{
    public class PurchaseOrderDto
    {
        public int POId { get; set; }
        public string PONumber { get; set; } = string.Empty;
        public DateTime PODate { get; set; }
        public int SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        
        public decimal OtherCharges { get; set; }
        public string? OtherChargeDescription { get; set; }
        
        public decimal GrandBasic { get; set; }
        public decimal GrandTax { get; set; }
        public decimal GrandTotal { get; set; }
        
        public List<PurchaseOrderItemDto> Items { get; set; } = new List<PurchaseOrderItemDto>();
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PurchaseOrderItemDto
    {
        public int POItemId { get; set; }
        public int POId { get; set; }
        
        public string ItemType { get; set; } = string.Empty;
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
    }

    public class CreatePurchaseOrderDto
    {
        public string PONumber { get; set; } = string.Empty;
        public DateTime PODate { get; set; }
        public int SupplierId { get; set; }
        public string? Remarks { get; set; }
        
        public decimal OtherCharges { get; set; }
        public string? OtherChargeDescription { get; set; }
        
        public decimal GrandBasic { get; set; }
        public decimal GrandTax { get; set; }
        public decimal GrandTotal { get; set; }
        
        public List<CreatePurchaseOrderItemDto> Items { get; set; } = new List<CreatePurchaseOrderItemDto>();
    }

    public class CreatePurchaseOrderItemDto
    {
        public string ItemType { get; set; } = string.Empty;
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
    }
}
