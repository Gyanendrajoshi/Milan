import { z } from "zod";

export const hsnMasterSchema = z.object({
  name: z.string().min(1, "HSN name is required"),
  hsnCode: z.string().min(1, "HSN code is required"),
  gstPercentage: z.union([z.string(), z.number()]).transform((val) => Number(val)).pipe(z.number().min(0, "GST % must be 0 or greater").max(100, "GST % cannot exceed 100")),
});

export type HSNMasterSchemaType = z.infer<typeof hsnMasterSchema>;
