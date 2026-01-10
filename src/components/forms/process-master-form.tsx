"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { processMasterSchema, type ProcessMasterFormValues } from "@/lib/validations/process-master";
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
import { Label } from "@/components/ui/label";
import { ProcessMaster, MOCK_CHARGE_TYPES, ChargeType } from "@/types/process-master";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createProcess, updateProcess } from "@/services/api/process-service";
import { toast } from "sonner";

interface ProcessMasterFormProps {
    initialData?: ProcessMaster;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProcessMasterForm({ initialData, onSuccess, onCancel }: ProcessMasterFormProps) {
    const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);
    const [isLoadingCharges, setIsLoadingCharges] = useState(false);

    // Advanced Config State
    const [extraColorRate, setExtraColorRate] = useState("0");
    const [backPrintRate, setBackPrintRate] = useState("0");

    const defaultValues: ProcessMasterFormValues = {
        id: initialData?.id,
        name: initialData?.name || "",
        chargeType: initialData?.chargeType || "",
        isUnitConversion: initialData?.isUnitConversion ?? false,
        rate: initialData?.rate || 0,
        formulaParams: initialData?.formulaParams || "",
    };

    const form = useForm<ProcessMasterFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(processMasterSchema) as any,
        defaultValues,
    });

    const watchChargeType = form.watch("chargeType");

    // Hydrate Advanced State & Reset Form
    useEffect(() => {
        if (initialData) {
            form.reset({
                id: initialData.id ? String(initialData.id) : undefined,
                name: initialData.name,
                chargeType: initialData.chargeType,
                isUnitConversion: initialData.isUnitConversion,
                rate: initialData.rate,
                formulaParams: initialData.formulaParams
            });
            // Hydrate formula params
            if (initialData.formulaParams) {
                try {
                    const params = JSON.parse(initialData.formulaParams);
                    if (params.extraColorRate) setExtraColorRate(params.extraColorRate.toString());
                    if (params.backPrintRate) setBackPrintRate(params.backPrintRate.toString());
                } catch (e) {
                    console.error("Failed to parse formula params", e);
                }
            }
        } else {
            form.reset({
                name: "",
                chargeType: "",
                isUnitConversion: false,
                rate: 0,
                formulaParams: ""
            });
            setExtraColorRate("0");
            setBackPrintRate("0");
        }
    }, [initialData, form]);

    // Simulate Database Fetch for Charge Types
    useEffect(() => {
        const fetchChargeTypes = async () => {
            setIsLoadingCharges(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setChargeTypes(MOCK_CHARGE_TYPES);
            setIsLoadingCharges(false);
        };

        fetchChargeTypes();
    }, []);

    const onSubmit = async (values: ProcessMasterFormValues) => {
        try {
            // Generate code if creating new process
            // Generate code if creating new process
            const code = initialData?.code || ""; // Backend generates code for new items

            // Construct Formula Params
            let formulaParams: string | undefined = undefined;
            if (values.chargeType === "printing_advanced") {
                formulaParams = JSON.stringify({
                    extraColorRate: Number(extraColorRate),
                    backPrintingRate: Number(backPrintRate) // Standardized Key
                });
            }

            const processData = {
                ...values,
                code,
                formulaParams
            };

            if (initialData?.id) {
                // Update existing
                await updateProcess(initialData.id, processData);
            } else {
                // Create new
                await createProcess(processData);
            }

            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save process");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("Form Errors:", errors);
                toast.error("Form Validation Error: " + Object.keys(errors).join(", "));
            })} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500">Process Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter process name" {...field} className="h-8 text-sm border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="chargeType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-gray-500">Type of Charges</FormLabel>
                            <Select
                                disabled={isLoadingCharges}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-8 text-sm border-slate-200">
                                        <SelectValue placeholder={isLoadingCharges ? "Loading..." : "Select charge type"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {chargeTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="isUnitConversion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500">Unit Conversion</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    value={field.value ? "true" : "false"}
                                    defaultValue={field.value ? "true" : "false"}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-8 text-sm border-slate-200">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-gray-500">
                                    {watchChargeType === "printing_advanced" ? "Base Rate (Single Color)" : "Rate"}
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-8 text-sm border-slate-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Advanced Printing Fields */}
                {watchChargeType === "printing_advanced" && (
                    <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-md space-y-4">
                        <h4 className="text-sm font-semibold text-blue-800">Advanced Printing Config</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500">Extra Color Rate</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={extraColorRate}
                                    onChange={(e) => setExtraColorRate(e.target.value)}
                                    className="h-8 text-sm border-blue-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500">Back Printing Rate</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={backPrintRate}
                                    onChange={(e) => setBackPrintRate(e.target.value)}
                                    className="h-8 text-sm border-blue-200"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={onCancel} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" variant="gradient-blue" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {initialData ? "Update Process" : "Create Process"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
