import { ProcessCost } from "@/types/estimation";

export interface CalculatorInputs {
    orderQty: number;
    upsAcross: number;
    upsAround: number;
    jobHeightMM: number;
    rollWidthMM: number;
    rollGSM: number;
    wastagePercent: number;
    wastageRM: number; // Optional override
    tool?: {
        circumferenceMM: number;
    };
}

export interface CalculatorResults {
    totalUps: number;
    baseRunningMtr: number;
    baseSqMtr: number;
    baseKg: number;
    totalRunningMtr: number;
    totalSqMtr: number;
    totalKg: number;
    wastageRM: number;
    wastagePercent: number; // Normalized
}

export const EstimationCalculator = {
    /**
     * Calculates Material Requirements based on Inputs.
     * Fixes the "Ups Around" logic error:
     * - If Tool Selected: Repeat = Circumference. Length = (Qty / TotalUps) * Repeat.
     * - If No Tool (Fallback): Repeat = JobHeight. Length = (Qty / UpsAcross) * (JobHeight).
     *   (Ignoring UpsAround in divisor because JobHeight is per 1-Up height).
     */
    calculateRequirements: (inputs: CalculatorInputs): CalculatorResults => {
        const {
            orderQty,
            upsAcross,
            upsAround,
            jobHeightMM,
            rollWidthMM,
            rollGSM,
            tool
        } = inputs;

        // CRITICAL VALIDATION: Prevent silent zero-cost failures
        if (orderQty <= 0) {
            throw new Error("CRITICAL: Order Qty must be greater than zero.");
        }
        if (rollGSM <= 0) {
            throw new Error("CRITICAL: Roll GSM is zero or invalid. Material cost will be zero.");
        }
        if (rollWidthMM <= 0) {
            throw new Error("CRITICAL: Roll Width is zero or invalid. Cannot calculate area.");
        }
        if (jobHeightMM <= 0) {
            throw new Error("CRITICAL: Job Height must be greater than zero.");
        }

        // 1. Total Ups
        const totalUps = (upsAcross || 1) * (upsAround || 1);

        if (totalUps <= 0) {
            throw new Error("CRITICAL: Total Ups must be greater than zero.");
        }

        // 2. Base Running Meter Calculation
        let baseRM = 0;

        if (tool && tool.circumferenceMM > 0) {
            // Rotary / Cylinder Logic:
            // One full rotation produces 'totalUps' items.
            // Length = (Qty / TotalUps) * Circumference
            const oneRepeatMtr = tool.circumferenceMM / 1000;
            baseRM = (orderQty / totalUps) * oneRepeatMtr;
        } else {
            // Fallback / Flat Logic (Job Height based):
            // Formula: (Q / Uₜ) × (H / 1000)
            // FIXED: Was using upsAcross, now correctly uses totalUps per spec
            const rowCount = orderQty / totalUps;
            baseRM = rowCount * (jobHeightMM / 1000);
        }

        // 3. Base Conversions
        const baseSqMtr = (baseRM * rollWidthMM) / 1000;
        const baseKg = (baseSqMtr * rollGSM) / 1000;

        // 4. Wastage Logic
        // Priority: If wastageRM is provided (user manual entry), use it to calc %.
        // Else use wastagePercent.
        let wasteRM = inputs.wastageRM || 0;
        let wastePct = inputs.wastagePercent || 0;

        if (inputs.wastageRM > 0) {
            // Backward calc percent
            wastePct = baseRM > 0 ? (wasteRM / baseRM) * 100 : 0;
        } else {
            // Forward calc RM
            wasteRM = (baseRM * wastePct) / 100;
        }

        // 5. Grand Totals
        const totalRM = baseRM + wasteRM;
        const totalSqMtr = rollWidthMM > 0 ? (totalRM * rollWidthMM) / 1000 : 0;
        const totalKg = (totalSqMtr * rollGSM) / 1000;

        return {
            totalUps,
            baseRunningMtr: parseFloat(baseRM.toFixed(4)),
            baseSqMtr: parseFloat(baseSqMtr.toFixed(4)),
            baseKg: parseFloat(baseKg.toFixed(4)),
            totalRunningMtr: parseFloat(totalRM.toFixed(4)),
            totalSqMtr: parseFloat(totalSqMtr.toFixed(4)),
            totalKg: parseFloat(totalKg.toFixed(4)),
            wastageRM: parseFloat(wasteRM.toFixed(4)),
            wastagePercent: parseFloat(wastePct.toFixed(2))
        };
    },

    /**
     * Calculates Process Cost for a single process based on rate type.
     * Respects manual overrides - if user edited quantity or rate, we don't override it.
     */
    calculateProcessCost: (
        proc: any, // Process object from schema
        totals: { totalKg: number; totalRM: number; totalSqMtr: number; orderQty: number; colors: number; sizeW: number; sizeL: number }
    ): { quantity: number; rate: number; amount: number; isManualQuantity?: boolean; isManualRate?: boolean } => {
        const { totalKg, totalRM, totalSqMtr, orderQty, colors, sizeW, sizeL } = totals;
        const sizeW_Inch = sizeW / 25.4;
        const sizeL_Inch = sizeL / 25.4;

        // If user manually edited quantity, use their value. Otherwise calculate from formula.
        let finalQuantity = proc.quantity || 0;
        if (!proc.isManualQuantity) {
            let calculatedQty = -1;

            switch (proc.rateType) {
                case "Per KG":
                case "Rate/Kg":
                    calculatedQty = totalKg;
                    break;
                case "Per RM":
                case "Rate/Meter":
                case "Rate/Running Mtr":
                    calculatedQty = totalRM;
                    break;
                case "Per Sq.Mtr":
                case "Rate/Sq.Meter":
                    calculatedQty = totalSqMtr;
                    break;
                case "Rate/Color":
                    calculatedQty = colors;
                    break;
                case "Rate/Sq.Inch/Color":
                    calculatedQty = colors * sizeW_Inch * sizeL_Inch * orderQty;
                    break;
                case "Rate/Sq.Inch/Unit":
                    calculatedQty = orderQty * sizeW_Inch * sizeL_Inch;
                    break;
                case "Rate/Sq.Inch":
                    calculatedQty = sizeW_Inch * sizeL_Inch * orderQty;
                    break;
                case "Rate/Unit":
                case "Rate/Order Quantity":
                    calculatedQty = orderQty;
                    break;
                case "Per 1000 Ups":
                case "Rate/1000 Units":
                    calculatedQty = Math.ceil(orderQty / 1000) * 1000;
                    break;
                case "Rate/Job":
                    calculatedQty = 1;
                    break;
                case "Rate/Inch/Unit":
                    calculatedQty = sizeL_Inch * orderQty;
                    break;
                case "Rate/Sq.CM":
                    calculatedQty = (sizeW / 10) * (sizeL / 10) * orderQty;
                    break;
            }

            if (calculatedQty >= 0) {
                finalQuantity = parseFloat(calculatedQty.toFixed(4));
            }
        }

        // If user manually edited rate, use their value. Otherwise use process master rate.
        const finalRate = proc.isManualRate ? (proc.rate || 0) : (proc.rate || 0);

        // Calculate amount: quantity × rate (NO setup charges as per user request)
        let rateMultiplier = finalRate;
        if (proc.rateType === "Rate/1000 Units" || proc.rateType === "Per 1000 Ups") {
            rateMultiplier = rateMultiplier / 1000;
        }
        const amount = parseFloat((finalQuantity * rateMultiplier).toFixed(2));

        return {
            quantity: finalQuantity,
            rate: finalRate,
            amount,
            isManualQuantity: proc.isManualQuantity || false,
            isManualRate: proc.isManualRate || false
        };
    },

    /**
     * Calculates Grand Totals (Job Cost, Unit Cost)
     */
    calculateFinancials: (
        materialCost: number,
        processCosts: ProcessCost[],
        additionalCostAmount: number,
        orderQty: number,
        gstPercent: number = 0
    ) => {
        const totalProcessCost = processCosts.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalJobCost = materialCost + totalProcessCost + additionalCostAmount;

        // GST Calculation
        const gstAmount = (totalJobCost * gstPercent) / 100;
        const finalPriceWithGST = totalJobCost + gstAmount;

        const unitCost = orderQty > 0 ? finalPriceWithGST / orderQty : 0;

        return {
            totalProcessCost: parseFloat(totalProcessCost.toFixed(2)),
            totalJobCost: parseFloat(totalJobCost.toFixed(2)),
            gstAmount: parseFloat(gstAmount.toFixed(2)),
            finalPriceWithGST: parseFloat(finalPriceWithGST.toFixed(2)),
            unitCost: parseFloat(unitCost.toFixed(2))
        };
    }
};
