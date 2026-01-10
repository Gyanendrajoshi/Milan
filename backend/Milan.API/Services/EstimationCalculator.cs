using System;

namespace Milan.API.Services
{
    public class CalculationResult
    {
        public decimal CalculatedRate { get; set; }
        public decimal CalculatedAmount { get; set; }
        public string DebugInfo { get; set; } = string.Empty;
    }

    public static class EstimationCalculator
    {
        public static CalculationResult CalculateProcessCost(
            string logicCode,
            double quantity,
            decimal inputRate,
            bool isManualRate,
            decimal baseRate,
            decimal extraColorRate,
            decimal backPrintingRate,
            int colorsFront,
            int colorsBack)
        {
            decimal finalRate = isManualRate ? inputRate : baseRate;
            string debug = "";

            if (!isManualRate && logicCode == "PRINT_ADV")
            {
                // Advanced Printing Logic
                // Base Rate (for 1 color usually) + Extra Colors + Back Colors
                
                decimal calculatedRate = baseRate;
                int totalColors = colorsFront + colorsBack;

                // Extra Colors Charge (example: Base covers 1st color)
                // Note: Logic must match Frontend exactly.
                // Frontend: extraColors = Math.max(0, colors - 1);
                int extraColors = Math.Max(0, totalColors - 1);
                decimal extraCharge = 0;
                
                if (extraColors > 0)
                {
                    extraCharge = extraColors * extraColorRate;
                    calculatedRate += extraCharge;
                }

                decimal backCharge = 0;
                if (colorsBack > 0)
                {
                    backCharge = backPrintingRate;
                    calculatedRate += backCharge;
                }

                finalRate = calculatedRate;
                debug = $"[SERVER] Base: {baseRate} + Extra({extraColors}x{extraColorRate}): {extraCharge} + Back: {backCharge}";
            }
            else if (!isManualRate)
            {
                // Default behavior: Rate is Base Rate
                finalRate = baseRate;
                if (finalRate == 0 && inputRate > 0) finalRate = inputRate; // Fallback
            }

            // Calculate Amount
            // Standard: Quantity * Rate
            // Formula: Rate/1000 Units -> Qty * (Rate/1000)
            
            decimal multiplier = finalRate;
             if (logicCode == "PER_1000_UPS" || logicCode == "RATE_1000_UNITS") // Add more codes as needed from ChargeTypes
            {
                multiplier = multiplier / 1000m;
            }

            decimal amount = (decimal)quantity * multiplier;
            amount = Math.Round(amount, 2);

            return new CalculationResult
            {
                CalculatedRate = finalRate,
                CalculatedAmount = amount,
                DebugInfo = debug
            };
        }
    }
}
