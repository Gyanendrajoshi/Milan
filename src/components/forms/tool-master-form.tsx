"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toolMasterSchema, type ToolMasterSchemaType } from "@/lib/validations/tool-master";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { commonDropdownData } from "@/services/mock-data/common";
import { createTool, updateTool } from "@/services/api/tool-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { ToolMaster } from "@/types/tool-master";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { HSNMasterForm } from "@/components/forms/hsn-master-form";
import { getHSNCodes } from "@/services/api/hsn-service";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

export type ToolPrefixType = ToolMasterSchemaType["toolPrefix"];

export const toolPrefixOptions: { label: string; value: ToolPrefixType; code: string }[] = [
    { label: "PLATES", value: "PLATES", code: "PL" },
    { label: "PRINTING CYLINDER", value: "PRINTING CYLINDER", code: "PC" },
    { label: "ANILOX CYLINDER", value: "ANILOX CYLINDER", code: "AC" },
    { label: "EMBOSSING CYLINDER", value: "EMBOSSING CYLINDER", code: "EC" },
    { label: "FLEXO DIE", value: "FLEXO DIE", code: "FD" },
    { label: "MAGNETIC CYLINDER", value: "MAGNETIC CYLINDER", code: "MC" },
];

interface ToolMasterFormProps {
    initialData?: ToolMaster | null;
    onSuccess?: () => void;
}

type ToolMasterFormValues = z.input<typeof toolMasterSchema>;

export function ToolMasterForm({ initialData, onSuccess }: ToolMasterFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitAction, setSubmitAction] = useState<'create' | 'update'>('create');
    const [isHSNDialogOpen, setIsHSNDialogOpen] = useState(false);

    const [hsnList, setHsnList] = useState<{ label: string; value: string }[]>(commonDropdownData.hsnCodes);
    const [units, setUnits] = useState(commonDropdownData.units);

    const getNumberDefault = (val: number | undefined) =>
        val?.toString() || "";

    const defaultValues: ToolMasterFormValues = {
        toolPrefix: initialData?.toolPrefix || "PLATES",
        toolName: initialData?.toolName || "",
        itemCode: initialData?.itemCode || "",
        toolNo: initialData?.toolNo || "",
        toolRefCode: initialData?.toolRefCode || "",
        location: initialData?.location || "",
        cabinet: initialData?.cabinet || "",
        shelf: initialData?.shelf || "",
        bin: initialData?.bin || "",
        toolType: initialData?.toolType || "",
        machineName: initialData?.machineName || "",
        cylinderType: initialData?.cylinderType || "",
        make: initialData?.make || "",
        printType: initialData?.printType || "",
        category: initialData?.category || "",
        supplierName: initialData?.supplierName || "",
        purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : undefined,

        // Numeric fields (handle as string input)
        noOfTeeth: getNumberDefault(initialData?.noOfTeeth),
        circumferenceMM: getNumberDefault(initialData?.circumferenceMM),
        circumferenceInch: getNumberDefault(initialData?.circumferenceInch),
        purchaseRate: getNumberDefault(initialData?.purchaseRate),
        acrossUps: getNumberDefault(initialData?.acrossUps),
        aroundUps: getNumberDefault(initialData?.aroundUps),
        acrossGap: getNumberDefault(initialData?.acrossGap),
        aroundGap: getNumberDefault(initialData?.aroundGap),

        // Optional fields
        jobName: initialData?.jobName || "",
        jobCode: initialData?.jobCode || "",
        size: initialData?.size || "",
        width: initialData?.width || "",
        height: initialData?.height || "",
        thickness: initialData?.thickness || "",
        unit: initialData?.unit || "",
        drawingNo: initialData?.drawingNo || "",
        revNo: initialData?.revNo || "",
        remark: initialData?.remark || "",
        usageCount: initialData?.usageCount || 0,
        status: initialData?.status || "Active",
        jobSize: initialData?.jobSize || "",

        // Missing fields causing uncontrolled errors
        hsnCode: initialData?.hsnCode || "",
        purchaseUnit: initialData?.purchaseUnit || "",
        toolDescription: initialData?.toolDescription || "",
        colorDetails: initialData?.colorDetails || "",
        plates: initialData?.plates || "",
        lpi: initialData?.lpi || "",
        bcm: initialData?.bcm || "",
    };

    const form = useForm<ToolMasterFormValues, any, ToolMasterSchemaType>({
        resolver: zodResolver(toolMasterSchema),
        defaultValues,
    });

    const toolPrefixWatcher = form.watch("toolPrefix");
    const noOfTeethWatcher = form.watch("noOfTeeth");


    const handleCreateHSN = (value: string) => {
        setIsHSNDialogOpen(true);
    };

    const handleCreateUnit = (value: string) => {
        const newItem = { label: value, value: value };
        setUnits([...units, newItem]);
        form.setValue("purchaseUnit", value);
        toast.success(`Unit "${value}" added.`);
    };

    const fetchHSNs = async () => {
        try {
            const data = await getHSNCodes();
            const options = data.map(h => ({
                label: `${h.hsnCode} - ${h.name}`,
                value: h.hsnCode
            }));
            if (options.length > 0) setHsnList(options);
        } catch (error) {
            console.error("Failed to fetch HSN codes", error);
        }
    };

    useEffect(() => {
        fetchHSNs();
    }, []);

    const handleHSNCreated = async () => {
        await fetchHSNs();
        setIsHSNDialogOpen(false);
    }

    // Auto-generate Tool No logic
    useEffect(() => {
        const generateCode = async () => {
            if (!initialData && toolPrefixWatcher) {
                const selectedOption = toolPrefixOptions.find(opt => opt.value === toolPrefixWatcher);
                if (selectedOption) {
                    const prefixCode = selectedOption.code;
                    try {
                        const tools = await import("@/services/api/tool-service").then(m => m.getTools());
                        let maxId = 0;
                        tools.forEach(t => {
                            if (t.toolNo && t.toolNo.startsWith(prefixCode)) {
                                const numStr = t.toolNo.substring(prefixCode.length);
                                const num = parseInt(numStr, 10);
                                if (!isNaN(num) && num > maxId) maxId = num;
                            }
                        });
                        const nextId = maxId + 1;
                        const nextCode = `${prefixCode}${nextId.toString().padStart(5, '0')}`;
                        form.setValue("toolNo", nextCode);
                    } catch (error) {
                        console.error("Failed to generate tool no", error);
                        form.setValue("toolNo", `${prefixCode}00001`);
                    }
                }
            }
        };
        generateCode();
    }, [toolPrefixWatcher, initialData, form]);

    // Auto-calculate Circumference based on No of Teeth
    useEffect(() => {
        const teeth = parseFloat(noOfTeethWatcher?.toString() || "0");
        if (teeth > 0) {
            const mm = teeth * 3.175;
            const inch = mm / 25.4;

            form.setValue("circumferenceMM", mm.toFixed(3));
            form.setValue("circumferenceInch", inch.toFixed(3));
        } else if (noOfTeethWatcher === "" || noOfTeethWatcher === undefined) {
            form.setValue("circumferenceMM", "");
            form.setValue("circumferenceInch", "");
        }
    }, [noOfTeethWatcher, form]);


    // Reset logic
    useEffect(() => {
        if (initialData) {
            form.reset({
                toolPrefix: initialData.toolPrefix,
                itemCode: initialData.itemCode || "",
                toolNo: initialData.toolNo,
                toolRefCode: initialData.toolRefCode || "",
                noOfTeeth: getNumberDefault(initialData.noOfTeeth),
                circumferenceMM: getNumberDefault(initialData.circumferenceMM),
                circumferenceInch: getNumberDefault(initialData.circumferenceInch),
                hsnCode: initialData.hsnCode || "",
                purchaseUnit: initialData.purchaseUnit || "",
                purchaseRate: getNumberDefault(initialData.purchaseRate),
                toolName: initialData.toolName,
                toolDescription: initialData.toolDescription || "",
                colorDetails: initialData.colorDetails || "",
                plates: initialData.plates || "",
                lpi: initialData.lpi || "",
                bcm: initialData.bcm || "",
                jobSize: initialData.jobSize || "",
                acrossUps: getNumberDefault(initialData.acrossUps),
                aroundUps: getNumberDefault(initialData.aroundUps),
                acrossGap: getNumberDefault(initialData.acrossGap),
                aroundGap: getNumberDefault(initialData.aroundGap),
            });
        }
    }, [initialData, form]);

    async function onSubmit(data: ToolMasterSchemaType) {
        setIsSubmitting(true);
        try {
            const validData = data;

            const formattedData = {
                ...validData,
                itemCode: validData.toolNo, // Sync itemCode with toolNo
                noOfTeeth: validData.noOfTeeth ? Number(validData.noOfTeeth) : undefined,
                circumferenceMM: validData.circumferenceMM ? Number(validData.circumferenceMM) : undefined,
                circumferenceInch: validData.circumferenceInch ? Number(validData.circumferenceInch) : undefined,
                purchaseRate: validData.purchaseRate ? Number(validData.purchaseRate) : undefined,
                acrossUps: validData.acrossUps ? Number(validData.acrossUps) : undefined,
                aroundUps: validData.aroundUps ? Number(validData.aroundUps) : undefined,
                acrossGap: validData.acrossGap ? Number(validData.acrossGap) : undefined,
                aroundGap: validData.aroundGap ? Number(validData.aroundGap) : undefined,
            };

            if (submitAction === 'create' && initialData && formattedData.toolPrefix) {
                // Regenerate Tool No for Copy New
                const selectedOption = toolPrefixOptions.find(opt => opt.value === formattedData.toolPrefix);
                if (selectedOption) {
                    const prefixCode = selectedOption.code;
                    try {
                        const tools = await import("@/services/api/tool-service").then(m => m.getTools());
                        let maxId = 0;
                        tools.forEach(t => {
                            if (t.toolNo && t.toolNo.startsWith(prefixCode)) {
                                const numStr = t.toolNo.substring(prefixCode.length);
                                const num = parseInt(numStr, 10);
                                if (!isNaN(num) && num > maxId) maxId = num;
                            }
                        });
                        formattedData.toolNo = `${prefixCode}${(maxId + 1).toString().padStart(5, '0')}`;
                    } catch {
                        formattedData.toolNo = `${prefixCode}00001`;
                    }
                    formattedData.itemCode = formattedData.toolNo;
                }
            }

            if (initialData && submitAction === 'update') {
                await updateTool(initialData.id, formattedData as any);
                toast.success("Tool updated successfully!");
            } else {
                await createTool(formattedData as any);
                toast.success(initialData ? "Tool created from copy!" : "Tool created successfully!");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                form.reset();
            }
        } catch (error) {
            toast.error(
                initialData && submitAction === 'update'
                    ? "Failed to update Tool"
                    : "Failed to create Tool"
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
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {/* 1. Tool Prefix */}
                        <FormField
                            control={form.control}
                            name="toolPrefix"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Tool Type*</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-8 text-sm">
                                                <SelectValue placeholder="Select Tool Type " />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {toolPrefixOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label} ({option.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* 2. Tool No */}
                        <FormField
                            control={form.control}
                            name="toolNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Tool No *</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="h-8 px-2 py-1 text-sm bg-muted"
                                            readOnly
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* 10. Tool Name (Moved here) */}
                        <FormField
                            control={form.control}
                            name="toolName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Tool Name *</FormLabel>
                                    <FormControl>
                                        <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* 3. Tool Ref Code */}
                        <FormField
                            control={form.control}
                            name="toolRefCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Tool Ref Code</FormLabel>
                                    <FormControl>
                                        <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* DYNAMIC FIELDS START */}
                        {toolPrefixWatcher === "PLATES" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="colorDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Color Details</FormLabel>
                                            <FormControl>
                                                <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plates"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Plates</FormLabel>
                                            <FormControl>
                                                <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {toolPrefixWatcher === "ANILOX CYLINDER" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="lpi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">LPI</FormLabel>
                                            <FormControl>
                                                <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bcm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">BCM</FormLabel>
                                            <FormControl>
                                                <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {toolPrefixWatcher === "FLEXO DIE" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="jobSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Job Size</FormLabel>
                                            <FormControl>
                                                <Input className="h-8 px-2 py-1 text-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="acrossUps"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Across Ups</FormLabel>
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
                                    name="aroundUps"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Around Ups</FormLabel>
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
                                    name="acrossGap"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Across Gap</FormLabel>
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
                                    name="aroundGap"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Around Gap</FormLabel>
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
                            </>
                        )}
                        {/* DYNAMIC FIELDS END */}

                        {/* 4. No of Teeth */}
                        <FormField
                            control={form.control}
                            name="noOfTeeth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">No. of Teeth</FormLabel>
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

                        {/* 5. Circumference (MM) */}
                        <FormField
                            control={form.control}
                            name="circumferenceMM"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Circumference (MM)</FormLabel>
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

                        {/* 6. Circumference (Inch) */}
                        <FormField
                            control={form.control}
                            name="circumferenceInch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Circumference (Inch)</FormLabel>
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

                        {/* 7. HSN Code */}
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
                                            placeholder="Select HSN"
                                            emptyText="No HSN found."
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* 8. Purchase Unit */}
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
                                            placeholder="Select unit"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* 9. Purchase Rate */}
                        <FormField
                            control={form.control}
                            name="purchaseRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Purchase Rate</FormLabel>
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


                    </div>

                    {/* 11. Tool Description - Full Width */}
                    <FormField
                        control={form.control}
                        name="toolDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Tool Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="min-h-[80px] px-2 py-1 text-sm"
                                        placeholder="Enter detailed tool description..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

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
                            variant="gradient-blue" // Matching RollMaster style
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
