import * as z from "zod"

export const processMasterSchema = z.object({
    id: z.coerce.string().optional(),
    name: z.string().min(2, {
        message: "Process name must be at least 2 characters.",
    }),
    chargeType: z.string().min(1, "Please select a charge type."),
    isUnitConversion: z.boolean().default(false),
    rate: z.coerce.number().min(0, {
        message: "Rate must be a positive number.",
    }),
    formulaParams: z.string().nullable().optional(),
})

export type ProcessMasterFormValues = z.infer<typeof processMasterSchema>
