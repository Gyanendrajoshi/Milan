using System;
using System.Collections.Generic;

namespace Milan.API.Models.Domain
{
    public class Estimation
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty; // Not in DB Table, populated via Join
        public string JobName { get; set; } = string.Empty;
        public string JobPriority { get; set; } = "Medium";
        public string JobType { get; set; } = "New Job";
        public string Status { get; set; } = "Draft";

        // Global Fields
        public double OrderQty { get; set; }
        public int CategoryId { get; set; }
        public string? PoNumber { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string? SalesPerson { get; set; }

        // Financials
        public decimal TotalJobCost { get; set; }
        public decimal FinalPriceWithGST { get; set; }
        public decimal UnitCost { get; set; }
        public decimal FinalSalesPrice { get; set; }
        public decimal TotalOrderValue { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }

        // Navigation (Optional, but good to have structure)
        public List<EstimationDetail> details { get; set; } = new();
    }
}
