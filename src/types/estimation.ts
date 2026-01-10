import { z } from "zod";


// Shared Process Cost Schema
export const processCostSchema = z.object({
    processId: z.coerce.string(),
    processName: z.string(),
    rateType: z.enum([
        "Per KG", "Per RM", "Per Sq.Mtr", "Per 1000 Ups", // Legacy / Standard
        "Rate/Kg", "Rate/Meter", "Rate/Running Mtr", "Rate/Sq.Meter", // Aliases
        "Rate/Color", "Rate/Sq.Inch/Color", "Rate/Sq.Inch/Unit", "Rate/Sq.Inch",
        "Rate/Unit", "Rate/1000 Units", "Rate/Job", "Rate/Order Quantity",
        "Rate/Inch/Unit", "Rate/Sq.CM", "Printing (Advanced)"
    ]).default("Per KG"),
    quantity: z.coerce.number().min(0).default(0), // Calculated or Overridden
    rate: z.coerce.number().min(0),
    amount: z.coerce.number().min(0),
    isManualQuantity: z.boolean().optional().default(false), // Track if user manually edited quantity
    isManualRate: z.boolean().optional().default(false), // Track if user manually edited rate
    // Advanced Printing Fields
    baseRate: z.coerce.number().min(0).optional().default(0), // KEY FIX: Store original base rate
    extraColorRate: z.coerce.number().min(0).optional().default(0),
    backPrintingRate: z.coerce.number().min(0).optional().default(0),
    debugInfo: z.string().optional()
});

export type ProcessCost = z.infer<typeof processCostSchema>;

// Schema for an individual content Item (Repeated part)
export const estimationContentSchema = z.object({
    id: z.number().optional(), // Internal ID for UI list
    contentName: z.string().optional(), // e.g. "Part A"
    orderQty: z.coerce.number().optional(), // Snapshot of Job Qty when created

    // Job Details - Size & Ups
    machineName: z.string().optional(), // Dynamic dropdown
    // Dimensions
    jobWidthMM: z.coerce.number().min(0, "Width is required"),
    jobHeightMM: z.coerce.number().min(0, "Height is required"),
    // Colors
    colorsFront: z.coerce.number().min(0).default(0),
    colorsBack: z.coerce.number().min(0).default(0),
    // Ups
    upsAcross: z.coerce.number().min(0).default(1),
    upsAround: z.coerce.number().min(0).default(1),
    totalUps: z.coerce.number().min(0).default(1),

    // Tool Details
    toolId: z.coerce.string().optional(),
    toolTeeth: z.coerce.number().optional(),
    toolCircumferenceMM: z.coerce.number().optional(),
    toolCircumferenceInch: z.coerce.number().optional(),
    dieId: z.coerce.string().optional(),

    // Roll Details
    rollId: z.coerce.string().optional(),
    rollWidthMM: z.coerce.number().optional(),
    rollTotalGSM: z.coerce.number().optional(),
    rollDescription: z.string().optional(),

    // Processes
    processIds: z.array(z.coerce.string()).default([]),

    // Requirements (Base - No Wastage)
    baseRunningMtr: z.coerce.number().min(0).default(0),
    baseSqMtr: z.coerce.number().min(0).default(0),
    baseKg: z.coerce.number().min(0).default(0),

    // Wastage (Synced Inputs)
    wastagePercent: z.coerce.number().min(0).default(0),
    wastageRM: z.coerce.number().min(0).default(0),

    // Total Requirements (Base + Wastage)
    totalRunningMtr: z.coerce.number().min(0).default(0),
    totalSqMtr: z.coerce.number().min(0).default(0),
    totalKg: z.coerce.number().min(0).default(0),

    // Material Costing
    materialRate: z.coerce.number().min(0).default(0),
    materialRateUnit: z.enum(["RunningMtr", "SqMtr", "Kg"]).default("Kg"),
    materialCostAmount: z.coerce.number().min(0).default(0),

    // Process Costing (Detailed)
    processCosts: z.array(processCostSchema).default([]),

    // Additional Costs (Synced Inputs)
    additionalCostPercent: z.coerce.number().min(0).default(0),
    additionalCostAmount: z.coerce.number().min(0).default(0),

    // GST Calculation
    gstPercent: z.coerce.number().min(0).max(100).default(0),
    gstAmount: z.coerce.number().min(0).default(0),

    // Final Summary
    totalJobCost: z.coerce.number().min(0).default(0), // Material + Process + Additional
    finalPriceWithGST: z.coerce.number().min(0).default(0), // Job Cost + GST
    unitCost: z.coerce.number().min(0).default(0), // Final Price / Qty
    finalSalesPrice: z.coerce.number().min(0).default(0), // Manual Override
    totalOrderValue: z.coerce.number().min(0).default(0), // SalesPrice * Qty
});

export type EstimationContent = z.infer<typeof estimationContentSchema>;

export const estimationFormSchema = z.object({
    // Basic Info
    jobCardNo: z.string().optional(),
    date: z.date(),
    clientId: z.string().min(1, "Client is required"),
    jobName: z.string().min(1, "Job Name is required"),
    poNumber: z.string().optional(),
    deliveryDate: z.date().optional(),
    salesPerson: z.string().optional(),
    jobPriority: z.enum(["High", "Medium", "Low"]).default("Medium"),
    jobType: z.enum(["New Job", "Repeat Job"]).default("New Job"),

    // Global Specs
    orderQty: z.coerce.number().int("Quantity must be a whole number").min(1, "Order Qty is required"),
    category: z.string().min(1, "Category is required"),

    // --- Active Editor State (Staging Fields) ---
    // We include these so the Form Controls have a place to bind to.
    // When "Add" is clicked, we move these values into the `contents` array.
    contentName: z.string().optional(),
    machineName: z.string().optional(),
    jobWidthMM: z.coerce.number().min(0).default(0),
    jobHeightMM: z.coerce.number().min(0).default(0),
    colorsFront: z.union([z.string(), z.number()]).transform(val => val === "" ? 0 : Number(val)).pipe(z.number().int().min(0).max(9)),
    colorsBack: z.union([z.string(), z.number()]).transform(val => val === "" ? 0 : Number(val)).pipe(z.number().int().min(0).max(9)),
    upsAcross: z.coerce.number().min(0).default(0),
    upsAround: z.coerce.number().min(0).default(0),
    totalUps: z.coerce.number().min(0).default(0),
    toolId: z.coerce.string().optional(),
    toolTeeth: z.coerce.number().optional(),
    toolCircumferenceMM: z.coerce.number().optional(),
    toolCircumferenceInch: z.coerce.number().optional(),
    dieId: z.coerce.string().optional(),
    rollId: z.coerce.string().optional(),
    rollWidthMM: z.coerce.number().optional(),
    rollTotalGSM: z.coerce.number().optional(),
    processIds: z.array(z.coerce.string()).default([]),
    baseRunningMtr: z.coerce.number().min(0).default(0),
    baseSqMtr: z.coerce.number().min(0).default(0),
    baseKg: z.coerce.number().min(0).default(0),
    wastagePercent: z.coerce.number().min(0).default(0),
    wastageRM: z.coerce.number().min(0).default(0),
    totalRunningMtr: z.coerce.number().min(0).default(0),
    totalSqMtr: z.coerce.number().min(0).default(0),
    totalKg: z.coerce.number().min(0).default(0),
    materialRate: z.coerce.number().min(0).default(0),
    materialRateUnit: z.enum(["RunningMtr", "SqMtr", "Kg"]).default("Kg"),
    materialCostAmount: z.coerce.number().min(0).default(0),
    processCosts: z.array(processCostSchema).default([]),
    additionalCostPercent: z.coerce.number().min(0).default(0),
    additionalCostAmount: z.coerce.number().min(0).default(0),
    gstPercent: z.coerce.number().min(0).max(100).default(0),
    gstAmount: z.coerce.number().min(0).default(0),
    totalJobCost: z.coerce.number().min(0).default(0),
    finalPriceWithGST: z.coerce.number().min(0).default(0),
    unitCost: z.coerce.number().min(0).default(0),
    finalSalesPrice: z.coerce.number().min(0).default(0),
    totalOrderValue: z.coerce.number().min(0).default(0),

    // --- Stored Contents ---
    contents: z.array(estimationContentSchema).default([]),
});

export type EstimationFormValues = z.infer<typeof estimationFormSchema>;
