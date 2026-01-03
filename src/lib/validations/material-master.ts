import { z } from "zod";

export const materialMasterSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  shelfLifeDays: z.union([z.string(), z.number()]).optional().transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))).pipe(z.number().min(0, "Shelf life must be 0 or greater").optional()),
  itemGroup: z.string().min(1, "Item group is required"),
  purchaseUnit: z.string().min(1, "Purchase unit is required"),
  purchaseRate: z.union([z.string(), z.number()]).transform((val) => Number(val)).pipe(z.number().min(0, "Purchase rate must be 0 or greater")),
  hsnCode: z.string().min(1, "HSN code is required"),
});

export type MaterialMasterSchemaType = z.infer<typeof materialMasterSchema>;
