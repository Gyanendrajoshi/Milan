import { z } from "zod";

export const rollMasterSchema = z.object({
  itemType: z.enum(["Film", "Paper", ""]).refine((val) => val !== "", {
    message: "Item Type is required",
  }),
  // auto-generated, but can be passed
  itemCode: z.string().optional(),
  itemName: z.string().optional(),
  supplierItemCode: z.string().optional(),
  mill: z.string().min(1, "Mill is required"),
  quality: z.string().min(1, "Quality is required"),
  rollWidthMM: z.union([z.string(), z.number()]).transform((val) => Number(val)).pipe(z.number().positive("Roll width must be positive")),
  thicknessMicron: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Thickness must be positive").optional()),
  density: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Density must be positive").optional()),
  faceGSM: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Face GSM must be positive").optional()),
  releaseGSM: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Release GSM must be non-negative").optional()),
  adhesiveGSM: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Adhesive GSM must be non-negative").optional()),
  totalGSM: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Total GSM must be non-negative").optional()),
  shelfLifeDays: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().positive("Shelf life must be positive").optional()),
  purchaseUnit: z.string().min(1, "Purchase unit is required"),
  stockUnit: z.string().min(1, "Stock unit is required"),
  purchaseRate: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().nonnegative("Purchase rate must be non-negative").optional()),
  hsnCode: z.string().min(1, "HSN Code is required"),
  location: z.string().optional(),
  supplierName: z.string().optional(),
});

export type RollMasterSchemaType = z.infer<typeof rollMasterSchema>;
