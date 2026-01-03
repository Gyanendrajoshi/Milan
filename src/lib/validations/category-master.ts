import { z } from "zod";

export const categoryMasterSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
    processIds: z.array(z.string()).min(1, "Please select at least one process"),
});

export type CategoryMasterSchemaType = z.infer<typeof categoryMasterSchema>;
