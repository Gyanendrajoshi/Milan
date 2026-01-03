"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { hsnMasterSchema, type HSNMasterSchemaType } from "@/lib/validations/hsn-master";
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
import { createHSN, updateHSN } from "@/services/api/hsn-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { HSNMaster } from "@/types/hsn-master";

interface HSNMasterFormProps {
  initialData?: HSNMaster | null;
  onSuccess?: () => void;
}

type HSNMasterFormValues = z.input<typeof hsnMasterSchema>;

export function HSNMasterForm({ initialData, onSuccess }: HSNMasterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNumberDefault = (val: number | undefined): string =>
    val === undefined || val === null ? "" : val.toString();

  const form = useForm<HSNMasterFormValues, any, HSNMasterSchemaType>({
    resolver: zodResolver(hsnMasterSchema),
    defaultValues: {
      name: initialData?.name || "",
      hsnCode: initialData?.hsnCode || "",
      gstPercentage: getNumberDefault(initialData?.gstPercentage),
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        hsnCode: initialData.hsnCode,
        gstPercentage: getNumberDefault(initialData.gstPercentage),
      });
    } else {
      // Allow 'any' cast for reset to empty strings
      form.reset({
        name: "",
        hsnCode: "",
        gstPercentage: "",
      } as any);
    }
  }, [initialData, form]);

  async function onSubmit(data: HSNMasterSchemaType) {
    setIsSubmitting(true);
    try {
      const formattedData = data;

      if (initialData) {
        await updateHSN(initialData.id, formattedData);
        toast.success("HSN updated successfully!");
      } else {
        await createHSN(formattedData);
        toast.success("HSN created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error) {
      toast.error(initialData ? "Failed to update HSN" : "Failed to create HSN");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name - Full Width */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Name *</FormLabel>
              <FormControl>
                <Input
                  className="h-8 px-2 py-1 text-sm"
                  placeholder="Enter HSN name"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* HSN Code and GST % - Two columns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="hsnCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">HSN Code *</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="Enter HSN code"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gstPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">GST (%) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 px-2 py-1 text-sm"
                    placeholder="Enter GST percentage"
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
