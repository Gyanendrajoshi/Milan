"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rollMasterSchema, type RollMasterSchemaType } from "@/lib/validations/roll-master";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commonDropdownData } from "@/services/mock-data/common";
import { createRoll, updateRoll } from "@/services/api/roll-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Plus, Copy } from "lucide-react";
import { RollMaster } from "@/types/roll-master";
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
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

interface RollMasterFormProps {
  initialData?: RollMaster | null;
  onSuccess?: () => void;
}

// Form values can be string (from input) or number.
type RollMasterFormValues = z.input<typeof rollMasterSchema>;

export function RollMasterForm({ initialData, onSuccess }: RollMasterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'create' | 'update'>('create');

  // Dynamic Lists State
  const [qualities, setQualities] = useState(commonDropdownData.qualities);
  const [mills, setMills] = useState(commonDropdownData.mills);
  // Units for Purchase/Stock (merged or separate?) commonDropdownData.units usually has generic units.
  // We'll use a single list for both unless specific requirements differ.
  // Note: commonDropdownData.units might just be default list.


  const [hsnList, setHsnList] = useState<{ label: string; value: string }[]>(commonDropdownData.hsnCodes);
  const [isHSNDialogOpen, setIsHSNDialogOpen] = useState(false);

  // Helper to safely handle number fields for default values
  const getNumberDefault = (val: number | undefined): string =>
    val === undefined || val === null ? "" : val.toString();

  const defaultValues: RollMasterFormValues = {
    itemType: initialData?.itemType || "",
    mill: initialData?.mill || "",
    quality: initialData?.quality || "",
    rollWidthMM: getNumberDefault(initialData?.rollWidthMM),
    purchaseUnit: initialData?.purchaseUnit || "Kg",
    stockUnit: initialData?.stockUnit || "RUN MTR",
    hsnCode: initialData?.hsnCode || "",
    itemCode: initialData?.itemCode || "",
    itemName: initialData?.itemName || "",
    location: initialData?.location || "",
    supplierName: initialData?.supplierName || "",
    supplierItemCode: initialData?.supplierItemCode || "",

    // Numeric fields (handle as string input)
    thicknessMicron: getNumberDefault(initialData?.thicknessMicron),
    density: getNumberDefault(initialData?.density),
    faceGSM: getNumberDefault(initialData?.faceGSM),
    releaseGSM: getNumberDefault(initialData?.releaseGSM),
    adhesiveGSM: getNumberDefault(initialData?.adhesiveGSM),
    totalGSM: getNumberDefault(initialData?.totalGSM),
    shelfLifeDays: getNumberDefault(initialData?.shelfLifeDays),
    purchaseRate: getNumberDefault(initialData?.purchaseRate),
  };

  const form = useForm<RollMasterFormValues, any, RollMasterSchemaType>({
    resolver: zodResolver(rollMasterSchema),
    defaultValues,
  });

  const itemTypeWatcher = form.watch("itemType");

  // Handlers
  const handleCreateQuality = (value: string) => {
    const newItem = { label: value, value: value };
    setQualities([...qualities, newItem]);
    form.setValue("quality", value);
    toast.success(`Quality "${value}" added.`);
  };

  const handleCreateMill = (value: string) => {
    const newItem = { label: value, value: value };
    setMills([...mills, newItem]);
    form.setValue("mill", value);
    toast.success(`Mill "${value}" added.`);
  };



  const handleCreateHSN = (value: string) => {
    setIsHSNDialogOpen(true);
  }

  const fetchHSNs = async () => {
    try {
      const data = await getHSNCodes();
      const options = data.map(h => ({
        label: `${h.hsnCode} - ${h.name} `,
        value: h.hsnCode
      }));
      if (options.length > 0) setHsnList(options);
    } catch (error) {
      console.error("Failed to fetch HSN codes", error);
    }
  };

  // Auto-generate Item Code based on Type if creating new
  useEffect(() => {
    if (!initialData && itemTypeWatcher) {
      // Logic: RF for Film, RP for Paper + Random 5 digits (Simulated)
      // In a real app, this might fetch next ID from backend or just suggest prefix
      const prefix = itemTypeWatcher === "Film" ? "RF" : "RP";
      // Only set if current value starts with wrong prefix or is empty
      const currentCode = form.getValues("itemCode");

      if (!currentCode || (!currentCode.startsWith("RF") && !currentCode.startsWith("RP"))) {
        // Generate a random 5 digit for demo
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        form.setValue("itemCode", `${prefix}${randomNum} `);
      } else if (currentCode && (currentCode.startsWith("RF") || currentCode.startsWith("RP"))) {
        // If type switched, update prefix
        const oldPrefix = itemTypeWatcher === "Film" ? "RP" : "RF";
        if (currentCode.startsWith(oldPrefix)) {
          form.setValue("itemCode", currentCode.replace(oldPrefix, prefix));
        }
      }
    }
  }, [itemTypeWatcher, initialData, form]);


  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // No need to reset most fields here as defaultValues handles it.
      // This useEffect can be simplified or removed if defaultValues covers all cases.
      // For now, keeping it minimal if there are specific reset needs not covered by defaultValues.
      form.reset(defaultValues); // Reset with the calculated default values based on initialData
    } else {
      // Trigger generic reset, item code effect will kick in
      form.reset({
        itemType: "",
        itemCode: "",
        purchaseUnit: "KG",
        stockUnit: "RUN MTR",
      } as any);
    }
  }, [initialData, form]);

  useEffect(() => {
    fetchHSNs();
  }, []);

  const handleHSNCreated = async () => {
    await fetchHSNs();
    setIsHSNDialogOpen(false);
  }

  async function onSubmit(data: RollMasterSchemaType) {
    setIsSubmitting(true);
    try {
      // Runtime data from Zod resolver will be numbers (RollMasterSchemaType) 
      const validData = data;

      const formattedData = {
        ...validData,
        rollWidthMM: Number(validData.rollWidthMM),
        thicknessMicron: validData.thicknessMicron ? Number(validData.thicknessMicron) : undefined,
        density: validData.density ? Number(validData.density) : undefined,
        faceGSM: validData.faceGSM ? Number(validData.faceGSM) : undefined,
        releaseGSM: validData.releaseGSM ? Number(validData.releaseGSM) : undefined,
        adhesiveGSM: validData.adhesiveGSM ? Number(validData.adhesiveGSM) : undefined,
        totalGSM: validData.totalGSM ? Number(validData.totalGSM) : undefined,
        shelfLifeDays: validData.shelfLifeDays ? Number(validData.shelfLifeDays) : undefined,
        purchaseRate: validData.purchaseRate ? Number(validData.purchaseRate) : undefined,
      };

      if (submitAction === 'create' && initialData) {
        // Regenerate Item Code for Copy New
        const prefix = validData.itemType === "Film" ? "RF" : "RP";
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        formattedData.itemCode = `${prefix}${randomNum}`;
      }

      if (initialData && submitAction === 'update') {
        await updateRoll(initialData.id, formattedData as any);
        toast.success("Roll updated successfully!");
      } else {
        await createRoll(formattedData as any);
        toast.success("Roll created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        form.reset();
      }
    } catch (error) {
      toast.error(
        initialData && submitAction === 'update'
          ? "Failed to update Roll"
          : "Failed to create Roll"
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {/* ROW 1: Item Code, Item Type, Supplier Item Code */}
            <FormField
              control={form.control}
              name="itemCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Item Code</FormLabel>
                  <FormControl>
                    <Input className="h-8 px-2 py-1 text-sm bg-muted" {...field} readOnly />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Item Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Film">Film</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierItemCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">MFG Item Code</FormLabel>
                  <FormControl>
                    <Input className="h-8 px-2 py-1 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ROW 2: Quality, Roll Width, Mill */}
            <FormField
              control={form.control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Quality *</FormLabel>
                  <FormControl>
                    <CreatableCombobox
                      options={qualities}
                      value={field.value}
                      onSelect={field.onChange}
                      onCreate={handleCreateQuality}
                      placeholder="Select or add quality"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rollWidthMM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Roll Width (MM) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Mill *</FormLabel>
                  <FormControl>
                    <CreatableCombobox
                      options={mills}
                      value={field.value}
                      onSelect={field.onChange}
                      onCreate={handleCreateMill}
                      placeholder="Select or add mill"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ROW 3: Face GSM, Release GSM, Adhesive GSM */}
            <FormField
              control={form.control}
              name="faceGSM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Face GSM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="releaseGSM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Release GSM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adhesiveGSM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Adhesive GSM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ROW 4: Thickness, Density, Total GSM */}
            <FormField
              control={form.control}
              name="thicknessMicron"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Thickness (Micron)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="density"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Density</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalGSM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Total GSM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ROW 5: Purchase Unit, Purchase Rate, Shelf Life */}
            <FormField
              control={form.control}
              name="purchaseUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Purchase Unit *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="SQ MTR">SQ MTR</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Purchase Rate *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 px-2 py-1 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ROW 6: Stock Unit, HSN Code */}
            <FormField
              control={form.control}
              name="stockUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Stock Unit *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="RUN MTR">RUN MTR</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <FormLabel className="text-sm font-medium">HSN Code *</FormLabel>
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
                      placeholder="Select HSN"
                      emptyText="No HSN found."
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Item Name - kept at bottom as per one interpretation or top? 
              User text list didn't mention it explicitly in 1-16, but usually Item Name is key.
              It is present in image. I'll put it at the end for now or maybe full width.
          */}
            {/* Item Name Removed as per user request */}

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            {initialData && (
              <Button
                type="submit"
                variant="outline"
                onClick={() => setSubmitAction('create')}
                className="w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              >
                Copy New
              </Button>
            )}
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
              onClick={() => setSubmitAction(initialData ? 'update' : 'create')}
              disabled={isSubmitting}
              className="w-32"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
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
