import { z } from "zod";

// ============================================
// INTERFACES
// ============================================

export interface SlittingInputRoll {
    grnItemId: string;          // Link to GRN Item
    grnId: string;              // Parent GRN ID for stock update
    rollMasterId: string;       // Link to Roll Master (for matching)
    itemCode: string;
    itemName: string;
    batchNo: string;

    // Input Specs
    inputWidth: number;         // MM
    inputGSM: number;           // Total GSM
    inputFaceGSM?: number;      // Face layer GSM
    inputReleaseGSM?: number;   // Release layer GSM
    inputAdhesiveGSM?: number;  // Adhesive layer GSM
    inputRM: number;            // Running Meter
    inputSqMtr: number;         // Square Meter
    inputKg: number;            // Weight

    itemType: string;           // "Film" | "Paper"
    quality?: string;           // Material quality/grade

    uom: string;                // Usually "Kg"

    // Process Specs (Partial Consumption)
    inputProcessRM?: number;     // How much length is actually processed
    inputThickness?: number;     // Micron (needed for Film calc)
    inputDensity?: number;       // Density (needed for Film calc)
}

// ⭐ Cutting Plan - User specifies width + quantity for batch creation
export interface CuttingPlan {
    id: string;                 // Unique ID for form array management
    width: number;              // MM (User enters)
    quantity: number;           // How many rolls of this width (User enters)

    // Auto-Calculated (for display)
    totalWidth: number;         // width × quantity (for validation display)
    totalRM: number;            // Proportional RM for all rolls
    totalKg: number;            // Proportional Kg for all rolls
    childRollMasterId?: string; // Selected Output Item Master ID
    childItemName?: string;     // Selected Output Item Name
}

export interface SlittingOutputRoll {
    slittingJobId?: string;     // Parent slitting job (set after save)
    rollMasterId?: string;      // Link to Roll Master (auto-created or matched)

    // Output Specs (User Input)
    outputWidth: number;        // MM (User enters)

    // Inherited from Input
    outputGSM: number;          // Same as input totalGSM
    outputFaceGSM?: number;     // Same as input
    outputReleaseGSM?: number;  // Same as input
    outputAdhesiveGSM?: number; // Same as input

    // Auto-Calculated
    outputRM: number;           // Auto: Proportional to width
    outputSqMtr: number;        // Auto: (RM × Width) / 1000
    outputKg: number;           // Auto: (SqMtr × GSM) / 1000

    // Stock Details
    batchNo: string;            // Auto: {parentBatch}-SL{index}
    itemCode: string;           // Same as input
    itemName: string;           // Modified: "{inputName} {width}mm"
    itemType: string;           // "Film" | "Paper"
    quality?: string;

    // QR Code
    qrCodeData?: string;        // JSON string for QR code

    remarks?: string;
}

export interface SlittingJob {
    id: string;                 // SL00001/25-26
    slittingDate: string;       // ISO String

    // Input
    inputRoll: SlittingInputRoll;

    // Outputs (Multiple)
    outputRolls: SlittingOutputRoll[];

    // Wastage
    wastageKg: number;          // Auto-calculated
    wastageRM?: number;         // Optional
    wastageSqMtr?: number;      // Optional
    wastageRemarks?: string;

    // Metadata
    operatorName?: string;
    machineNo?: string;
    remarks?: string;

    status: 'Completed' | 'Draft';

    createdAt: string;
    updatedAt: string;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const slittingInputRollSchema = z.object({
    grnItemId: z.string().min(1, "GRN Item required"),
    grnId: z.string().min(1, "GRN ID required"),
    rollMasterId: z.string(),
    itemCode: z.string().min(1),
    itemName: z.string().min(1),
    batchNo: z.string().min(1),
    inputWidth: z.number().positive("Width must be positive"),
    inputGSM: z.number().positive("GSM must be positive"),
    inputFaceGSM: z.number().optional(),
    inputReleaseGSM: z.number().optional(),
    inputAdhesiveGSM: z.number().optional(),
    inputRM: z.number().positive("RM must be positive"),
    inputSqMtr: z.number().positive("SqMtr must be positive"),
    inputKg: z.number().positive("Weight must be positive"),
    itemType: z.string(),
    quality: z.string().optional(),
    uom: z.string(),
    inputProcessRM: z.number().positive().optional(),
    inputThickness: z.number().optional(),
    inputDensity: z.number().optional(),
});

// ⭐ Cutting Plan Schema (User Input)
export const cuttingPlanSchema = z.object({
    id: z.string(),
    width: z.number().positive("Width must be positive"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    totalWidth: z.number().nonnegative(), // Auto-calculated
    totalRM: z.number().nonnegative(),     // Auto-calculated
    totalKg: z.number().nonnegative(),     // Auto-calculated
    childRollMasterId: z.string().optional(),
    childItemName: z.string().optional(),
});

export const slittingOutputRollSchema = z.object({
    slittingJobId: z.string().optional(),
    rollMasterId: z.string().optional(),
    outputWidth: z.number().positive("Output width must be positive"),
    outputGSM: z.number().positive("GSM must be positive"),
    outputFaceGSM: z.number().optional(),
    outputReleaseGSM: z.number().optional(),
    outputAdhesiveGSM: z.number().optional(),
    outputRM: z.number().nonnegative(),
    outputSqMtr: z.number().nonnegative(),
    outputKg: z.number().nonnegative(),
    batchNo: z.string(),
    itemCode: z.string(),
    itemName: z.string(),
    itemType: z.string(),
    quality: z.string().optional(),
    qrCodeData: z.string().optional(),
    remarks: z.string().optional(),
});

// ⭐ Form schema with Cutting Plans (for UI)
export const slittingJobFormSchema = z.object({
    slittingDate: z.string(),
    inputRoll: slittingInputRollSchema,
    cuttingPlans: z.array(cuttingPlanSchema).min(1, "At least one cutting plan required"),
    wastageKg: z.number().nonnegative().default(0),
    wastageRM: z.number().nonnegative().optional(),
    wastageSqMtr: z.number().nonnegative().optional(),
    wastageRemarks: z.string().optional(),
    operatorName: z.string().optional(),
    machineNo: z.string().optional(),
    remarks: z.string().optional(),
    status: z.enum(['Completed', 'Draft']).default('Completed'),
});

// Original schema for backend/storage (with actual output rolls)
export const slittingJobSchema = z.object({
    slittingDate: z.string(),
    inputRoll: slittingInputRollSchema,
    outputRolls: z.array(slittingOutputRollSchema).min(1, "At least one output roll required"),
    wastageKg: z.number().nonnegative().default(0),
    wastageRM: z.number().nonnegative().optional(),
    wastageSqMtr: z.number().nonnegative().optional(),
    wastageRemarks: z.string().optional(),
    operatorName: z.string().optional(),
    machineNo: z.string().optional(),
    remarks: z.string().optional(),
    status: z.enum(['Completed', 'Draft']).default('Completed'),
});

export type CuttingPlanFormValues = z.input<typeof cuttingPlanSchema>;
export type SlittingJobFormValues = z.input<typeof slittingJobFormSchema>;
export type SlittingJobData = z.input<typeof slittingJobSchema>;
