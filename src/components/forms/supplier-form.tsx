"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, type SupplierSchemaType } from "@/lib/validations/client-supplier";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupplier, updateSupplier } from "@/services/api/supplier-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Supplier } from "@/types/client-supplier";

interface SupplierFormProps {
  initialData?: Supplier | null;
  onSuccess?: () => void;
}

type SupplierFormValues = Omit<SupplierSchemaType, "excessQuantityTolerance"> & {
  excessQuantityTolerance?: number | string;
};

export function SupplierForm({ initialData, onSuccess }: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNumberDefault = (val: number | undefined): number | string =>
    val === undefined || val === null ? "" : val;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      supplierName: initialData?.supplierName || "",
      address: initialData?.address || "",
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      gstNumber: initialData?.gstNumber || "",
      excessQuantityTolerance: getNumberDefault(initialData?.excessQuantityTolerance),
      state: initialData?.state || "",
      country: initialData?.country || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        supplierName: initialData.supplierName,
        address: initialData.address,
        mobileNumber: initialData.mobileNumber,
        email: initialData.email,
        gstNumber: initialData.gstNumber || "",
        excessQuantityTolerance: getNumberDefault(initialData.excessQuantityTolerance),
        state: initialData.state,
        country: initialData.country,
      });
    } else {
      form.reset({
        supplierName: "",
        address: "",
        mobileNumber: "",
        email: "",
        gstNumber: "",
        excessQuantityTolerance: "",
        state: "",
        country: "",
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: SupplierFormValues) {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        excessQuantityTolerance: data.excessQuantityTolerance
          ? Number(data.excessQuantityTolerance)
          : undefined,
      };

      if (initialData) {
        await updateSupplier(initialData.id, formattedData as any);
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(formattedData as any);
        toast.success("Supplier created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error: any) {
      const msg = error.message || (initialData ? "Failed to update supplier" : "Failed to create supplier");
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Supplier Name - Full Width */}
        <FormField
          control={form.control}
          name="supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Supplier Name *</FormLabel>
              <FormControl>
                <Input
                  className="h-8 px-2 py-1 text-sm"
                  placeholder="e.g., ABC Corporation"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Address - Full Width */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Address</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[60px] px-2 py-1 text-sm"
                  placeholder="e.g., 123 Business Street, Mumbai, Maharashtra 400001"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Mobile Number and Email - Two columns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Mobile Number</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., 9876543210"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., contact@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* GST Number and Excess Quantity Tolerance - Two columns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">GST Number</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., 27AAAAA0000A1Z5"
                    maxLength={15}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excessQuantityTolerance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Excess Quantity Tolerance (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., 10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* State and Country - Two columns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">State</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., Maharashtra"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Country</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="e.g., India"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-24"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient-blue"
            disabled={isSubmitting}
            className="w-32"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
