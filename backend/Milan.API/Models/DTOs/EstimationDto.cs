using System;
using System.Collections.Generic;

namespace Milan.API.Models.DTOs
{
    public class EstimationDto
    {
        public int Id { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string JobName { get; set; } = string.Empty;
        public string JobPriority { get; set; } = "Medium";
        public string JobType { get; set; } = "New Job";
        public string Status { get; set; } = "Draft";

        public double OrderQty { get; set; }
        public int CategoryId { get; set; }
        public string? PoNumber { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public int SalesPersonId { get; set; } // Matches UI 'salesPerson' often is ID
        public string? SalesPersonName { get; set; } // Display

        public decimal TotalJobCost { get; set; }
        public decimal FinalPriceWithGST { get; set; }
        public decimal UnitCost { get; set; }
        public decimal FinalSalesPrice { get; set; }
        public decimal TotalOrderValue { get; set; }
        
        public List<EstimationDetailDto> content { get; set; } = new(); // UI uses 'content' array
    }

    public class EstimationDetailDto
    {
        public int Id { get; set; }
        public string ContentName { get; set; } = string.Empty;
        public string? MachineName { get; set; }

        public double JobWidthMM { get; set; }
        public double JobHeightMM { get; set; }
        public int ColorsFront { get; set; }
        public int ColorsBack { get; set; }
        public int UpsAcross { get; set; }
        public int UpsAround { get; set; }
        public int TotalUps { get; set; }

        public int? ToolId { get; set; }
        public int? ToolTeeth { get; set; }
        public double? ToolCircumferenceMM { get; set; }
        public double? ToolCircumferenceInch { get; set; }

        public int? DieId { get; set; }

        public int? RollId { get; set; }
        public double? RollWidthMM { get; set; }
        public double? RollTotalGSM { get; set; }

        public double BaseRunningMtr { get; set; }
        public double BaseSqMtr { get; set; }
        public double BaseKg { get; set; }

        public double WastagePercent { get; set; }
        public double WastageRM { get; set; }

        public double TotalRunningMtr { get; set; }
        public double TotalSqMtr { get; set; }
        public double TotalKg { get; set; }

        public decimal MaterialRate { get; set; }
        public decimal MaterialCostAmount { get; set; }

        public double AdditionalCostPercent { get; set; }
        public decimal AdditionalCostAmount { get; set; }
        
        public List<EstimationProcessCostDto> processCosts { get; set; } = new();
    }

    public class EstimationProcessCostDto
    {
        public int Id { get; set; }
        public int ProcessId { get; set; }
        public string ProcessName { get; set; } = string.Empty; // Useful for UI
        public string RateType { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public bool IsManualQuantity { get; set; }
        public bool IsManualRate { get; set; }

        public decimal BaseRate { get; set; }
        public decimal ExtraColorRate { get; set; }
        public decimal BackPrintingRate { get; set; }
        public string? DebugInfo { get; set; }
    }
}
