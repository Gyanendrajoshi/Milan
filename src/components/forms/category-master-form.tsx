"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryMasterSchema, type CategoryMasterSchemaType } from "@/lib/validations/category-master";
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
import { createCategory, updateCategory } from "@/services/api/category-service";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { CategoryMaster } from "@/types/category-master";
import { getProcessMasterList } from "@/services/api/process-service";
import { ProcessMaster } from "@/types/process-master";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
// Removed placeholder
import { ProcessSelectionDialog } from "@/components/dialogs/process-selection-dialog";


interface CategoryMasterFormProps {
    initialData?: CategoryMaster | null;
    onSuccess?: () => void;
}

export function CategoryMasterForm({ initialData, onSuccess }: CategoryMasterFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
    const [selectedProcesses, setSelectedProcesses] = useState<ProcessMaster[]>([]);
    const [allProcesses, setAllProcesses] = useState<ProcessMaster[]>([]);

    const form = useForm<CategoryMasterSchemaType>({
        resolver: zodResolver(categoryMasterSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            processIds: initialData?.processIds || [], // Assume backend supports this or we map it
        },
    });

    // Load processes from localStorage
    useEffect(() => {
        const loadProcesses = async () => {
            const procs = await getProcessMasterList();
            setAllProcesses(procs);

            // Sync initial processes if editing
            if (initialData) {
                // Reset form values when initialData changes
                form.reset({
                    name: initialData.name,
                    description: initialData.description || "",
                    processIds: initialData.processIds?.map(String) || [],
                });

                if (initialData.processIds && initialData.processIds.length > 0) {
                    // Ensure we compare strings to avoid number/string mismatch
                    const initialSelected = procs.filter(p => initialData.processIds!.map(String).includes(String(p.id)));
                    setSelectedProcesses(initialSelected);
                }
            } else {
                // Reset to empty if adding new
                form.reset({
                    name: "",
                    description: "",
                    processIds: [],
                });
                setSelectedProcesses([]);
            }
        };
        loadProcesses();
    }, [initialData, form]);

    async function onSubmit(data: CategoryMasterSchemaType) {
        setIsSubmitting(true);
        try {
            if (initialData) {
                await updateCategory(initialData.id, data);
            } else {
                await createCategory(data);
            }
            toast.success(initialData ? "Category updated!" : "Category created!");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleProcessSelect = (ids: string[]) => {
        form.setValue("processIds", ids);
        // Update display list - Ensure ID comparison handles string/number mismatch
        const selected = allProcesses.filter(p => ids.includes(String(p.id)));
        setSelectedProcesses(selected);
        form.trigger("processIds"); // Manually trigger validation for processIds
    };

    const handleRemoveProcess = (id: string) => {
        const currentIds = form.getValues("processIds");
        const newIds = currentIds.filter(pid => String(pid) !== String(id));
        form.setValue("processIds", newIds);
        setSelectedProcesses(prev => prev.filter(p => String(p.id) !== String(id)));
        form.trigger("processIds"); // Manually trigger validation for processIds
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Name *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter category name" className="h-9" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter category description"
                                    className="min-h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                {/* Process Selection */}
                {/* Process Selection */}
                <FormField
                    control={form.control}
                    name="processIds"
                    render={() => (
                        <FormItem>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <FormLabel className="text-sm font-medium">Selected Processes</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsProcessDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Process
                                    </Button>
                                </div>

                                {selectedProcesses.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProcesses.map((p) => (
                                            <div key={p.id} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                {p.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProcess(p.id)}
                                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-blue-300/50 p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 border rounded-md border-dashed text-gray-500 text-sm">
                                        No processes selected. Click "Add Process" to select.
                                    </div>
                                )}
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <ProcessSelectionDialog
                    open={isProcessDialogOpen}
                    onOpenChange={setIsProcessDialogOpen}
                    onSelect={handleProcessSelect}
                    preSelectedIds={form.getValues("processIds")}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
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
