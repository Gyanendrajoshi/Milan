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

    const defaultValues: ProcessMasterFormValues = {
        id: initialData?.id,
        name: initialData?.name || "",
        chargeType: initialData?.chargeType || "",
        isUnitConversion: initialData?.isUnitConversion ?? false,
        rate: initialData?.rate || 0,
    };

    const form = useForm<ProcessMasterFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(processMasterSchema) as any,
        defaultValues,
    });

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
            let code = initialData?.code;
            if (!code) {
                // Auto-generate code (you can improve this logic)
                const timestamp = Date.now().toString().slice(-5);
                code = `PM${timestamp}`;
            }

            const processData = {
                ...values,
                code,
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <FormLabel className="text-xs font-bold text-gray-500">Rate</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-8 text-sm border-slate-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
