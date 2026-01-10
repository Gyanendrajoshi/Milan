using System;
using System.Collections.Generic;

namespace Milan.API.Models.Domain
{
    public class PurchaseOrder
    {
        public int POId { get; set; }
        public int TenantId { get; set; }
        
        public string PONumber { get; set; } = string.Empty;
        public DateTime PODate { get; set; }
        public int SupplierId { get; set; }
        public string? SupplierName { get; set; } // Populated via Join
        
        public string Status { get; set; } = "Pending";
        public string? Remarks { get; set; }
        
        public decimal OtherCharges { get; set; }
        public string? OtherChargeDescription { get; set; }
        
        public decimal GrandBasic { get; set; }
        public decimal GrandTax { get; set; }
        public decimal GrandTotal { get; set; }
        
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation Property (Optional in Dapper, but good for structure)
        public List<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }
}
