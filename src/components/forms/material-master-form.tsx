"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { materialMasterSchema, type MaterialMasterSchemaType } from "@/lib/validations/material-master";
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
import { commonDropdownData } from "@/services/mock-data/common";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { createMaterial, updateMaterial, getMaterials } from "@/services/api/material-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { Material } from "../../types/material-master";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HSNMasterForm } from "@/components/forms/hsn-master-form";
import { getHSNCodes } from "@/services/api/hsn-service";
import { HSNMaster } from "@/types/hsn-master";

interface MaterialMasterFormProps {
  initialData?: Material | null;
  onSuccess?: () => void;
}

// Define form input values (before Zod transformation)
type MaterialFormValues = z.input<typeof materialMasterSchema>;

export function MaterialMasterForm({ initialData, onSuccess }: MaterialMasterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHSNDialogOpen, setIsHSNDialogOpen] = useState(false);
  const [generatedItemCode, setGeneratedItemCode] = useState("");

  const [groups, setGroups] = useState([
    { label: "Printing Inks", value: "Printing Inks" },
    { label: "Adhesives", value: "Adhesives" },
    { label: "Packaging Materials", value: "Packaging Materials" },
    { label: "Raw Materials", value: "Raw Materials" },
    { label: "Consumables", value: "Consumables" },
  ]);

  const [units, setUnits] = useState(commonDropdownData.units);
  const [hsnList, setHsnList] = useState<{ label: string; value: string }[]>(commonDropdownData.hsnCodes);

  const handleCreateGroup = (value: string) => {
    const newGroup = { label: value, value: value };
    setGroups([...groups, newGroup]);
    form.setValue("itemGroup", value);
    toast.success(`Group "${value}" added successfully.`);
  };

  const handleCreateUnit = (value: string) => {
    const newUnit = { label: value, value: value };
    setUnits([...units, newUnit]);
    form.setValue("purchaseUnit", value);
    toast.success(`Unit "${value}" added successfully.`);
  };

  const handleCreateHSN = (value: string) => {
    setIsHSNDialogOpen(true);
  };

  // Generate Item Code on Mount
  useEffect(() => {
    const generateCode = async () => {
      if (initialData) {
        setGeneratedItemCode(initialData.itemCode);
        return;
      }

      try {
        const materials = await getMaterials();
        let maxId = 0;
        materials.forEach(m => {
          if (m.itemCode && m.itemCode.startsWith("M")) {
            const numPart = parseInt(m.itemCode.substring(1));
            if (!isNaN(numPart) && numPart > maxId) {
              maxId = numPart;
            }
          }
        });
        const nextId = maxId + 1;
        const nextCode = `M${nextId.toString().padStart(5, '0')}`;
        setGeneratedItemCode(nextCode);
      } catch (err) {
        console.error("Failed to generate code", err);
        setGeneratedItemCode("M00001"); // Fallback
      }
    };
    generateCode();
  }, [initialData]);

  // Fetch HSN codes (mock or real)
  const fetchHSNs = async () => {
    try {
      const data = await getHSNCodes();
      // Transform HSNMaster[] to dropdown format
      const options = data.map(h => ({
        label: `${h.hsnCode} - ${h.name}`,
        value: h.hsnCode
      }));
      if (options.length > 0) {
        setHsnList(options);
      }
    } catch (error) {
      console.error("Failed to fetch HSN codes", error);
    }
  };

  useEffect(() => {
    fetchHSNs();
  }, []);

  const getNumberDefault = (val: number | undefined): string =>
    val === undefined || val === null ? "" : val.toString();

  const form = useForm<MaterialFormValues, any, MaterialMasterSchemaType>({
    resolver: zodResolver(materialMasterSchema),
    defaultValues: {
      itemName: initialData?.itemName || "",
      shelfLifeDays: getNumberDefault(initialData?.shelfLifeDays),
      itemGroup: initialData?.itemGroup || "",
      purchaseUnit: initialData?.purchaseUnit || "",
      purchaseRate: getNumberDefault(initialData?.purchaseRate),
      hsnCode: initialData?.hsnCode || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        itemName: initialData.itemName,
        shelfLifeDays: getNumberDefault(initialData.shelfLifeDays),
        itemGroup: initialData.itemGroup,
        purchaseUnit: initialData.purchaseUnit,
        purchaseRate: getNumberDefault(initialData.purchaseRate),
        hsnCode: initialData.hsnCode,
      });
    } else {
      form.reset({
        itemName: "",
        shelfLifeDays: "",
        itemGroup: "",
        purchaseUnit: "",
        purchaseRate: "",
        hsnCode: "",
      } as any);
    }
  }, [initialData, form]);

  async function onSubmit(data: MaterialMasterSchemaType) {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        itemCode: generatedItemCode // Include generated code
      };

      if (initialData) {
        await updateMaterial(initialData.id, formattedData as any);
        toast.success("Material updated successfully!");
      } else {
        await createMaterial(formattedData as any);
        toast.success("Material created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error: any) {
      const msg = error.message || (initialData ? "Failed to update material" : "Failed to create material");
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleHSNCreated = async () => {
    setIsHSNDialogOpen(false);
    await fetchHSNs();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Item Code (Read Only) */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Item Code (Auto-Generated)</label>
              <Input
                value={generatedItemCode}
                disabled
                className="bg-slate-100 font-mono font-bold text-slate-700 h-9"
              />
            </div>
          </div>

          {/* Row 1: Item Name and Shelf Life */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Item Name *</FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 px-2 py-1 text-sm"
                      placeholder="e.g., Cyan Ink"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itemGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Item Group</FormLabel>
                  <FormControl>
                    <CreatableCombobox
                      options={groups}
                      value={field.value}
                      onSelect={field.onChange}
                      onCreate={handleCreateGroup}
                      placeholder="Select or add group"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

          </div>

          {/* Row 2: Item Group and Purchase Unit */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="shelfLifeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Shelf Life (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      placeholder="e.g., 180"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="purchaseUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Purchase Unit</FormLabel>
                  <FormControl>
                    <CreatableCombobox
                      options={units}
                      value={field.value}
                      onSelect={field.onChange}
                      onCreate={handleCreateUnit}
                      placeholder="Select or add unit"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Purchase Rate and HSN Code */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="purchaseRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Purchase Rate</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 pl-7 pr-2 py-1 text-sm"
                        placeholder="0.00"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hsnCode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">HSN Code</FormLabel>
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                      onClick={() => setIsHSNDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Add HSN
                    </button>
                  </div>
                  <FormControl>
                    <CreatableCombobox
                      options={hsnList}
                      value={field.value}
                      onSelect={field.onChange}
                      onCreate={handleCreateHSN}
                      placeholder="Select or search HSN"
                      emptyText="No HSN found. Click '+' to add."
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
              {initialData ? "Update" : "Create Material"}
            </Button>
          </div>
        </form>
      </Form>

      {/* HSN Creation Dialog */}
      <Dialog open={isHSNDialogOpen} onOpenChange={setIsHSNDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New HSN Code</DialogTitle>
            <DialogDescription>
              Create a new HSN code entry in the master database.
            </DialogDescription>
          </DialogHeader>
          <HSNMasterForm onSuccess={handleHSNCreated} />
        </DialogContent>
      </Dialog>
    </>
  );
}
