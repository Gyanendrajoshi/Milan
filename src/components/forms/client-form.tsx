"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientSchemaType } from "@/lib/validations/client-supplier";
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
import { createClient, updateClient } from "@/services/api/client-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Client } from "@/types/client-supplier";

interface ClientFormProps {
  initialData?: Client | null;
  onSuccess?: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientName: initialData?.clientName || "",
      address: initialData?.address || "",
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      gstNumber: initialData?.gstNumber || "",
      state: initialData?.state || "",
      country: initialData?.country || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        clientName: initialData.clientName,
        address: initialData.address,
        mobileNumber: initialData.mobileNumber,
        email: initialData.email,
        gstNumber: initialData.gstNumber || "",
        state: initialData.state,
        country: initialData.country,
      });
    } else {
      form.reset({
        clientName: "",
        address: "",
        mobileNumber: "",
        email: "",
        gstNumber: "",
        state: "",
        country: "",
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: ClientSchemaType) {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateClient(initialData.id, data);
        toast.success("Client updated successfully!");
      } else {
        await createClient(data);
        toast.success("Client created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error: any) {
      const msg = error.message || (initialData ? "Failed to update client" : "Failed to create client");
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Client Name - Full Width */}
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-gray-500">Client Name *</FormLabel>
              <FormControl>
                <Input
                  className="h-8 px-2 py-1 text-sm border-slate-200"
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
              <FormLabel className="text-xs font-bold text-gray-500">Address</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[60px] px-2 py-1 text-sm border-gray-300"
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
                <FormLabel className="text-xs font-bold text-gray-500">Mobile Number</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm border-slate-200"
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
                <FormLabel className="text-xs font-bold text-gray-500">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="h-8 px-2 py-1 text-sm border-slate-200"
                    placeholder="e.g., contact@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* GST Number - Full Width */}
        <FormField
          control={form.control}
          name="gstNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-gray-500">GST Number</FormLabel>
              <FormControl>
                <Input
                  className="h-8 px-2 py-1 text-sm border-slate-200"
                  placeholder="e.g., 27AAAAA0000A1Z5"
                  maxLength={15}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* State and Country - Two columns */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-gray-500">State</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm border-slate-200"
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
                <FormLabel className="text-xs font-bold text-gray-500">Country</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 px-2 py-1 text-sm border-slate-200"
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
