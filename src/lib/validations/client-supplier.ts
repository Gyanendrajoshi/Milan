import { z } from "zod";

export const clientSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Address is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  email: z.string().email("Valid email is required"),
  gstNumber: z.string().optional(),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});

export const supplierSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  address: z.string().min(1, "Address is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  email: z.string().email("Valid email is required"),
  gstNumber: z.string().optional(),
  excessQuantityTolerance: z.coerce.number().min(0).max(100).optional(),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});

export type ClientSchemaType = z.infer<typeof clientSchema>;
export type SupplierSchemaType = z.infer<typeof supplierSchema>;
