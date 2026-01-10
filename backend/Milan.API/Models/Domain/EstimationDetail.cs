using System;
using System.Collections.Generic;

namespace Milan.API.Models.Domain
{
    public class EstimationDetail
    {
        public int Id { get; set; }
        public int EstimationId { get; set; }
        
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

        public decimal TotalJobCost { get; set; }
        public decimal TotalOrderValue { get; set; }

        public List<EstimationProcessCost> ProcessCosts { get; set; } = new();
    }
}
