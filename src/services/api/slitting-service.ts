import { SlittingInputRoll, SlittingOutputRoll } from "@/types/jumbo-slitting";
import { GRNItem } from "@/types/grn-master";
import { RollMaster, ItemType } from "@/types/roll-master";
import { StockItem } from "@/types/stock-master";
import { rollStorage } from "../storage/roll-storage";
import { grnStorage } from "../storage/grn-storage";
import { stockStorage } from "../storage/stock-storage";

export const slittingService = {
    /**
     * Calculate output roll specifications based on width ratio
     */
    calculateOutputRoll: (
        inputRoll: SlittingInputRoll,
        outputWidth: number,
        index: number,
        // Optional override for process RM, defaults to full input RM
        processRMOverride?: number
    ): SlittingOutputRoll => {
        // Validation
        if (outputWidth <= 0 || inputRoll.inputWidth <= 0) {
            throw new Error("Width values must be positive");
        }

        // ⭐ CHANGED: Output RM is derived from the "Process Length" (Run Length)
        // If we are running 500m of a 1000m roll, the child roll length is 500m.
        // It is NOT proportional to width ratio.
        const outputRM = processRMOverride ?? inputRoll.inputProcessRM ?? inputRoll.inputRM;

        // Calculate Kg based on Type
        // If Type is Film, we try to use Thickness/Density if available
        const outputKg = slittingService.calculateKgFromMtr(
            outputRM,
            outputWidth,
            inputRoll.inputGSM,
            inputRoll.itemType,
            inputRoll.inputThickness,
            inputRoll.inputDensity
        );

        // Recalculate SqMtr for consistency
        const outputSqMtr = (outputRM * outputWidth) / 1000;

        // Generate output item name
        const itemName = `${inputRoll.itemName} ${outputWidth}mm`;

        // Batch number (will be updated with actual job ID after save)
        const batchNo = `${inputRoll.batchNo}-SL${(index + 1).toString().padStart(2, '0')}`;

        return {
            outputWidth,
            outputGSM: inputRoll.inputGSM,
            outputFaceGSM: inputRoll.inputFaceGSM,
            outputReleaseGSM: inputRoll.inputReleaseGSM,
            outputAdhesiveGSM: inputRoll.inputAdhesiveGSM,
            outputRM: Math.round(outputRM * 100) / 100,
            outputSqMtr: Math.round(outputSqMtr * 100) / 100,
            outputKg: Math.round(outputKg * 100) / 100,
            batchNo,
            itemCode: inputRoll.itemCode,
            itemName,
            itemType: inputRoll.itemType,
            quality: inputRoll.quality,
        };
    },

    /**
     * Calculate wastage from input and output rolls
     */
    calculateWastage: (
        inputRoll: SlittingInputRoll,
        outputRolls: SlittingOutputRoll[]
    ): { wastageKg: number; wastageRM: number; wastageSqMtr: number } => {
        const totalOutputKg = outputRolls.reduce((sum, roll) => sum + roll.outputKg, 0);
        const totalOutputRM = outputRolls.reduce((sum, roll) => sum + roll.outputRM, 0);
        const totalOutputSqMtr = outputRolls.reduce((sum, roll) => sum + roll.outputSqMtr, 0);

        // ⭐ CHANGED: Calculate Input Kg USED based on Process RM
        // We cannot use inputRoll.inputKg directly if we are only processing a part of it.
        const processRM = inputRoll.inputProcessRM ?? inputRoll.inputRM;

        const inputKgUsed = slittingService.calculateKgFromMtr(
            processRM,
            inputRoll.inputWidth,
            inputRoll.inputGSM,
            inputRoll.itemType,
            inputRoll.inputThickness,
            inputRoll.inputDensity
        );

        const inputSqMtrUsed = (processRM * inputRoll.inputWidth) / 1000;

        const wastageKg = Math.round((inputKgUsed - totalOutputKg) * 100) / 100;
        // Wastage RM is not very meaningful in constant-RM logic (it's usually 0 unless length loss), 
        // but we can track if there is length loss. For now, assuming width wastage mainly.
        // Actually, if outputs are same length as input, wastageRM is 0. 
        // If we want to track width wastage in RM terms? No, standard is usually Kg / SqMtr.
        const wastageRM = Math.round((processRM - totalOutputRM) * 100) / 100; // This will likely be very negative if multiple rolls? 
        // WAIT: totalOutputRM = sum(outputRM). If we have 2 rolls of 500m from 1 roll of 500m, total output RM is 1000m. 
        // This metric (Wastage RM) is confusing in this context. 
        // Better to set it to 0 or leave as distinct metric? 
        // Let's keep specific formula: Wastage RM is usually "Edge Trim Length".
        // But here we will just mark it as 0 for now to avoid confusion unless explicitly derived.

        const wastageSqMtr = Math.round((inputSqMtrUsed - totalOutputSqMtr) * 100) / 100;

        return {
            wastageKg: wastageKg > 0 ? wastageKg : 0,
            wastageRM: 0, // In constant-length slitting, length usually doesn't waste (width wastes).
            wastageSqMtr: wastageSqMtr > 0 ? wastageSqMtr : 0,
        };
    },

    /**
     * Calculate Wastage RM and SqMtr from manually entered Kg
     * Reverse calculation: 
     * SqMtr = (Kg * 1000) / GSM
     * RM = (SqMtr * 1000) / Width
     */
    calculateWastageFromKg: (
        wastageKg: number,
        inputRoll: SlittingInputRoll
    ): { wastageRM: number; wastageSqMtr: number } => {
        if (wastageKg <= 0 || !inputRoll.inputGSM || !inputRoll.inputWidth) {
            return { wastageRM: 0, wastageSqMtr: 0 };
        }

        // SqMtr = (Kg * 1000) / GSM
        const wastageSqMtr = (wastageKg * 1000) / inputRoll.inputGSM;

        // RM = (SqMtr * 1000) / Width
        const wastageRM = (wastageSqMtr * 1000) / inputRoll.inputWidth;

        return {
            wastageRM: Math.round(wastageRM * 100) / 100,
            wastageSqMtr: Math.round(wastageSqMtr * 100) / 100
        };
    },

    /**
     * Calculate Wastage Kg and SqMtr from manually entered RM
     * SqMtr = (RM * Width) / 1000
     * Kg = (SqMtr * GSM) / 1000
     */
    calculateWastageFromRM: (
        wastageRM: number,
        inputRoll: SlittingInputRoll
    ): { wastageKg: number; wastageSqMtr: number } => {
        if (wastageRM <= 0 || !inputRoll.inputWidth || !inputRoll.inputGSM) {
            return { wastageKg: 0, wastageSqMtr: 0 };
        }

        // SqMtr = (RM * Width) / 1000
        const wastageSqMtr = (wastageRM * inputRoll.inputWidth) / 1000;

        // Kg = (SqMtr * GSM) / 1000
        const wastageKg = (wastageSqMtr * inputRoll.inputGSM) / 1000;

        return {
            wastageKg: Math.round(wastageKg * 100) / 100,
            wastageSqMtr: Math.round(wastageSqMtr * 100) / 100
        };
    },

    /**
     * Calculate Wastage Kg and RM from manually entered SqMtr
     * RM = (SqMtr * 1000) / Width
     * Kg = (SqMtr * GSM) / 1000
     */
    calculateWastageFromSqMtr: (
        wastageSqMtr: number,
        inputRoll: SlittingInputRoll
    ): { wastageKg: number; wastageRM: number } => {
        if (wastageSqMtr <= 0 || !inputRoll.inputWidth || !inputRoll.inputGSM) {
            return { wastageKg: 0, wastageRM: 0 };
        }

        // RM = (SqMtr * 1000) / Width
        const wastageRM = (wastageSqMtr * 1000) / inputRoll.inputWidth;

        // Kg = (SqMtr * GSM) / 1000
        const wastageKg = (wastageSqMtr * inputRoll.inputGSM) / 1000;

        return {
            wastageKg: Math.round(wastageKg * 100) / 100,
            wastageRM: Math.round(wastageRM * 100) / 100
        };
    },

    /**
     * Validate total output width doesn't exceed input width
     * Allows partial slitting (output width < input width)
     */
    validateOutputWidths: (inputWidth: number, outputWidths: number[]): {
        isValid: boolean;
        totalWidth: number;
        message?: string;
        warningMessage?: string;
    } => {
        const totalWidth = outputWidths.reduce((sum, w) => sum + w, 0);

        // Only reject if total output EXCEEDS input
        if (totalWidth > inputWidth) {
            return {
                isValid: false,
                totalWidth,
                message: `Total output width (${totalWidth}mm) exceeds input width (${inputWidth}mm)`
            };
        }

        // Warn if there's significant unused width (more than 10%)
        const unusedWidth = inputWidth - totalWidth;
        const unusedPercentage = (unusedWidth / inputWidth) * 100;

        if (unusedPercentage > 10) {
            return {
                isValid: true,
                totalWidth,
                warningMessage: `${unusedWidth}mm width unused (${unusedPercentage.toFixed(1)}% wastage)`
            };
        }

        return {
            isValid: true,
            totalWidth
        };
    },

    /**
     * ⭐ NEW: Calculate totals for a cutting plan
     * Calculates totalWidth, totalRM, totalKg based on width × quantity
     */
    calculateCuttingPlanTotals: (
        plan: { width: number; quantity: number },
        inputRoll: SlittingInputRoll
    ): { totalWidth: number; totalRM: number; totalKg: number } => {
        // Validation
        if (plan.width <= 0 || plan.quantity <= 0) {
            return { totalWidth: 0, totalRM: 0, totalKg: 0 };
        }

        // Total width used = width × quantity
        const totalWidth = plan.width * plan.quantity;

        // ⭐ CHANGED: Total RM is NOT proportional. 
        // It is simply the Run Length (Process RM) * Quantity of rolls
        const processRM = inputRoll.inputProcessRM ?? inputRoll.inputRM;
        const totalRM = processRM * plan.quantity;

        // Calculate Weight for ONE roll
        const kgPerRoll = slittingService.calculateKgFromMtr(
            processRM,
            plan.width,
            inputRoll.inputGSM,
            inputRoll.itemType,
            inputRoll.inputThickness,
            inputRoll.inputDensity
        );

        const totalKg = kgPerRoll * plan.quantity;

        return {
            totalWidth: Math.round(totalWidth * 100) / 100,
            totalRM: Math.round(totalRM * 100) / 100,
            totalKg: Math.round(totalKg * 100) / 100,
        };
    },

    /**
     * ⭐ NEW: Validate cutting plans against mother roll width
     * Ensures sum(width × quantity) ≤ mother roll width
     */
    validateCuttingPlans: (
        inputWidth: number,
        cuttingPlans: Array<{ width: number; quantity: number; totalWidth: number }>
    ): {
        isValid: boolean;
        totalUsedWidth: number;
        calculation: string;
        message?: string;
        warningMessage?: string;
    } => {
        // Calculate total used width
        const totalUsedWidth = cuttingPlans.reduce((sum, plan) => sum + plan.totalWidth, 0);

        // Build calculation string: (250×2) + (200×2) = 900mm
        const calculation = cuttingPlans
            .map(plan => `(${plan.width}×${plan.quantity})`)
            .join(" + ") + ` = ${totalUsedWidth}mm`;

        // Validation: total used width must not exceed input width
        if (totalUsedWidth > inputWidth) {
            return {
                isValid: false,
                totalUsedWidth,
                calculation,
                message: `Total width ${totalUsedWidth}mm exceeds mother roll width ${inputWidth}mm`
            };
        }

        // Perfect match (100% utilization)
        if (totalUsedWidth === inputWidth) {
            return {
                isValid: true,
                totalUsedWidth,
                calculation,
                message: `Perfect match! 100% width utilization`
            };
        }

        // Partial utilization - warn if > 10% wastage
        const unusedWidth = inputWidth - totalUsedWidth;
        const unusedPercentage = (unusedWidth / inputWidth) * 100;

        if (unusedPercentage > 10) {
            return {
                isValid: true,
                totalUsedWidth,
                calculation,
                warningMessage: `${unusedWidth}mm width unused (${unusedPercentage.toFixed(1)}% wastage)`
            };
        }

        return {
            isValid: true,
            totalUsedWidth,
            calculation
        };
    },

    /**
     * ⭐ NEW: Expand cutting plans to individual output rolls
     * Converts { width: 250, qty: 2 } into 2 separate SlittingOutputRoll objects
     */
    expandCuttingPlansToOutputRolls: (
        cuttingPlans: Array<{ width: number; quantity: number }>,
        inputRoll: SlittingInputRoll
    ): SlittingOutputRoll[] => {
        const outputRolls: SlittingOutputRoll[] = [];
        let globalIndex = 0;

        cuttingPlans.forEach((plan) => {
            // Create 'quantity' number of rolls with same width
            for (let i = 0; i < plan.quantity; i++) {
                const outputRoll = slittingService.calculateOutputRoll(
                    inputRoll,
                    plan.width,
                    globalIndex
                );
                outputRolls.push(outputRoll);
                globalIndex++;
            }
        });

        return outputRolls;
    },

    /**
     * Convert GRN Item to Slitting Input Roll
     */
    convertGRNItemToInputRoll: (grnItem: GRNItem & { grnId: string; rollMasterId?: string }): SlittingInputRoll => {
        // Get Roll Master to fetch GSM values and other properties
        let rollMaster: RollMaster | undefined;
        if (grnItem.rollMasterId) {
            rollMaster = rollStorage.getById(grnItem.rollMasterId);
        }

        // Use Roll Master itemName as fallback if GRN itemName is "unknown" or empty
        const itemName = (grnItem.itemName && grnItem.itemName !== "unknown")
            ? grnItem.itemName
            : (rollMaster?.itemName || grnItem.itemName);

        return {
            grnItemId: grnItem.id,
            grnId: grnItem.grnId,
            rollMasterId: grnItem.rollMasterId || "",
            itemCode: grnItem.itemCode,
            itemName: itemName,
            batchNo: grnItem.batchNo,
            inputWidth: grnItem.rollWidth || rollMaster?.rollWidthMM || 0,
            inputGSM: grnItem.rollGSM || rollMaster?.totalGSM || 0,
            inputFaceGSM: rollMaster?.faceGSM,
            inputReleaseGSM: rollMaster?.releaseGSM,
            inputAdhesiveGSM: rollMaster?.adhesiveGSM,
            inputRM: grnItem.receivedRM || 0,
            inputSqMtr: grnItem.receivedSqMtr || 0,
            inputKg: grnItem.receivedKg || grnItem.receivedQty || 0,
            itemType: rollMaster?.itemType || "Film",
            quality: rollMaster?.quality,
            uom: grnItem.uom,
            // Map Film Properties
            inputThickness: rollMaster?.thicknessMicron,
            inputDensity: rollMaster?.density,
            inputProcessRM: grnItem.receivedRM || 0, // Default to full roll
        };
    },

    /**
     * Find existing Roll Master or create new one (Auto-creation logic)
     * Match on: Width + GSM (all 3 types) + Item Name + Material Type
     */
    findOrCreateRollMaster: (
        outputRoll: SlittingOutputRoll,
        inputRollMaster: RollMaster
    ): RollMaster => {
        const allRolls = rollStorage.getAll();

        // Match logic: Width + GSM (all 3 types) + Item Name + Material Type
        const existingRoll = allRolls.find(r =>
            r.rollWidthMM === outputRoll.outputWidth &&
            r.totalGSM === outputRoll.outputGSM &&
            (r.faceGSM === outputRoll.outputFaceGSM || (!r.faceGSM && !outputRoll.outputFaceGSM)) &&
            (r.releaseGSM === outputRoll.outputReleaseGSM || (!r.releaseGSM && !outputRoll.outputReleaseGSM)) &&
            (r.adhesiveGSM === outputRoll.outputAdhesiveGSM || (!r.adhesiveGSM && !outputRoll.outputAdhesiveGSM)) &&
            r.itemName === inputRollMaster.itemName &&
            r.itemType === inputRollMaster.itemType
        );

        if (existingRoll) {
            return existingRoll;
        }

        // Create new Roll Master entry
        const newRollData = {
            itemType: inputRollMaster.itemType,
            itemCode: `${inputRollMaster.itemCode}-${outputRoll.outputWidth}MM`,
            itemName: inputRollMaster.itemName,
            supplierItemCode: inputRollMaster.supplierItemCode,
            mill: inputRollMaster.mill,
            quality: inputRollMaster.quality,
            rollWidthMM: outputRoll.outputWidth, // Override width
            thicknessMicron: inputRollMaster.thicknessMicron,
            density: inputRollMaster.density,
            faceGSM: outputRoll.outputFaceGSM,
            releaseGSM: outputRoll.outputReleaseGSM,
            adhesiveGSM: outputRoll.outputAdhesiveGSM,
            totalGSM: outputRoll.outputGSM,
            shelfLifeDays: inputRollMaster.shelfLifeDays,
            purchaseUnit: inputRollMaster.purchaseUnit,
            stockUnit: inputRollMaster.stockUnit,
            purchaseRate: inputRollMaster.purchaseRate,
            hsnCode: inputRollMaster.hsnCode,
            location: inputRollMaster.location,
            supplierName: inputRollMaster.supplierName,
        };

        const savedRoll = rollStorage.save(newRollData);
        return savedRoll;
    },

    /**
     * Get inventory count per Roll Master (for Step 1 display)
     * Matches by itemCode and width (relaxed matching)
     * ⭐ UPDATED: Now includes both GRN items AND stock items
     */
    getInventoryCountByRollMaster: (rollMasterId: string): number => {
        const rollMaster = rollStorage.getById(rollMasterId);
        if (!rollMaster) return 0;

        let count = 0;

        // 1. Count from GRN storage
        const allGRNs = grnStorage.getAll();
        allGRNs.forEach(grn => {
            grn.items.forEach(item => {
                // Relaxed matching - check itemCode and width (if available)
                const matchesItem = item.itemCode === rollMaster.itemCode;
                // If rollWidth is undefined/null in GRN, skip width check
                const matchesWidth = !item.rollWidth || item.rollWidth === rollMaster.rollWidthMM;

                if (matchesItem && matchesWidth) {
                    const remainingQty = item.remainingQty ?? item.receivedQty ?? 0;
                    if (remainingQty > 0) {
                        count++;
                    }
                }
            });
        });

        // 2. Count from Stock storage (slitting outputs and other stock)
        const allStock = stockStorage.getAll();
        allStock.forEach(stockItem => {
            const matchesItem = stockItem.itemCode === rollMaster.itemCode;
            const matchesWidth = !stockItem.widthMM || stockItem.widthMM === rollMaster.rollWidthMM;

            if (matchesItem && matchesWidth && stockItem.status === "In-Stock" && stockItem.category === "Roll") {
                const remainingQty = stockItem.weightKg || stockItem.quantity || 0;
                if (remainingQty > 0) {
                    count++;
                }
            }
        });

        return count;
    },

    /**
     * ⭐ NEW: Get total inventory stock quantity and UOM for Roll Master
     * Returns actual stock quantity in the Roll Master's stock unit
     */
    getInventoryStockByRollMaster: (rollMasterId: string): { totalStock: number; uom: string } => {
        const rollMaster = rollStorage.getById(rollMasterId);
        if (!rollMaster) return { totalStock: 0, uom: 'Kg' };

        let totalStock = 0;
        const uom = rollMaster.stockUnit || 'Kg';

        // 1. Sum from GRN storage
        const allGRNs = grnStorage.getAll();
        allGRNs.forEach(grn => {
            grn.items.forEach(item => {
                const matchesItem = item.itemCode === rollMaster.itemCode;
                const matchesWidth = !item.rollWidth || item.rollWidth === rollMaster.rollWidthMM;

                if (matchesItem && matchesWidth) {
                    const remainingQty = item.remainingQty ?? item.receivedQty ?? 0;
                    if (remainingQty > 0) {
                        totalStock += remainingQty;
                    }
                }
            });
        });

        // 2. Sum from Stock storage
        const allStock = stockStorage.getAll();
        allStock.forEach(stockItem => {
            const matchesItem = stockItem.itemCode === rollMaster.itemCode;
            const matchesWidth = !stockItem.widthMM || stockItem.widthMM === rollMaster.rollWidthMM;

            if (matchesItem && matchesWidth && stockItem.status === "In-Stock" && stockItem.category === "Roll") {
                const remainingQty = stockItem.weightKg || stockItem.quantity || 0;
                if (remainingQty > 0) {
                    totalStock += remainingQty;
                }
            }
        });

        return {
            totalStock: Math.round(totalStock * 100) / 100,
            uom
        };
    },

    /**
     * Get GRN items by Roll Master ID (for Step 2 batch selection)
     * ⭐ RECURSIVE SLITTING: Shows rolls <= selected width for re-slitting
     * Example: If selected 1200mm Roll Master, shows 1200mm, 1000mm, 800mm, etc.
     */
    getGRNItemsByRollMaster: (rollMasterId: string): (GRNItem & { grnId: string; rollMasterId: string })[] => {
        const rollMaster = rollStorage.getById(rollMasterId);
        if (!rollMaster) return [];

        const items: (GRNItem & { grnId: string; rollMasterId: string })[] = [];
        const selectedWidth = rollMaster.rollWidthMM;

        // 1. Get items from GRN storage
        const allGRNs = grnStorage.getAll();
        allGRNs.forEach(grn => {
            grn.items.forEach(item => {
                // ⭐ CHANGED: Match rolls with width <= selected width (recursive slitting)
                // Also check same itemType/quality for compatibility
                const itemWidth = item.rollWidth || 0;

                // Include if:
                // - itemCode matches OR itemName matches (for compatibility)
                // - width is <= selected width (allows recursive slitting)
                // - has remaining stock
                const itemCodeMatches = item.itemCode.includes(rollMaster.itemCode.split('-')[0]); // Base code match
                const itemNameMatches = item.itemName && rollMaster.itemName &&
                    item.itemName.toLowerCase().includes(rollMaster.itemName.toLowerCase().split(' ')[0]);

                const matchesItem = itemCodeMatches || itemNameMatches;
                const matchesWidth = !item.rollWidth || (itemWidth > 0 && itemWidth <= selectedWidth);

                if (matchesItem && matchesWidth) {
                    const remainingQty = item.remainingQty ?? item.receivedQty ?? 0;
                    if (remainingQty > 0) {
                        items.push({
                            ...item,
                            grnId: grn.id,
                            rollMasterId: rollMasterId
                        });
                    }
                }
            });
        });

        // 2. Get items from Stock storage (slitting outputs and other stock)
        const allStock = stockStorage.getAll();
        allStock.forEach(stockItem => {
            // ⭐ CHANGED: Include stock items with width <= selected width
            const stockWidth = stockItem.widthMM || 0;

            // Match by itemCode base or itemName (for previously slit rolls)
            const itemCodeMatches = stockItem.itemCode.includes(rollMaster.itemCode.split('-')[0]);
            const itemNameMatches = stockItem.itemName && rollMaster.itemName &&
                stockItem.itemName.toLowerCase().includes(rollMaster.itemName.toLowerCase().split(' ')[0]);

            const matchesItem = itemCodeMatches || itemNameMatches;
            const matchesWidth = !stockItem.widthMM || (stockWidth > 0 && stockWidth <= selectedWidth);

            if (matchesItem && matchesWidth && stockItem.status === "In-Stock" && stockItem.category === "Roll") {
                const remainingQty = stockItem.weightKg || stockItem.quantity || 0;
                if (remainingQty > 0) {
                    // Convert StockItem to GRNItem format for compatibility
                    const grnItemFromStock: GRNItem & { grnId: string; rollMasterId: string } = {
                        id: stockItem.id,
                        poId: stockItem.poId || "",
                        poItemId: "",
                        itemCode: stockItem.itemCode,
                        itemName: stockItem.itemName,
                        orderedQty: 0,
                        uom: stockItem.uom,
                        receivedQty: stockItem.quantity,
                        receivedRM: stockItem.runningMtr,
                        receivedSqMtr: stockItem.sqMtr,
                        receivedKg: stockItem.weightKg,
                        rollWidth: stockItem.widthMM,
                        rollGSM: stockItem.gsm,
                        batchNo: stockItem.batchNo,
                        remainingQty: remainingQty,
                        status: 'Available',
                        grnId: stockItem.grnId || "STOCK",
                        rollMasterId: rollMasterId
                    };
                    items.push(grnItemFromStock);
                }
            }
        });

        // Sort by width descending (largest rolls first)
        return items.sort((a, b) => (b.rollWidth || 0) - (a.rollWidth || 0));
    },

    /**
     * ⭐ NEW: Calculate Kg from Mtr using legacy formulas
     * Matches logic from legacy JumboRollSlitting.js
     */
    calculateKgFromMtr: (
        mtr: number,
        widthMm: number,
        gsm: number,
        itemType: string,
        thicknessMicron: number = 0,
        density: number = 0
    ): number => {
        if (!mtr || !widthMm) return 0;

        // Formula 1: Paper / Sticker (Standard)
        // Kg = ((Mtr * (Width / 1000)) * GSM) / 1000
        if (itemType === "Paper" || itemType === "Sticker" || !itemType || itemType === "Film") {
            // NOTE: Legacy code treats "ROLL" or "REEL" group same as Paper formula usually
            // But for Lamination Film it uses specific density formula.
            // We will check if density is provided to distinguish.

            if (itemType === "Film" && thicknessMicron > 0 && density > 0) {
                // Formula 2: Lamination Film
                // Kg = Mtr * ((Thickness / 1000000) * (Width / 1000) * (Density * 1000))
                // Simplified: Mtr * Thickness * Width * Density / 1000000
                // Legacy: let LFinKG = ConQty * ((Thickness / 1000000) * (SizeW / 1000) * (Density * 1000))
                return mtr * ((thicknessMicron / 1000000) * (widthMm / 1000) * (density * 1000));
            }

            // Default / Paper Formula
            const sqMtr = (mtr * widthMm) / 1000;
            return (sqMtr * gsm) / 1000;
        }

        return 0;
    },

    /**
     * ⭐ NEW: Calculate Mtr from Kg using legacy formulas
     */
    calculateMtrFromKg: (
        kg: number,
        widthMm: number,
        gsm: number,
        itemType: string,
        thicknessMicron: number = 0,
        density: number = 0
    ): number => {
        if (!kg || !widthMm) return 0;

        if (itemType === "Film" && thicknessMicron > 0 && density > 0) {
            // Formula: Mtr = Kg / ((Thickness / 1000000) * (Width / 1000) * (Density * 1000))
            const factor = ((thicknessMicron / 1000000) * (widthMm / 1000) * (density * 1000));
            if (factor === 0) return 0;
            return kg / factor;
        }

        // Default / Paper Formula
        // Mtr = (Kg * 1000) / ((Width / 1000) * GSM)
        if (gsm === 0) return 0;
        return (kg * 1000) / ((widthMm / 1000) * gsm);
    },

    /**
     * Auto-find or create a Roll Master for Output Rolls
     */
    findOrCreateChildRollMaster: (
        widthMM: number,
        parentRoll: SlittingInputRoll | RollMaster
    ): RollMaster => {
        const allRolls = rollStorage.getAll();

        // Match Criteria: Type, GSM, Width
        const inputGSM = 'inputGSM' in parentRoll
            ? parentRoll.inputGSM
            : (parentRoll as RollMaster).totalGSM || 0;

        const existing = allRolls.find(r =>
            r.itemType === parentRoll.itemType &&
            Math.abs((r.totalGSM || 0) - inputGSM) < 1 &&
            r.rollWidthMM === widthMM
        );

        if (existing) return existing;

        // Auto-Create Logic
        let baseName = parentRoll.itemName.replace(/\s-\s\d+mm.*$/, '').trim();

        const newItemName = `${baseName} - ${widthMM}mm (Cut)`;

        const newMaster: RollMaster = {
            id: `RM-AUTO-${Date.now()}-${widthMM}`,
            itemCode: `AUTO-${widthMM}-${Math.floor(Math.random() * 1000)}`,
            itemName: newItemName,
            itemType: parentRoll.itemType as ItemType, // Cast string to ItemType (Validation handled upstream)
            totalGSM: inputGSM,
            rollWidthMM: widthMM,
            // Inherit from parent if possible
            thicknessMicron: 'inputThickness' in parentRoll ? parentRoll.inputThickness : (parentRoll as RollMaster).thicknessMicron,
            density: 'inputDensity' in parentRoll ? parentRoll.inputDensity : (parentRoll as RollMaster).density,
            purchaseUnit: 'Kg',
            stockUnit: 'Kg',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        rollStorage.save(newMaster);
        return newMaster;
    },

    /**
     * Generate QR code data for output roll
     */
    generateQRCodeData: (batchNo: string, slittingJobId: string, outputRoll: SlittingOutputRoll): string => {
        return JSON.stringify({
            type: "SLITTING_OUTPUT",
            batch: batchNo,
            slittingJob: slittingJobId,
            width: outputRoll.outputWidth,
            gsm: outputRoll.outputGSM,
            weight: outputRoll.outputKg,
            timestamp: new Date().toISOString()
        });
    },
};
