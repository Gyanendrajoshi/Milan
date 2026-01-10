using System;

namespace Milan.API.Models.Domain
{
    public class EstimationProcessCost
    {
        public int Id { get; set; }
        public int EstimationDetailId { get; set; }
        
        public int ProcessId { get; set; }
        public string RateType { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public bool IsManualQuantity { get; set; }
        public bool IsManualRate { get; set; }

        // Advanced Params
        public decimal BaseRate { get; set; }
        public decimal ExtraColorRate { get; set; }
        public decimal BackPrintingRate { get; set; }
        public string? DebugInfo { get; set; }
    }
}
