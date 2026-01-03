import { z } from "zod";

export const toolMasterSchema = z.object({
    toolPrefix: z.enum([
        "PLATES",
        "PRINTING CYLINDER",
        "ANILOX CYLINDER",
        "EMBOSSING CYLINDER",
        "FLEXO DIE",
        "MAGNETIC CYLINDER",
    ]),
    itemCode: z.string().optional(), // Added for unified item code
    toolNo: z.string().optional(), // Auto-generated
    toolRefCode: z.string().optional(),
    noOfTeeth: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Number of teeth must be non-negative").optional()),
    circumferenceMM: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Circumference must be positive").optional()),
    circumferenceInch: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Circumference must be positive").optional()),
    hsnCode: z.string().optional(),
    purchaseUnit: z.string().optional(),
    purchaseRate: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Purchase rate must be non-negative").optional()),
    toolName: z.string().min(1, "Tool name is required"),
    toolDescription: z.string().optional(),

    // PLATES
    colorDetails: z.string().optional(),
    plates: z.string().optional(),

    // ANILOX CYLINDER
    lpi: z.string().optional(),
    bcm: z.string().optional(),

    // FLEXO DIE
    jobSize: z.string().optional(),
    acrossUps: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().optional()),
    aroundUps: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().optional()),
    acrossGap: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().optional()),
    aroundGap: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().optional()),

    // Additional Fields
    location: z.string().optional(),
    cabinet: z.string().optional(),
    shelf: z.string().optional(),
    bin: z.string().optional(),
    toolType: z.string().optional(),
    machineName: z.string().optional(),
    cylinderType: z.string().optional(),
    make: z.string().optional(),
    printType: z.string().optional(),
    category: z.string().optional(),
    supplierName: z.string().optional(),
    purchaseDate: z.date().optional(),
    status: z.string().optional(),
    drawingNo: z.string().optional(),
    revNo: z.string().optional(),
    remark: z.string().optional(),
    usageCount: z.number().optional(), // Or string/number union if it comes from input
    size: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    thickness: z.string().optional(),
    unit: z.string().optional(),
    jobCode: z.string().optional(),
    jobName: z.string().optional(),
});

export type ToolMasterSchemaType = z.infer<typeof toolMasterSchema>;
