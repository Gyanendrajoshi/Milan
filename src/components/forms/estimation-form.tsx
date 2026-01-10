"use client";

import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { Plus, Trash2, Search, Calculator, Save, ArrowLeft, ArrowDownCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { storage } from "@/services/storage";
import { createEstimation, updateEstimation } from "@/services/api/estimation-service";
import { EstimationCalculator } from "@/lib/calculators/estimation-calculator";
import { getRollById } from "@/services/api/roll-service";
import { getToolById } from "@/services/api/tool-service";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { estimationFormSchema, type EstimationFormValues } from "@/types/estimation";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ToolSelectionDialog } from "@/components/dialogs/tool-selection-dialog";
import { RollSelectionDialog } from "@/components/dialogs/roll-selection-dialog";
import { ProcessSelectionDialog } from "@/components/dialogs/process-selection-dialog";
import { getClients } from "@/services/api/client-service";
import { getProcessMasterList } from "@/services/api/process-service";
import { getCategories } from "@/services/api/category-service";
import { getSalesPersons } from "@/services/api/sales-person-service";
import { getMachines } from "@/services/api/machine-service";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { MOCK_CHARGE_TYPES } from "@/types/process-master";

import { Estimation } from "@/app/estimation/estimation-columns";



interface EstimationFormProps {
    onBack?: () => void;
    initialData?: Estimation;
}

export const EstimationForm = ({ onBack, initialData }: EstimationFormProps) => {
    // Dialog States
    const [toolDialogOpen, setToolDialogOpen] = useState(false);
    const [dieDialogOpen, setDieDialogOpen] = useState(false);
    const [rollDialogOpen, setRollDialogOpen] = useState(false);
    const [processDialogOpen, setProcessDialogOpen] = useState(false);

    // Dialog Key States (for forcing re-mount on re-open)
    const [toolDialogKey, setToolDialogKey] = useState(0);
    const [dieDialogKey, setDieDialogKey] = useState(0);
    const [rollDialogKey, setRollDialogKey] = useState(0);
    const [processDialogKey, setProcessDialogKey] = useState(0);

    // Flow State
    const [isJobDetailsVisible, setIsJobDetailsVisible] = useState(false);
    const [mobileStep, setMobileStep] = useState(1); // 1: Basic, 2: Details, 3: Costing



    // Master Data States
    const [clients, setClients] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [mockProcesses, setMockProcesses] = useState<any[]>([]);

    // Load Master Data
    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [c, cat, proc, sp, mac] = await Promise.all([
                    getClients(),
                    getCategories(),
                    getProcessMasterList(),
                    getSalesPersons(),
                    getMachines()
                ]);
                setClients(c || []);
                setCategories(cat || []);
                setMockProcesses(proc || []);

                // Map Sales Persons
                if (sp) {
                    setSalesPersons(sp.map(s => ({ label: s.name, value: s.name })));
                }

                // Map Machines
                if (mac) {
                    setMachines(mac.map(m => ({ label: m.name, value: m.name })));
                }

            } catch (error) {
                console.error("Failed to load master data", error);
                toast.error("Failed to load master data");
            }
        };
        loadMasters();
    }, []);

    // Dynamic Dropdown Lists
    const [salesPersons, setSalesPersons] = useState<{ label: string; value: string }[]>([]);
    const [machines, setMachines] = useState<{ label: string; value: string }[]>([]);

    // Selected Data States
    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [selectedDie, setSelectedDie] = useState<any>(null);
    const [selectedRoll, setSelectedRoll] = useState<any>(null);
    const [selectedProcesses, setSelectedProcesses] = useState<any[]>([]);
    // Generate Job No: Backend will handle this if empty
    const [jobNo, setJobNo] = useState("");

    // Content Edit State
    const [editingContentId, setEditingContentId] = useState<number | null>(null);

    const form = useForm<EstimationFormValues>({
        resolver: zodResolver(estimationFormSchema) as any,
        defaultValues: {
            date: new Date(),
            clientId: "",
            // Map List Data to Form
            jobCardNo: initialData?.jobCardNo || "",
            jobName: initialData?.jobName || "",
            // client: initialData?.client // We need clientId, but list has client Name.
            // For now, we leave clientId empty or try to match? 
            // In a real app we'd fetch the full object by ID.
            // For this mock, we'll accept starting blank or trying to match name if possible, 
            // but the prompt is specifically about the "Job Code" (ID).
            // So ensuring jobCardNo is mapped is the priority.

            jobPriority: "Medium",
            jobType: "New Job",
            orderQty: initialData?.orderQty || 0,
            category: "",
            contentName: "",
            jobWidthMM: 0,
            jobHeightMM: 0,
            colorsFront: "" as any,
            colorsBack: "" as any,
            upsAcross: 0,
            upsAround: 0,
            totalUps: 0,
            processIds: [],
            // New Scheme Defaults
            baseRunningMtr: 0,
            baseSqMtr: 0,
            baseKg: 0,
            wastagePercent: 0,
            wastageRM: 0,
            totalRunningMtr: 0,
            totalSqMtr: 0,
            totalKg: 0,
            materialRate: 0,
            materialRateUnit: "Kg",
            materialCostAmount: 0,
            processCosts: [],
            additionalCostPercent: 0,
            additionalCostAmount: 0,
            gstPercent: 0,
            gstAmount: 0,
            totalJobCost: 0,
            finalPriceWithGST: 0,
            unitCost: 0,
            finalSalesPrice: 0,
            totalOrderValue: 0,

            // Optionals explicitly undefined
            poNumber: "",
            deliveryDate: initialData?.deliveryDate ? new Date(initialData.deliveryDate) : undefined,
            salesPerson: "",
            toolId: undefined,
            toolTeeth: undefined,
            toolCircumferenceMM: undefined,
            toolCircumferenceInch: undefined,
            rollId: undefined,
            rollWidthMM: undefined,
            rollTotalGSM: undefined,
            machineName: undefined,
            dieId: undefined,
            contents: (initialData as any)?.content || (initialData as any)?.contents || [],
        },
    });

    const { fields: processFields, append: appendProcess, remove: removeProcess, update: updateProcess } = useFieldArray({
        control: form.control,
        name: "processCosts"
    });


    // Function to Add or Update Current Staging Content
    const handleAddContent = () => {
        const values = form.getValues();

        // Base Content Object
        const contentData: any = {
            contentName: values.contentName || `Content ${values.contents.length + 1}`,
            orderQty: values.orderQty, // Save Snapshot
            // Specs
            machineName: values.machineName,
            jobWidthMM: values.jobWidthMM,
            jobHeightMM: values.jobHeightMM,
            colorsFront: values.colorsFront,
            colorsBack: values.colorsBack,
            upsAcross: values.upsAcross,
            upsAround: values.upsAround,
            totalUps: values.totalUps,
            // Resources
            toolId: values.toolId,
            toolTeeth: values.toolTeeth,
            toolCircumferenceMM: values.toolCircumferenceMM,
            toolCircumferenceInch: values.toolCircumferenceInch || 0,
            dieId: values.dieId,
            rollId: values.rollId,
            rollWidthMM: values.rollWidthMM,
            rollTotalGSM: values.rollTotalGSM,
            rollDescription: selectedRoll ? `${selectedRoll.itemCode} | ${selectedRoll.quality} | ${selectedRoll.faceGSM} GSM` : "",
            processIds: values.processIds,
            // Costing
            baseRunningMtr: values.baseRunningMtr,
            baseSqMtr: values.baseSqMtr,
            baseKg: values.baseKg,
            wastagePercent: values.wastagePercent,
            wastageRM: values.wastageRM,
            totalRunningMtr: values.totalRunningMtr,
            totalSqMtr: values.totalSqMtr,
            totalKg: values.totalKg,
            materialRate: values.materialRate,
            materialRateUnit: values.materialRateUnit,
            materialCostAmount: values.materialCostAmount,
            // Deep copy processCosts to prevent reference mutation from form edits
            processCosts: values.processCosts.map(p => ({ ...p })),
            additionalCostPercent: values.additionalCostPercent,
            additionalCostAmount: values.additionalCostAmount,
            totalJobCost: values.totalJobCost,
            unitCost: values.unitCost,
            finalSalesPrice: values.finalSalesPrice,
            totalOrderValue: values.totalOrderValue,
        };

        let updatedContents = [...values.contents];

        if (editingContentId !== null) {
            // Update Existing
            updatedContents = updatedContents.map(c =>
                c.id === editingContentId ? { ...contentData, id: editingContentId } : c
            );
            toast.success("Content Updated Successfully!");
            setEditingContentId(null);
        } else {
            // Add New
            contentData.id = Date.now();
            updatedContents.push(contentData);
            toast.success("Content Added to Job!");
        }

        form.setValue("contents", updatedContents);

        // Reset Staging Area (Keep Globals: OrderQty, Category, etc.)
        form.setValue("contentName", ""); // Clear Name
        form.setValue("machineName", "");
        form.setValue("jobWidthMM", 0);
        form.setValue("jobHeightMM", 0);
        form.setValue("colorsFront", 0);
        form.setValue("colorsBack", 0);
        form.setValue("upsAcross", 0);
        form.setValue("upsAround", 0);
        form.setValue("totalUps", 0);
        setSelectedTool(null);
        form.setValue("toolId", undefined);
        form.setValue("toolTeeth", undefined);
        form.setValue("toolCircumferenceMM", undefined);
        form.setValue("toolCircumferenceInch", undefined);
        setSelectedDie(null);
        form.setValue("dieId", undefined);
        setSelectedRoll(null);
        form.setValue("rollId", undefined);
        form.setValue("rollWidthMM", undefined);
        form.setValue("rollTotalGSM", undefined);

        // Reset Processes with Category Logic
        form.setValue("processCosts", []); // Clear first to ensure fresh defaults
        const currentCat = categories.find(c => c.id === values.category);
        if (currentCat && currentCat.processIds?.length) {
            handleProcessSelect(currentCat.processIds);
        } else {
            setSelectedProcesses([]);
            form.setValue("processIds", []);
        }
        // Reset Calculations
        form.setValue("baseRunningMtr", 0);
        form.setValue("baseSqMtr", 0);
        form.setValue("baseKg", 0);
        form.setValue("wastagePercent", 0);
        form.setValue("wastageRM", 0);
        form.setValue("totalRunningMtr", 0);
        form.setValue("totalSqMtr", 0);
        form.setValue("totalKg", 0);
        form.setValue("materialCostAmount", 0);
        // Reset ALL Costing Fields
        form.setValue("additionalCostPercent", 0);
        form.setValue("additionalCostAmount", 0);
        form.setValue("totalJobCost", 0);
        form.setValue("unitCost", 0);
        form.setValue("finalSalesPrice", 0);
        form.setValue("totalOrderValue", 0);
        // Reset Material Rate to 0 to be safe
        form.setValue("materialRate", 0);
    };

    const handleEditContent = (content: any) => {
        // Load content into form
        setEditingContentId(content.id);

        // Restore Values
        if (content.orderQty && (form.getValues("orderQty") === 0 || !form.getValues("orderQty"))) {
            form.setValue("orderQty", content.orderQty);
        }
        form.setValue("contentName", content.contentName);
        form.setValue("machineName", content.machineName);
        form.setValue("jobWidthMM", content.jobWidthMM);
        form.setValue("jobHeightMM", content.jobHeightMM);
        form.setValue("colorsFront", content.colorsFront);
        form.setValue("colorsBack", content.colorsBack);
        form.setValue("upsAcross", content.upsAcross);
        form.setValue("upsAround", content.upsAround);

        // Restore Resources (Logic to re-select objects needed? Or just IDs?)
        // For UI labels like Tool Name, we need the Object.
        // Ideally we should store the Object in content or re-fetch.
        // For now, we only stored IDs and some props.
        // We will try to find match in lists? Or rely on stored props.

        // Tool
        if (content.toolId) {
            form.setValue("toolId", content.toolId);
            form.setValue("toolTeeth", content.toolTeeth); // Ensure these exist in content
            form.setValue("toolCircumferenceMM", content.toolCircumferenceMM);
            form.setValue("toolCircumferenceInch", content.toolCircumferenceInch);

            // Hydrate UI State
            setSelectedTool({
                id: content.toolId,
                toolName: "Loaded Tool", // Placeholder
                noOfTeeth: content.toolTeeth, // MATCH UI EXPECTATION
                circumferenceMM: content.toolCircumferenceMM,
                circumferenceInch: content.toolCircumferenceInch,
            });
        }

        // Roll
        if (content.rollId) {
            form.setValue("rollId", content.rollId);
            form.setValue("rollWidthMM", content.rollWidthMM);
            form.setValue("rollTotalGSM", content.rollTotalGSM);

            // Hydrate UI State
            setSelectedRoll({
                id: content.rollId,
                itemName: "Loaded Roll", // Placeholder
                rollWidthMM: content.rollWidthMM,
                faceGSM: content.rollTotalGSM, // MATCH UI EXPECTATION
                totalGSM: content.rollTotalGSM, // Keep both if needed
                purchaseUnit: "KG" // Default
            });
        }

        // Processes
        if (content.processIds && content.processIds.length > 0) {
            const procs = mockProcesses.filter(p => content.processIds.includes(p.id));
            setSelectedProcesses(procs);
            form.setValue("processIds", content.processIds);
        }

        // Costing Fields (Direct set)
        form.setValue("baseRunningMtr", content.baseRunningMtr);
        form.setValue("baseSqMtr", content.baseSqMtr);
        form.setValue("baseKg", content.baseKg);
        form.setValue("wastagePercent", content.wastagePercent);
        form.setValue("wastageRM", content.wastageRM);
        // ... (Effects will re-run? We should set them explicitly to match saved state)
        form.setValue("materialRate", content.materialRate);
        form.setValue("processCosts", content.processCosts);
        form.setValue("additionalCostPercent", content.additionalCostPercent);
        form.setValue("additionalCostAmount", content.additionalCostAmount);

        // Create temporary objects for calculation override
        let toolObj: any = undefined;
        let rollObj: any = undefined;

        // Tool
        if (content.toolId) {
            toolObj = {
                id: content.toolId,
                noOfTeeth: content.toolTeeth,
                circumferenceMM: content.toolCircumferenceMM,
                circumferenceInch: content.toolCircumferenceInch,
            };
        }

        // Roll
        if (content.rollId) {
            rollObj = {
                id: content.rollId,
                rollWidthMM: content.rollWidthMM,
                totalGSM: content.rollTotalGSM,
                purchaseUnit: "KG" // Default for now if not in content, or derive logic
            };
        }

        toast.info("Content loaded for editing");

        // Force validation and recalculation to ensure Summary is correct
        setTimeout(() => {
            recalculateAll(undefined, undefined, rollObj, toolObj);
        }, 100);

        // Scroll to Top of Jobs
        const element = document.getElementById("job-details-top");
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Load Master Data ---
    // --- Load Master Data (Duplicate removed) ---
    // The main master data loading happens at lines 82-112.
    // Removing this duplicate block to prevent race conditions.

    // --- Load Initial Data for Edit Mode ---
    useEffect(() => {
        if (initialData && clients.length > 0) {
            console.log("Loading initial data for edit:", initialData);

            // Cast initialData to include all form fields (saved data has more than list view type)
            const fullData = initialData as any;

            // Reset form with all available data
            form.reset({
                ...fullData,
                date: fullData.date ? new Date(fullData.date) : new Date(),
                deliveryDate: fullData.deliveryDate ? new Date(fullData.deliveryDate) : undefined,
                // Ensure all fields are populated
                jobCardNo: fullData.jobCardNo || jobNo,
                clientId: fullData.clientId ? String(fullData.clientId) : "",
                jobName: fullData.jobName || "",
                orderQty: initialData.orderQty || fullData.orderQty || 0,
                category: fullData.categoryId ? String(fullData.categoryId) : "",
                poNumber: fullData.poNumber || "",
                salesPerson: fullData.salesPersonName || fullData.salesPerson || "",
                jobPriority: fullData.jobPriority || "Medium",
                jobType: fullData.jobType || "New Job",

                // Job specifications
                jobWidthMM: fullData.jobWidthMM || 0,
                jobHeightMM: fullData.jobHeightMM || 0,
                colorsFront: fullData.colorsFront || 0,
                colorsBack: fullData.colorsBack || 0,
                upsAcross: fullData.upsAcross || 0,
                upsAround: fullData.upsAround || 0,
                totalUps: fullData.totalUps || 0,

                // Tool/Roll/Die
                toolId: fullData.toolId,
                toolTeeth: fullData.toolTeeth,
                toolCircumferenceMM: fullData.toolCircumferenceMM,
                toolCircumferenceInch: fullData.toolCircumferenceInch,
                dieId: fullData.dieId,
                rollId: fullData.rollId,
                rollWidthMM: fullData.rollWidthMM,
                rollTotalGSM: fullData.rollTotalGSM,

                // Requirements
                baseRunningMtr: fullData.baseRunningMtr || 0,
                baseSqMtr: fullData.baseSqMtr || 0,
                baseKg: fullData.baseKg || 0,
                wastagePercent: fullData.wastagePercent || 0,
                wastageRM: fullData.wastageRM || 0,
                totalRunningMtr: fullData.totalRunningMtr || 0,
                totalSqMtr: fullData.totalSqMtr || 0,
                totalKg: fullData.totalKg || 0,

                // Material costing
                materialRate: fullData.materialRate || 0,
                materialRateUnit: fullData.materialRateUnit || "Kg",
                materialCostAmount: fullData.materialCostAmount || 0,

                // Process costing
                processIds: fullData.processIds || [],
                processCosts: fullData.processCosts || [],

                // Financial
                additionalCostPercent: fullData.additionalCostPercent || 0,
                additionalCostAmount: fullData.additionalCostAmount || 0,
                totalJobCost: fullData.totalJobCost || 0,
                unitCost: fullData.unitCost || 0,
                finalSalesPrice: fullData.finalSalesPrice || 0,
                totalOrderValue: fullData.totalOrderValue || 0,

                // Contents (if any)
                contents: fullData.content || fullData.contents || [],
            } as any);

            // Set selected states for UI
            if (fullData.toolId) {
                // Fetch complete tool data from API
                getToolById(String(fullData.toolId)).then(toolData => {
                    if (toolData) {
                        setSelectedTool({
                            ...toolData,
                            noOfTeeth: fullData.toolTeeth || toolData.noOfTeeth,
                            circumferenceMM: fullData.toolCircumferenceMM || toolData.circumferenceMM,
                            circumferenceInch: fullData.toolCircumferenceInch || toolData.circumferenceInch,
                        });
                    }
                }).catch(err => {
                    console.error("Failed to fetch tool data:", err);
                    // Fallback to basic data
                    setSelectedTool({
                        id: fullData.toolId,
                        toolName: "Loaded Tool",
                        noOfTeeth: fullData.toolTeeth,
                        circumferenceMM: fullData.toolCircumferenceMM,
                        circumferenceInch: fullData.toolCircumferenceInch,
                    });
                });
            }

            if (fullData.rollId) {
                // Fetch complete roll data from API
                getRollById(String(fullData.rollId)).then(rollData => {
                    if (rollData) {
                        console.log("[Edit Mode] Fetched roll data:", rollData);
                        setSelectedRoll({
                            ...rollData,
                            rollWidthMM: fullData.rollWidthMM || rollData.rollWidthMM,
                            faceGSM: fullData.rollTotalGSM || rollData.faceGSM,
                            totalGSM: fullData.rollTotalGSM || rollData.totalGSM,
                        });
                    }
                }).catch(err => {
                    console.error("Failed to fetch roll data:", err);
                    // Fallback to basic data
                    setSelectedRoll({
                        id: fullData.rollId,
                        itemName: "Loaded Roll",
                        rollWidthMM: fullData.rollWidthMM,
                        faceGSM: fullData.rollTotalGSM,
                        totalGSM: fullData.rollTotalGSM,
                    });
                });
            }

            // Set selected processes from processCosts
            if (fullData.processCosts && fullData.processCosts.length > 0) {
                const processes = fullData.processCosts.map((pc: any) => ({
                    id: pc.processId,
                    name: pc.processName || mockProcesses.find((p: any) => p.id === pc.processId)?.processName || 'Process'
                }));
                setSelectedProcesses(processes);
            }

            if (fullData.dieId) {
                setSelectedDie({
                    id: fullData.dieId,
                });
            }
        }
    }, [initialData, clients, form, jobNo]);


    // --- Calculations & Autosync ---
    const { watch, setValue, getValues, trigger } = form;
    const upsAcross = watch("upsAcross");
    const upsAround = watch("upsAround");
    const categoryId = watch("category");
    const orderQty = parseFloat(watch("orderQty") as any) || 0;

    // --- Costing Watchers ---
    const jobLength = watch("jobHeightMM") || 0;
    const wastagePercent = watch("wastagePercent");
    const wastageRM = watch("wastageRM");

    const rollWidth = watch("rollWidthMM") || 0;
    const rollGSM = watch("rollTotalGSM") || 0;
    const materialRate = watch("materialRate") || 0;
    const processCosts = watch("processCosts") || [];
    const additionalCostPercent = watch("additionalCostPercent");
    const additionalCostAmount = watch("additionalCostAmount");
    const finalSalesPrice = watch("finalSalesPrice");

    // --- Calculations Refactoring ---
    // Removed fragile useEffect chains. Now using explicit recalculation via EstimationCalculator.



    // Central Recalculation Handler
    // Call this whenever a dependency changes (Qty, Ups, Size, Roll, Processes, Wastage)
    const recalculateAll = useCallback((fieldChanged?: string, value?: any, overrideRoll?: any, overrideTool?: any) => {
        const values = form.getValues();
        const toolCircumference = values.toolCircumferenceMM ? parseFloat(values.toolCircumferenceMM as any) : 0;

        // 1. Prepare Inputs
        const inputs = {
            orderQty: parseFloat(values.orderQty as any) || 0,
            upsAcross: values.upsAcross,
            upsAround: values.upsAround,
            jobHeightMM: values.jobHeightMM,
            rollWidthMM: values.rollWidthMM || 0,
            rollGSM: values.rollTotalGSM || 0,
            wastagePercent: values.wastagePercent,
            wastageRM: values.wastageRM,
            tool: toolCircumference > 0 ? { circumferenceMM: toolCircumference } : undefined
        };

        // Skip calculation silently if critical data is missing (user still filling form)
        if (inputs.orderQty <= 0 || inputs.rollGSM <= 0 || inputs.rollWidthMM <= 0 || inputs.jobHeightMM <= 0) {
            // Reset calculated fields to zero
            form.setValue("totalUps", 0);
            form.setValue("baseRunningMtr", 0);
            form.setValue("baseSqMtr", 0);
            form.setValue("baseKg", 0);
            form.setValue("totalRunningMtr", 0);
            form.setValue("totalSqMtr", 0);
            form.setValue("totalKg", 0);
            // form.setValue("materialCostAmount", 0); // Keep old amount? No, reset.
            form.setValue("totalJobCost", 0);
            return; // Exit early without error
        }

        try {
            // 2. Run Base Calc with Validation
            const results = EstimationCalculator.calculateRequirements(inputs);

            // 3. Update Form for Requirements
            form.setValue("totalUps", results.totalUps);
            form.setValue("baseRunningMtr", results.baseRunningMtr);
            form.setValue("baseSqMtr", results.baseSqMtr);
            form.setValue("baseKg", results.baseKg);
            form.setValue("totalRunningMtr", results.totalRunningMtr);
            form.setValue("totalSqMtr", results.totalSqMtr);
            form.setValue("totalKg", results.totalKg);

            // Update Wastage Fields (avoid loops if not needed, but safe to set)
            if (fieldChanged !== "wastagePercent" && fieldChanged !== "wastageRM") {
                form.setValue("wastagePercent", results.wastagePercent);
                form.setValue("wastageRM", results.wastageRM);
            } else if (fieldChanged === "wastageRM") {
                form.setValue("wastagePercent", results.wastagePercent);
            } else if (fieldChanged === "wastagePercent") {
                form.setValue("wastageRM", results.wastageRM);
            }

            // 4. Update Process Costs
            const currentProcesses = values.processCosts || [];
            const totalsForProcess = {
                totalKg: results.totalKg,
                totalRM: results.totalRunningMtr,
                totalSqMtr: results.totalSqMtr,
                orderQty: inputs.orderQty,
                colors: Number(values.colorsFront || 0) + Number(values.colorsBack || 0),
                colorsBack: Number(values.colorsBack || 0),
                sizeW: values.jobWidthMM || 0,
                sizeL: values.jobHeightMM || 0
            };

            const updatedProcesses = currentProcesses.map(proc => {
                const { quantity, rate, amount, isManualQuantity, isManualRate, debugInfo } = EstimationCalculator.calculateProcessCost(proc, totalsForProcess);
                return { ...proc, quantity, rate, amount, isManualQuantity: isManualQuantity || false, isManualRate: isManualRate || false, debugInfo };
            });

            form.setValue("processCosts", updatedProcesses);

            // 5. Update Financials
            const materialRate = values.materialRate || 0;
            const currentRoll = overrideRoll || selectedRoll;
            const rollUnit = currentRoll?.purchaseUnit || "KG";
            let matQty = results.totalKg;
            let matUnitLabel = "Kg";

            if (rollUnit === "SQ MTR") {
                matQty = results.totalSqMtr;
                matUnitLabel = "SqMtr";
            } else if (rollUnit === "RUN MTR" || rollUnit === "MTR") {
                matQty = results.totalRunningMtr;
                matUnitLabel = "RunningMtr";
            }

            const matCost = parseFloat((matQty * materialRate).toFixed(2));
            form.setValue("materialCostAmount", matCost);
            form.setValue("materialRateUnit", matUnitLabel as any);

            // Calculate Financials with GST
            const gstPercent = values.gstPercent || 0;
            const fin = EstimationCalculator.calculateFinancials(
                matCost,
                updatedProcesses,
                values.additionalCostAmount || 0,
                inputs.orderQty,
                gstPercent
            );

            form.setValue("totalJobCost", fin.totalJobCost);
            form.setValue("gstAmount", fin.gstAmount);
            form.setValue("finalPriceWithGST", fin.finalPriceWithGST);
            form.setValue("unitCost", fin.unitCost);

            // Auto-set Sales Price if empty
            const currentSales = values.finalSalesPrice;
            if (!currentSales || currentSales === 0) {
                form.setValue("finalSalesPrice", fin.unitCost);
                form.setValue("totalOrderValue", parseFloat((fin.unitCost * inputs.orderQty).toFixed(2)));
            } else {
                form.setValue("totalOrderValue", parseFloat((currentSales * inputs.orderQty).toFixed(2)));
            }
        } catch (error: any) {
            // Display validation errors as prominent warnings
            if (error.message && error.message.startsWith("CRITICAL:")) {
                toast.error("Calculation Error", {
                    description: error.message,
                    duration: 5000
                });
            } else {
                console.error("Calculation error:", error);
            }
        }
    }, [form, selectedRoll, selectedTool]);

    // Explicit Trigger Handlers (Attached to Inputs via onChange/onBlur)
    const handleCalcTrigger = (field: string, val: any) => {
        // Standard form update first
        // form.setValue(field, val); // Usually handled by RHF onChange
        // We assume RHF onChange happened, or we do it here if using controlled custom input

        // Wait for state to propagate? getValues gets current form state.
        // If called from onChange, might need to pass value explicitly to override getValues stale data?
        // Better to use RHF's setValue then call recalc.

        // Actually, best pattern: 
        // onChange={e => { field.onChange(e); recalculateAll(name, e.target.value); }}
    };

    // Watch for key drivers (for effects that MUST remain, e.g. external data loading)
    // BUT we want to remove effects. We will rely on onBlur or Specific Change Handlers for the inputs.

    // --- Re-implementing Effects as One-Shot Subscription ---
    // We can keep ONE useEffect that listens to [upsAcross, upsAround, etc] and calls recalculateAll.
    // This effectively debounces/centralizes the logic.
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            // Filter fields that trigger recalc
            const triggers = [
                "orderQty", "upsAcross", "upsAround", "jobHeightMM", "jobWidthMM",
                "rollWidthMM", "rollTotalGSM",
                "materialRate", "gstPercent",
                "colorsFront", "colorsBack"
            ];

            if (name && triggers.includes(name)) {
                const val = (value as any)[name];
                const timer = setTimeout(() => recalculateAll(name, val), 50);
                return () => clearTimeout(timer);
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch, selectedTool, selectedRoll]);



    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    async function onSubmit(data: EstimationFormValues) {
        console.log("=== ESTIMATION SAVE STARTED ===");
        console.log("Form Data:", JSON.stringify(data, null, 2));

        setIsSaving(true);
        try {
            // Validate required fields manually for better error messages
            console.log("Step 1: Validating required fields...");

            if (!data.clientId) {
                console.error("Validation failed: Missing clientId");
                toast.error("Validation Error", { description: "Please select a Client" });
                setIsSaving(false);
                return;
            }
            if (!data.jobName) {
                console.error("Validation failed: Missing jobName");
                toast.error("Validation Error", { description: "Please enter Job Name" });
                setIsSaving(false);
                return;
            }
            if (!data.orderQty || data.orderQty < 1) {
                console.error("Validation failed: Invalid orderQty", data.orderQty);
                toast.error("Validation Error", { description: "Please enter Order Quantity (minimum 1)" });
                setIsSaving(false);
                return;
            }
            if (!data.category) {
                console.error("Validation failed: Missing category");
                toast.error("Validation Error", { description: "Please select a Category" });
                setIsSaving(false);
                return;
            }

            console.log("✓ Validation passed");

            // REMOVED: Artificial delay
            // await new Promise(resolve => setTimeout(resolve, 800));

            console.log("Step 2: Preparing final data...");

            // Logic: If we have multiple contents, the "Job" totals should be the sum of contents.
            // If contents is empty, it's a single content job, so we use the form values (data) directly.
            let finalData = { ...data };

            if (data.contents && data.contents.length > 0) {
                console.log(`Processing ${data.contents.length} content items...`);
                const totalCost = data.contents.reduce((sum: number, c: any) => sum + (c.totalJobCost || 0), 0);
                const totalValue = data.contents.reduce((sum: number, c: any) => sum + (c.totalOrderValue || 0), 0);
                const totalQty = data.contents.reduce((sum: number, c: any) => sum + (c.orderQty || 0), 0);

                finalData.totalJobCost = parseFloat(totalCost.toFixed(2));
                finalData.totalOrderValue = parseFloat(totalValue.toFixed(2));
                finalData.orderQty = totalQty;

                console.log(`Aggregated totals - Cost: ${totalCost}, Value: ${totalValue}, Qty: ${totalQty}`);
            }

            console.log("Step 3: Saving to storage...");

            console.log("Step 3: Saving to backend...");

            // Construct DTO
            const payload: any = {
                jobCardNo: (data.jobCardNo === "Auto Generated" || !data.jobCardNo) ? "" : data.jobCardNo, // Force empty for backend generation
                date: data.date ? format(data.date, "yyyy-MM-dd") : new Date().toISOString(),
                clientId: Number(data.clientId),
                jobName: data.jobName,
                jobPriority: data.jobPriority,
                jobType: data.jobType,
                status: "Draft",
                orderQty: Number(data.orderQty),
                categoryId: Number(data.category), // Assuming Category Value is ID
                poNumber: data.poNumber,
                deliveryDate: data.deliveryDate ? format(data.deliveryDate, "yyyy-MM-dd") : undefined,
                salesPersonName: data.salesPerson,

                totalJobCost: data.totalJobCost,
                finalPriceWithGST: data.finalPriceWithGST,
                unitCost: data.unitCost,
                finalSalesPrice: data.finalSalesPrice,
                totalOrderValue: data.totalOrderValue,

                content: []
            };

            // Map Contents
            // If contents array is populated, use it.
            // If empty, use current form state as single content item.
            const contentSource = (data.contents && data.contents.length > 0) ? data.contents : [data];

            payload.content = contentSource.map((item: any) => {
                const mapped = {
                    contentName: item.contentName || "Main Content",
                    machineName: item.machineName,
                    jobWidthMM: item.jobWidthMM,
                    jobHeightMM: item.jobHeightMM,
                    colorsFront: item.colorsFront,
                    colorsBack: item.colorsBack,
                    upsAcross: item.upsAcross,
                    upsAround: item.upsAround,
                    totalUps: item.totalUps,
                    toolId: item.toolId ? Number(item.toolId) : null,
                    toolTeeth: item.toolTeeth ? Number(item.toolTeeth) : null,
                    toolCircumferenceMM: item.toolCircumferenceMM ? Number(item.toolCircumferenceMM) : null,
                    toolCircumferenceInch: item.toolCircumferenceInch ? Number(item.toolCircumferenceInch) : null,

                    dieId: item.dieId ? Number(item.dieId) : null,

                    rollId: item.rollId ? Number(item.rollId) : null,
                    rollWidthMM: item.rollWidthMM ? Number(item.rollWidthMM) : null,
                    rollTotalGSM: item.rollTotalGSM ? Number(item.rollTotalGSM) : null,
                    // RollMaster 'Id' is INT. 'RollNo' is String. 'rollId' in form is likely RollNo if not handled.
                    // Actually RollMasters Table has Id (int).
                    // Frontend RollSelection returns object. form.rollId likely set to ID. check handleRollSelect.

                    baseRunningMtr: item.baseRunningMtr,
                    baseSqMtr: item.baseSqMtr,
                    baseKg: item.baseKg,
                    wastagePercent: item.wastagePercent,
                    wastageRM: item.wastageRM,
                    totalRunningMtr: item.totalRunningMtr,
                    totalSqMtr: item.totalSqMtr,
                    totalKg: item.totalKg,
                    materialRate: item.materialRate,
                    materialCostAmount: item.materialCostAmount,
                    additionalCostPercent: item.additionalCostPercent,
                    additionalCostAmount: item.additionalCostAmount,

                    processCosts: item.processCosts?.map((pc: any) => ({
                        processId: Number(pc.processId),
                        rateType: pc.rateType,
                        quantity: pc.quantity,
                        rate: pc.rate,
                        amount: pc.amount,
                        isManualQuantity: pc.isManualQuantity,
                        isManualRate: pc.isManualRate,
                        baseRate: pc.baseRate,
                        extraColorRate: pc.extraColorRate,
                        backPrintingRate: pc.backPrintingRate,
                        debugInfo: pc.debugInfo
                    })) || []
                };

                console.log("Frontend Payload Item:", {
                    contentName: mapped.contentName,
                    toolId: mapped.toolId,
                    toolTeeth: mapped.toolTeeth,
                    rollId: mapped.rollId,
                    rollWidthMM: mapped.rollWidthMM,
                    rollTotalGSM: mapped.rollTotalGSM,
                    dieId: mapped.dieId
                });

                return mapped;
            });

            // Handle RollId specific check (Frontend uses string ID sometimes?)
            // If rollId is NaN, it might be textual. But DB expects INT.
            // For now assuming handleRollSelect sets ID.

            console.log("Payload:", JSON.stringify(payload, null, 2));
            console.log("Payload Content Array Length:", payload.content?.length || 0);
            console.log("Payload Content Array:", payload.content);

            if (initialData?.id) {
                await updateEstimation(Number(initialData.id), payload);
                toast.success("Estimation Updated Successfully!");
            } else {
                await createEstimation(payload);
                toast.success("Estimation Created Successfully!");
            }

            console.log("Step 4: Navigating...");
            if (onBack) {
                onBack();
            } else {
                // Force refresh or redirect
                // router.push("/production/estimation"); 
                // Actually, if we are in a dialog/page, we might want to just refresh list
                window.location.href = "/production/estimation";
            }

            console.log("=== ESTIMATION SAVE COMPLETED SUCCESSFULLY ===");
        } catch (error: any) {
            console.error("=== SAVE ERROR ===");
            console.error("Error object:", error);

            // Show detailed error if available
            const msg = error?.response?.data?.message || error?.message || "Unknown error";
            toast.error("Failed to save estimation", {
                description: msg
            });
        } finally {
            setIsSaving(false);
        }
    }

    // Helper to block invalid chars for integer inputs
    const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleAddBasicInfo = async () => {
        const isValid = await trigger(["date", "clientId", "jobName", "jobType", "jobPriority", "salesPerson"]);
        if (isValid) {
            setIsJobDetailsVisible(true);
            setMobileStep(2);
            toast.success("Basic Info Added", { description: "Proceeding to job details..." });
        } else {
            toast.error("Missing Fields", { description: "Please fill all required basic info." });
        }
    }

    // Handlers
    const handleToolSelect = useCallback((tool: any) => {
        setSelectedTool(tool);
        setValue("toolId", tool.id);
        // Robust property access (handling API casing variations)
        const teeth = tool.noOfTeeth || tool.NoOfTeeth || tool.teeth || tool.Teeth || 0;
        const circMM = tool.circumferenceMM || tool.CircumferenceMM || 0;

        setValue("toolTeeth", teeth);
        setValue("toolCircumferenceMM", circMM);
        setValue("toolCircumferenceInch", parseFloat((circMM / 25.4).toFixed(4)));
        setToolDialogOpen(false);
        // Trigger recalc logic since tool changed
        setTimeout(() => recalculateAll("toolId"), 50);
    }, [setValue, recalculateAll]);

    const handleDieSelect = useCallback((die: any) => {
        setSelectedDie(die);
        setValue("dieId", die.id);
        setDieDialogOpen(false);
    }, [setValue]);

    const handleRollSelect = useCallback((roll: any) => {
        // Robust property access
        const width = roll.rollWidthMM || roll.RollWidthMM || roll.width || 0;
        const gsm = roll.totalGSM || roll.TotalGSM || roll.faceGSM || roll.FaceGSM || 0;
        const rate = roll.purchaseRate || roll.PurchaseRate || 0;

        // Validate roll data for suspicious values
        if (width < 100) {
            toast.warning("Suspiciously Small Roll Width!", {
                description: `Roll width is ${width}mm. Did you mean ${width * 100}mm? This will result in very low material calculations.`
            });
        }
        if (gsm < 20) {
            toast.warning("Suspiciously Small Roll GSM!", {
                description: `Roll GSM is ${gsm}gsm. This is very low and will result in minimal material weight. Please verify your Roll Master data.`
            });
        }

        setSelectedRoll(roll);
        setValue("rollId", roll.id);
        setValue("rollWidthMM", width);
        setValue("rollTotalGSM", gsm);
        setValue("materialRate", rate);
        setRollDialogOpen(false);
        // Trigger recalc logic since roll changed
        setTimeout(() => recalculateAll("rollId"), 50);
    }, [setValue, recalculateAll]);

    const handleProcessSelect = useCallback((selectedIds: string[]) => {
        // Find newly added processes to update form array
        const processes = mockProcesses.filter(p => selectedIds.some(id => String(id) === String(p.id)));
        setSelectedProcesses(processes);
        setValue("processIds", selectedIds);

        // Update Cost Array Logic (Manual Sync now needed since effect is gone)
        const currentCosts = getValues("processCosts") || [];
        const newCostArray = processes.map(proc => {
            const existing = currentCosts.find(c => String(c.processId) === String(proc.id));
            const typeEntry = MOCK_CHARGE_TYPES.find(t => t.value === proc.chargeType);
            const mappedRateType = typeEntry ? typeEntry.label : "Per KG" as any;

            // Parse advanced config if available
            let extraRate = 0;
            let backRate = 0;
            if (proc.formulaParams) {
                try {
                    const params = JSON.parse(proc.formulaParams);
                    extraRate = Number(params.extraColorRate || 0);
                    // Check both keys for robustness
                    backRate = Number(params.backPrintingRate || params.backPrintRate || 0);
                } catch (e) {
                    console.error("Failed to parse process params", e);
                }
            }

            return {
                processId: proc.id,
                processName: proc.name,
                rateType: existing?.rateType || mappedRateType,
                quantity: existing?.quantity || 0,
                rate: existing?.rate || proc.rate || 0,
                amount: existing?.amount || 0,
                isManualQuantity: existing?.isManualQuantity || false,
                isManualRate: existing?.isManualRate || false,
                baseRate: existing?.baseRate || proc.rate || 0, // Store Base Rate
                extraColorRate: existing?.extraColorRate || extraRate,
                backPrintingRate: existing?.backPrintingRate || backRate
            };
        });

        setValue("processCosts", newCostArray);
        setProcessDialogOpen(false);
        // Recalc
        setTimeout(() => recalculateAll("processCosts"), 50);
    }, [setValue, recalculateAll, getValues, mockProcesses]);

    // Explicit Handlers for Calculation Drivers
    const handleWastagePercentChange = (val: number) => {
        setValue("wastagePercent", val);
        recalculateAll("wastagePercent", val);
    };

    const handleWastageRMChange = (val: number) => {
        setValue("wastageRM", val);
        recalculateAll("wastageRM", val);
    };

    const handleAdditionalPercentChange = (val: number) => {
        const mat = getValues("materialCostAmount") || 0;
        const proc = (getValues("processCosts") || []).reduce((s, p) => s + (p.amount || 0), 0);
        const base = mat + proc;
        const amt = (base * val) / 100;
        setValue("additionalCostAmount", parseFloat(amt.toFixed(2)));
        setValue("additionalCostPercent", val);
        recalculateAll("additionalCostAmount", amt);
    };

    const handleAdditionalAmountChange = (val: number) => {
        const mat = getValues("materialCostAmount") || 0;
        const proc = (getValues("processCosts") || []).reduce((s, p) => s + (p.amount || 0), 0);
        const base = mat + proc;
        const pct = base > 0 ? (val / base) * 100 : 0;
        setValue("additionalCostPercent", parseFloat(pct.toFixed(2)));
        setValue("additionalCostAmount", val);
        recalculateAll("additionalCostAmount", val);
    };

    const handleCreateSalesPerson = (val: string) => {
        const newItem = { label: val, value: val };
        setSalesPersons([...salesPersons, newItem]);
        setValue("salesPerson", val);
        toast.success(`Sales Person "${val}" added.`);
    };

    const handleCreateMachine = (val: string) => {
        const newItem = { label: val, value: val };
        setMachines([...machines, newItem]);
        setValue("machineName", val);
        toast.success(`Machine "${val}" added.`);
    };

    // Shared input styles (Mobile: Regular, Desktop: Compact)
    // Shared input styles (Mobile: Regular, Desktop: Compact)
    const inputClass = "h-8 md:h-6 text-sm md:text-[10px] bg-white px-2 border-slate-200 focus:border-blue-500 transition-colors shadow-sm";
    const labelClass = "text-xs md:text-[10px] font-bold text-gray-500";

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error("VALIDATION ERROR DETAIL:", JSON.stringify(errors, null, 2));
                    toast.error("Form Validation Failed", {
                        description: `Check console for details on: ${Object.keys(errors).join(", ")}`
                    });
                })} className="space-y-2">

                    {/* --- 1. MINIMAL TOP BAR (Back Button) --- */}
                    {onBack && (
                        <div className="container mx-auto px-2 py-1 flex justify-between items-center">
                            <Button type="button" variant="ghost" size="sm" className="h-8 md:h-6 gap-1 text-slate-500 hover:text-slate-800 px-2 -ml-2 text-sm md:text-xs" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4 md:h-3 md:w-3" /> Back to Estimations
                            </Button>
                        </div>
                    )}

                    <div className="container mx-auto px-2 space-y-2">


                        {/* --- 2. BASIC INFO SECTION (Step 1) --- */}
                        <div className={mobileStep !== 1 ? "hidden md:block" : "block"}>
                            <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden">
                                <CardHeader className="py-2 px-3 border-b border-cyan-100 bg-theme-gradient-r rounded-t-lg">
                                    <CardTitle className="text-[10px] font-bold text-white flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white ring-2 ring-cyan-400" /> Basic Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 md:p-1.5">
                                    <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-1.5 items-end">
                                        {/* Row 1: JobNo(2), Date(2), Client(2), JobName(2), Order(2), Cat(2) = 12 */}
                                        <div className="md:col-span-2 space-y-1 md:space-y-0.5">
                                            <div className={labelClass}>Job No</div>
                                            <div className={`${inputClass} bg-gray-100 text-center font-bold flex items-center justify-center border rounded px-1 text-[10px]`}>{form.watch("jobCardNo")}</div>
                                        </div>
                                        <FormField name="date" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Date</FormLabel>
                                                <Input
                                                    type="date"
                                                    className={`${inputClass} cursor-not-allowed opacity-80`}
                                                    readOnly
                                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                                // No onChange, it's read-only
                                                />
                                            </FormItem>
                                        )} />
                                        <FormField name="clientId" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Client Name</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.clientName}</SelectItem>)}</SelectContent></Select>
                                            </FormItem>
                                        )} />
                                        <FormField name="jobName" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Job Name</FormLabel>
                                                <FormControl><Input {...field} className={inputClass} placeholder="Job Name" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="orderQty" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Order Qty</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className={inputClass}
                                                        onKeyDown={blockInvalidChar}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="category" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Category</FormLabel>
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val);
                                                    const cat = categories.find(c => String(c.id) === String(val));
                                                    if (cat && cat.processIds?.length) {
                                                        const procIds = cat.processIds.map(String);
                                                        handleProcessSelect(procIds);
                                                    }
                                                }} value={field.value}>
                                                    <FormControl><SelectTrigger className={`${inputClass} px-2`}><SelectValue placeholder="-" /></SelectTrigger></FormControl>
                                                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name || c.categoryName}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />

                                        {/* Row 2: PO(2) + Delivery(2) + Sales(2) + Priority(2) + JobType(2) + Button(2) = 12 */}
                                        <FormField name="poNumber" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>PO No</FormLabel>
                                                <FormControl><Input {...field} className={inputClass} placeholder="Opt" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="deliveryDate" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Delivery</FormLabel>
                                                <Input
                                                    type="date"
                                                    className={`${inputClass} cursor-pointer`}
                                                    onClick={(e) => e.currentTarget.showPicker()}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            </FormItem>
                                        )} />
                                        <FormField name="salesPerson" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Sales Person</FormLabel>
                                                <FormControl>
                                                    <CreatableCombobox
                                                        options={salesPersons}
                                                        value={field.value}
                                                        onSelect={field.onChange}
                                                        onCreate={handleCreateSalesPerson}
                                                        placeholder="Select"
                                                        className={inputClass}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField name="jobPriority" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Priority</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select>
                                            </FormItem>
                                        )} />
                                        <FormField name="jobType" control={form.control} render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                <FormLabel className={labelClass}>Job Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="New Job">New Job</SelectItem><SelectItem value="Repeat Job">Repeat Job</SelectItem></SelectContent></Select>
                                            </FormItem>
                                        )} />

                                        {/* Button aligned right in remaining 2 cols */}
                                        <div className="hidden md:flex col-span-2 items-end justify-end">
                                            <Button type="button" onClick={handleAddBasicInfo} variant="gradient-blue" className="w-auto h-6 text-[10px] px-3">
                                                Next <ArrowDownCircle className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Mobile Button (Full Width) */}
                                        <div className="md:hidden col-span-2 flex items-end justify-end mt-2">
                                            <Button type="button" onClick={handleAddBasicInfo} variant="gradient-blue" className="w-full h-9 text-sm">
                                                Next <ArrowDownCircle className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>


                        {/* --- 3. DETAILED SECTIONS (Step 2 - Revealed on Click) --- */}
                        {isJobDetailsVisible && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">



                                {/* --- JOB DETAILS CARD (Step 2) --- */}
                                <div className={mobileStep !== 2 ? "hidden md:block" : "block"}>
                                    <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden">
                                        <CardHeader className="py-2 px-3 border-b border-cyan-100 bg-theme-gradient-r rounded-t-lg">
                                            <CardTitle className="text-[10px] font-bold text-white flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white ring-2 ring-cyan-400" />
                                                Job Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-2 md:p-1.5">
                                            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-1.5">
                                                {/* Row 1: Content Name(3), Job H(1), Job L(1), Colors(1+1), Ups(1+1+1), Machine(2) = 12 cols */}

                                                {/* Content Name Field */}
                                                {/* Content Name Field (Reduced to 2 cols) */}
                                                <div className="col-span-2 md:col-span-2 space-y-1 md:space-y-0.5">
                                                    <div className={labelClass}>Content Name</div>
                                                    <Input
                                                        value={form.watch("contentName") || ""}
                                                        onChange={(e) => setValue("contentName", e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Name (e.g. Box)"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <FormField name="jobWidthMM" control={form.control} render={({ field }) => <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5"><FormLabel className={labelClass}>Job H</FormLabel><FormControl><Input type="number" {...field} className={inputClass} /></FormControl></FormItem>} />
                                                <FormField name="jobHeightMM" control={form.control} render={({ field }) => <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5"><FormLabel className={labelClass}>Job L</FormLabel><FormControl><Input type="number" {...field} className={inputClass} /></FormControl></FormItem>} />
                                                <FormField name="colorsFront" control={form.control} render={({ field }) => (
                                                    <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5">
                                                        <FormLabel className={labelClass}>F.Colors</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                className={inputClass}
                                                                onKeyDown={blockInvalidChar}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val.length <= 1) field.onChange(e);
                                                                }}
                                                                max={9}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField name="colorsBack" control={form.control} render={({ field }) => (
                                                    <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5">
                                                        <FormLabel className={labelClass}>B.Colors</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                className={inputClass}
                                                                onKeyDown={blockInvalidChar}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val.length <= 1) field.onChange(e);
                                                                }}
                                                                max={9}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />

                                                {/* Ups Group */}
                                                <FormField name="upsAcross" control={form.control} render={({ field }) => <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5"><FormLabel className={labelClass}>Across Ups</FormLabel><FormControl><Input type="number" {...field} className={inputClass} onKeyDown={blockInvalidChar} /></FormControl></FormItem>} />
                                                <FormField name="upsAround" control={form.control} render={({ field }) => <FormItem className="md:col-span-1 space-y-1 md:space-y-0.5"><FormLabel className={labelClass}>Around Ups</FormLabel><FormControl><Input type="number" {...field} className={inputClass} onKeyDown={blockInvalidChar} /></FormControl></FormItem>} />
                                                <div className="col-span-2 md:col-span-1 space-y-1 md:space-y-0.5">
                                                    <span className={labelClass}>Total Ups</span>
                                                    <div className="h-8 md:h-6 flex items-center justify-center bg-gray-100 text-sm md:text-[10px] font-bold rounded border text-gray-700">{form.watch("totalUps")}</div>
                                                </div>
                                                <FormField name="machineName" control={form.control} render={({ field }) => (
                                                    <FormItem className="col-span-2 md:col-span-3 space-y-1 md:space-y-0.5">
                                                        <FormLabel className={labelClass}>Machine</FormLabel>
                                                        <FormControl>
                                                            <CreatableCombobox
                                                                options={machines}
                                                                value={field.value}
                                                                onSelect={field.onChange}
                                                                onCreate={handleCreateMachine}
                                                                placeholder="Select"
                                                                className={inputClass}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                                {/* Force Line Break */}
                                                <div className="hidden md:block md:col-span-12" />

                                                {/* Row 2: Resources - Perfectly Aligned with Row 1 */}
                                                <div className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                    <div className={labelClass}>Teeth</div>
                                                    <div
                                                        className="h-6 px-2 border rounded text-xs md:text-[10px] flex items-center bg-gray-50 text-gray-600 truncate cursor-pointer hover-theme-gradient hover:text-white transition-all group"
                                                        title={selectedTool?.toolName}
                                                        onClick={() => { setToolDialogKey(prev => prev + 1); setToolDialogOpen(true); }}
                                                    >
                                                        {selectedTool ? `${selectedTool.noOfTeeth} T | ${selectedTool.circumferenceMM} mm | ${(selectedTool.circumferenceMM / 25.4).toFixed(3)} inch` : "Select Tool"}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-1 md:space-y-0.5">
                                                    <div className={labelClass}>Die</div>
                                                    <div
                                                        className="h-6 px-2 border rounded text-xs md:text-[10px] flex items-center bg-gray-50 text-gray-600 truncate cursor-pointer hover-theme-gradient hover:text-white transition-all group"
                                                        title={selectedDie?.toolName}
                                                        onClick={() => { setDieDialogKey(prev => prev + 1); setDieDialogOpen(true); }}
                                                    >
                                                        {selectedDie ? `${selectedDie.toolNo} | ${selectedDie.toolName} | ${selectedDie.toolRefCode || '-'}` : "Select Die"}
                                                    </div>
                                                </div>
                                                <div className="col-span-2 md:col-span-4 space-y-1 md:space-y-0.5">
                                                    <div className={labelClass}>Roll</div>
                                                    <div
                                                        className="h-6 px-2 border rounded text-xs md:text-[10px] flex items-center bg-gray-50 text-gray-600 truncate cursor-pointer hover-theme-gradient hover:text-white transition-all group"
                                                        title={selectedRoll?.itemName}
                                                        onClick={() => { setRollDialogKey(prev => prev + 1); setRollDialogOpen(true); }}
                                                    >
                                                        {selectedRoll ? `${selectedRoll.itemCode} | ${selectedRoll.supplierItemCode || '-'} | ${selectedRoll.quality} | ${selectedRoll.rollWidthMM}mm | ${selectedRoll.mill} | ${selectedRoll.faceGSM}gsm | ${selectedRoll.thicknessMicron || '-'}mic` : "Select Roll"}
                                                    </div>
                                                </div>
                                                <div className="col-span-1 md:col-span-3 space-y-1 md:space-y-0.5">
                                                    <div className={labelClass}>Operations</div>
                                                    <div
                                                        className="h-6 px-2 border rounded text-xs md:text-[10px] flex items-center bg-gray-50 text-gray-600 truncate cursor-pointer hover-theme-gradient hover:text-white transition-all group"
                                                        title={selectedProcesses.map(p => p.name).join(", ")}
                                                        onClick={() => { setProcessDialogKey(prev => prev + 1); setProcessDialogOpen(true); }}
                                                    >
                                                        {selectedProcesses.length > 0 ? selectedProcesses.map(p => p.name).join(", ") : "Select Processes"}
                                                    </div>
                                                </div>
                                                <div className="col-span-1 md:col-span-1 flex items-end">
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddContent}
                                                        variant={editingContentId ? "default" : "gradient-blue"}
                                                        className={`w-full ${editingContentId ? "bg-amber-500 hover:bg-amber-600" : ""} h-6 text-[10px] uppercase font-bold shadow-sm px-1`}
                                                    >
                                                        {editingContentId ? <><Save className="w-3 h-3 md:hidden" /><span className="hidden md:inline">Update</span></> : <><Plus className="w-3 h-3 md:hidden" /><span className="hidden md:inline">Add</span></>}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Mobile Navigation for Step 2 */}
                                            <div className="md:hidden flex justify-between mt-4">
                                                <Button type="button" variant="outline" onClick={() => setMobileStep(1)}>Back</Button>
                                                <Button type="button" variant="gradient-blue" onClick={() => setMobileStep(3)}>Next</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* --- ADDED JOB CONTENTS TABLE (Relocated Below Job Details) --- */}
                                {(form.watch("contents") || []).length > 0 && (
                                    <div className={`mt-4 mb-4 animate-in fade-in slide-in-from-bottom-6 ${mobileStep !== 2 ? "hidden md:block" : ""}`}>
                                        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden">
                                            <CardHeader className="py-2 px-3 border-b border-cyan-100 bg-theme-gradient-r">
                                                <CardTitle className="text-[10px] font-bold text-white flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-white ring-2 ring-cyan-400" />
                                                    Added Contents ({form.watch("contents").length})
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="p-0">
                                                <div className="overflow-auto max-h-[150px]">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                            <tr>
                                                                <th className="py-2 px-3 border-b">Content</th>
                                                                <th className="py-2 px-3 border-b">Material</th>
                                                                <th className="py-2 px-3 border-b">Job Size</th>
                                                                <th className="py-2 px-3 border-b">Colors</th>
                                                                <th className="py-2 px-3 border-b">Ups</th>
                                                                <th className="py-2 px-3 border-b text-right">Job Cost</th>
                                                                <th className="py-2 px-3 border-b text-center">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {form.watch("contents").map((content: any, index: number) => (
                                                                <tr key={content.id || index} className={`transition-colors ${editingContentId === content.id ? "bg-amber-50" : "hover:bg-blue-50/50"}`}>
                                                                    <td className="p-2 px-3 font-bold text-gray-700">
                                                                        {content.contentName}
                                                                        {editingContentId === content.id && <span className="ml-2 text-[10px] text-amber-600 font-normal border border-amber-200 rounded px-1 bg-white">Editing</span>}
                                                                    </td>
                                                                    <td className="p-2 px-3 text-gray-600 text-[10px] uppercase max-w-[180px] truncate" title={content.rollDescription || `${content.rollWidthMM || ''}mm | ${content.rollTotalGSM || ''}gsm`}>
                                                                        {content.rollDescription || (content.rollWidthMM && content.rollTotalGSM ? `${content.rollWidthMM}mm | ${content.rollTotalGSM}gsm` : "-")}
                                                                    </td>
                                                                    <td className="p-2 px-3 text-gray-600 text-[10px]">{content.jobWidthMM} x {content.jobHeightMM}</td>
                                                                    <td className="p-2 px-3 text-gray-600 text-[10px]">{content.colorsFront}F / {content.colorsBack}B</td>
                                                                    <td className="p-2 px-3 text-gray-600 text-[10px]">{content.totalUps}</td>
                                                                    <td className="p-2 px-3 text-right font-bold text-blue-600">₹{(() => {
                                                                        // Calculate job cost if not present
                                                                        if (content.totalJobCost) return content.totalJobCost.toFixed(2);
                                                                        const materialCost = content.materialCostAmount || 0;
                                                                        const processCost = (content.processCosts || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                                                                        const additionalCost = content.additionalCostAmount || 0;
                                                                        return (materialCost + processCost + additionalCost).toFixed(2);
                                                                    })()}</td>
                                                                    <td className="p-2 px-3 text-center flex items-center justify-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                                                            onClick={() => handleEditContent(content)}
                                                                            disabled={editingContentId !== null && editingContentId !== content.id}
                                                                        >
                                                                            <div className="w-3.5 h-3.5">✎</div>
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                            onClick={() => {
                                                                                if (confirm("Delete content?")) {
                                                                                    const newC = [...form.getValues().contents];
                                                                                    newC.splice(index, 1);
                                                                                    form.setValue("contents", newC);
                                                                                    toast.success("Content removed");
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className="bg-gray-50 font-bold text-gray-900 sticky bottom-0 z-10 shadow-inner">
                                                            <tr>
                                                                <td colSpan={5} className="p-2 px-3 text-right text-gray-500 uppercase text-[10px]">Grand Total Job Cost</td>
                                                                <td className="p-2 text-right text-base text-blue-700">₹{(form.watch("contents") || []).reduce((sum, c) => {
                                                                    // Calculate job cost same way as individual items
                                                                    if (c.totalJobCost) return sum + c.totalJobCost;
                                                                    const materialCost = c.materialCostAmount || 0;
                                                                    const processCost = (c.processCosts || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
                                                                    const additionalCost = c.additionalCostAmount || 0;
                                                                    return sum + materialCost + processCost + additionalCost;
                                                                }, 0).toFixed(2)}</td>
                                                                <td></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* --- COSTING & OPERATIONS SECTION (Step 3) - SINGLE ROW GRID --- */}
                                <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-2 mt-4 animate-in fade-in slide-in-from-bottom-5 ${mobileStep !== 3 ? "hidden md:grid" : ""}`}>

                                    {/* 1. Project Summary (col-span-3) */}
                                    <div className="md:col-span-3 h-full">
                                        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white h-full overflow-hidden flex flex-col">
                                            <CardHeader className="py-1 px-2 border-b border-cyan-100 bg-theme-gradient-r flex flex-row items-center justify-between h-7">
                                                <CardTitle className="text-[9px] font-bold text-white flex items-center gap-1.5">
                                                    <div className="h-1 w-1 rounded-full bg-white ring-1 ring-cyan-400" /> Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-1 flex-1 flex flex-col gap-1">
                                                {/* 1. Actual Required (Full Width) */}
                                                <div className="p-1.5 bg-gray-50/50 text-gray-800 rounded border border-gray-100 flex flex-col justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                                    <div className="text-[9px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wider flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-gray-400"></div> Actual Required
                                                    </div>
                                                    <div className="text-[11px] leading-tight flex items-baseline gap-0.5">
                                                        <span className="font-bold text-gray-800">{(form.watch("baseRunningMtr") || 0).toFixed(3)}</span><span className="text-[9px] text-gray-500 font-medium">RM</span>
                                                        <span className="text-gray-300 font-light mx-1.5">|</span>
                                                        <span className="font-bold text-gray-800">{(form.watch("baseSqMtr") || 0).toFixed(3)}</span><span className="text-[9px] text-gray-500 font-medium">SqM</span>
                                                        <span className="text-gray-300 font-light mx-1.5">|</span>
                                                        <span className="font-bold text-gray-800">{(form.watch("baseKg") || 0).toFixed(3)}</span><span className="text-[9px] text-gray-500 font-medium">Kg</span>
                                                    </div>
                                                </div>

                                                {/* 2. Middle Row: Wastage & Rate */}
                                                <div className="grid grid-cols-12 gap-1.5 h-auto">
                                                    {/* Wastage (col-span-4) */}
                                                    <div className="col-span-4 flex flex-col space-y-1">
                                                        <div className="text-[9px] font-semibold text-gray-500 pl-0.5">Wastage</div>
                                                        <div className="flex flex-col gap-1 p-1 rounded bg-white border border-gray-100 shadow-sm">
                                                            <div className="relative">
                                                                <Input type="number" value={form.watch("wastagePercent")} onChange={e => handleWastagePercentChange(parseFloat(e.target.value) || 0)} className="h-6 pr-4 text-right bg-transparent text-[10px] px-1 border-0 border-b border-gray-100 rounded-none focus-visible:ring-0 focus-visible:border-blue-400 placeholder:text-gray-200" placeholder="0" />
                                                                <span className="absolute right-1 top-1 text-[9px] text-gray-400 font-medium">%</span>
                                                            </div>
                                                            <div className="relative">
                                                                <Input type="number" value={form.watch("wastageRM")} onChange={e => handleWastageRMChange(parseFloat(e.target.value) || 0)} className="h-6 pr-4 text-right bg-transparent text-[10px] font-bold px-1 border-0 border-b border-transparent rounded-none focus-visible:ring-0 focus-visible:border-blue-400 placeholder:text-gray-200" placeholder="0" />
                                                                <span className="absolute right-1 top-1 text-[9px] text-gray-400 font-medium">R</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rate & Amount (col-span-8) */}
                                                    <div className="col-span-8 flex flex-col space-y-1">
                                                        <div className="flex justify-between px-0.5">
                                                            <span className="text-[9px] font-semibold text-gray-500">Material Cost</span>
                                                        </div>
                                                        <div className="bg-white p-1 rounded border border-gray-100 shadow-sm grid grid-cols-3 gap-2 items-center h-full">
                                                            <div className="space-y-0.5">
                                                                <span className="text-[8px] text-gray-400 block truncate uppercase tracking-tight">Total Qty</span>
                                                                <div className="h-6 flex items-center justify-end px-1.5 text-[10px] font-bold text-gray-700 bg-gray-50/50 rounded border border-gray-100 truncate shadow-inner">
                                                                    {form.watch("materialRateUnit") === "SqMtr" ? form.watch("totalSqMtr") :
                                                                        form.watch("materialRateUnit") === "RunningMtr" ? form.watch("totalRunningMtr") :
                                                                            form.watch("totalKg")}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[8px] text-gray-400 block truncate uppercase tracking-tight">Rate</span>
                                                                <Input type="number" className="h-6 w-full text-right text-[10px] bg-white font-bold border-gray-200 focus-visible:border-blue-400 px-1.5 shadow-sm" {...form.register("materialRate", { valueAsNumber: true })} />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[8px] text-gray-400 block text-right truncate uppercase tracking-tight">Amount</span>
                                                                <div className="h-6 w-full flex items-center justify-end px-1.5 bg-yellow-50/50 border border-yellow-100 rounded text-[10px] font-extrabold text-yellow-700 truncate">
                                                                    {form.watch("materialCostAmount")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 3. Total Required (Full Width, Bottom) */}
                                                <div className="mt-auto p-1.5 bg-blue-50/30 text-blue-900 rounded border border-blue-100 flex flex-col justify-center shadow-[inset_0_1px_2px_rgba(59,130,246,0.05)]">
                                                    <div className="text-[9px] font-bold text-blue-500 mb-0.5 uppercase tracking-wider flex items-center gap-1">
                                                        <div className="w-1 h-1 rounded-full bg-blue-500"></div> Total Required <span className="text-[8px] normal-case opacity-70">(Inc. Wastage)</span>
                                                    </div>
                                                    <div className="text-[11px] leading-tight flex items-baseline gap-0.5">
                                                        <span className="font-bold text-blue-800">{(form.watch("totalRunningMtr") || 0).toFixed(3)}</span><span className="text-[9px] text-blue-400 font-medium">RM</span>
                                                        <span className="text-blue-200 font-light mx-1.5">|</span>
                                                        <span className="font-bold text-blue-800">{(form.watch("totalSqMtr") || 0).toFixed(3)}</span><span className="text-[9px] text-blue-400 font-medium">SqM</span>
                                                        <span className="text-blue-200 font-light mx-1.5">|</span>
                                                        <span className="font-bold text-blue-700">{(form.watch("totalKg") || 0).toFixed(3)}</span><span className="text-[9px] text-blue-400 font-medium">Kg</span>
                                                    </div>
                                                </div>
                                            </CardContent>

                                        </Card>
                                    </div>

                                    {/* 2. Process Costing (col-span-7) */}
                                    <Card className="md:col-span-7 border-0 shadow-sm ring-1 ring-slate-100 bg-white flex flex-col overflow-hidden h-full">
                                        <CardHeader className="py-1.5 px-3 border-b border-cyan-100 bg-theme-gradient-r flex flex-row justify-between items-center shrink-0">
                                            <CardTitle className="text-[10px] font-bold text-white flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white ring-2 ring-cyan-400" /> Process Costing
                                            </CardTitle>
                                            <Button type="button" variant="ghost" size="sm" className="h-4 text-white hover:text-white hover:bg-white/20 text-[9px] px-1" onClick={() => { setProcessDialogKey(prev => prev + 1); setProcessDialogOpen(true); }}>+ Add</Button>
                                        </CardHeader>
                                        <div className="flex-1 flex flex-col min-h-0 overflow-x-auto">
                                            <div className="min-w-[500px]">
                                                <div className="grid grid-cols-12 gap-1 px-3 py-1 bg-gray-50 text-[9px] font-bold uppercase text-gray-500 border-b shrink-0">
                                                    <div className="col-span-3">Process</div>
                                                    <div className="col-span-4">Formula</div>
                                                    <div className="col-span-3 text-right">Rate</div>
                                                    <div className="col-span-2 text-right">Amount</div>
                                                </div>
                                                <div className="overflow-y-auto max-h-[160px]">
                                                    {processFields.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                                                            <Calculator className="h-8 w-8 mb-2 opacity-20" />
                                                            <span className="text-[10px]">No processes added</span>
                                                        </div>
                                                    )}
                                                    {processFields.map((proc, idx) => {
                                                        const handleQuantityBlur = () => {
                                                            // Mark as manually edited
                                                            form.setValue(`processCosts.${idx}.isManualQuantity`, true);

                                                            // Calculate amount (NO setup charges)
                                                            const qty = form.getValues(`processCosts.${idx}.quantity`) || 0;
                                                            const rate = form.getValues(`processCosts.${idx}.rate`) || 0;
                                                            const amt = parseFloat((qty * rate).toFixed(2));
                                                            form.setValue(`processCosts.${idx}.amount`, amt);

                                                            // Trigger full recalculation when user finishes editing
                                                            recalculateAll("processCosts");
                                                        };

                                                        const handleRateBlur = () => {
                                                            // Mark as manually edited
                                                            form.setValue(`processCosts.${idx}.isManualRate`, true);

                                                            // Calculate amount (NO setup charges)
                                                            const qty = form.getValues(`processCosts.${idx}.quantity`) || 0;
                                                            const rate = form.getValues(`processCosts.${idx}.rate`) || 0;
                                                            const amt = parseFloat((qty * rate).toFixed(2));
                                                            form.setValue(`processCosts.${idx}.amount`, amt);

                                                            // Trigger full recalculation when user finishes editing
                                                            recalculateAll("processCosts");
                                                        };

                                                        // Check if this process has manual edits
                                                        const isManualQty = form.watch(`processCosts.${idx}.isManualQuantity`) || false;
                                                        const isManualRt = form.watch(`processCosts.${idx}.isManualRate`) || false;

                                                        return (
                                                            <div key={proc.id} className="grid grid-cols-12 gap-1 px-3 py-1 border-b border-gray-50 items-center hover:bg-gray-50 group">
                                                                <div className="col-span-3">
                                                                    <div className="text-[10px] font-medium text-gray-700 truncate">{proc.processName}</div>
                                                                    {proc.debugInfo && (
                                                                        <div className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 mt-0.5 inline-block max-w-full truncate" title={proc.debugInfo}>
                                                                            {proc.debugInfo}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="text-[9px] text-gray-500 min-w-fit font-medium bg-gray-50 px-1 py-0.5 rounded border border-gray-100" title={proc.rateType}>
                                                                            {proc.rateType?.replace("Per ", "").replace("Rate/", "").replace("Printing (Advanced)", "Print(Adv)")}
                                                                        </div>
                                                                        <Input
                                                                            type="number"
                                                                            className={`h-7 w-20 text-right text-[10px] bg-white px-2 ${isManualQty ? 'border-orange-400 ring-1 ring-orange-200' : 'border-blue-200'} focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                                                                            step="any"
                                                                            placeholder="0.00"
                                                                            {...form.register(`processCosts.${idx}.quantity`, {
                                                                                valueAsNumber: true,
                                                                                onBlur: handleQuantityBlur
                                                                            })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-3 text-right flex justify-end">
                                                                    <Input
                                                                        type="number"
                                                                        className={`h-7 w-20 text-right text-[10px] bg-white px-2 ${isManualRt ? 'border-orange-400 ring-1 ring-orange-200' : 'border-green-200'} focus:border-green-400 focus:ring-1 focus:ring-green-400`}
                                                                        step="any"
                                                                        placeholder="0.00"
                                                                        {...form.register(`processCosts.${idx}.rate`, {
                                                                            valueAsNumber: true,
                                                                            onBlur: handleRateBlur
                                                                        })}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 text-right font-bold text-gray-700 text-[10px]">
                                                                    ₹{form.watch(`processCosts.${idx}.amount`)?.toFixed(2) || '0.00'}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* 3. Financial Summary (col-span-2) */}
                                    <Card className="md:col-span-2 border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden h-full">
                                        <CardHeader className="py-1.5 px-3 border-b border-cyan-100 bg-theme-gradient-r">
                                            <CardTitle className="text-[10px] font-bold text-white flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white ring-2 ring-cyan-400" /> Financial
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-1.5">
                                            <div className="space-y-1.5">
                                                {/* Additional Cost */}
                                                <div className="space-y-0.5">
                                                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                                                        <span>Add. Cost</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <Input type="number" value={form.watch("additionalCostPercent")} onChange={e => handleAdditionalPercentChange(parseFloat(e.target.value) || 0)} className="h-6 pl-2 pr-1 bg-white text-[9px] w-full" placeholder="%" />
                                                        <Input type="number" value={form.watch("additionalCostAmount")} onChange={e => handleAdditionalAmountChange(parseFloat(e.target.value) || 0)} className="h-6 pl-2 pr-1 font-bold text-gray-800 bg-white text-[9px] w-full" placeholder="₹" />
                                                    </div>
                                                </div>

                                                {/* Total Job Cost */}
                                                <div className="flex justify-between items-center py-1 border-t border-gray-200">
                                                    <span className="text-[10px] font-bold text-gray-700">Total</span>
                                                    <span className="text-[11px] font-bold text-gray-900">₹{form.watch("totalJobCost")?.toFixed(2)}</span>
                                                </div>

                                                {/* Unit Cost */}
                                                <div className="flex justify-between items-center py-0.5">
                                                    <span className="text-[9px] font-bold text-gray-600">Unit</span>
                                                    <span className="text-[10px] font-bold text-gray-800">₹{form.watch("unitCost")?.toFixed(2)}</span>
                                                </div>

                                                {/* Final Sales Price (Editable) */}
                                                <div className="space-y-0.5 pt-1 border-t border-blue-100">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-bold text-green-700">Final Price</span>
                                                        <span className="text-[8px] text-gray-400">(per unit)</span>
                                                    </div>
                                                    <Input type="number" step="any" className="h-7 w-full text-right font-bold border-green-300 focus-visible:ring-green-500 bg-green-50 text-green-800 text-xs px-2" {...form.register("finalSalesPrice", {
                                                        valueAsNumber: true,
                                                        onChange: (e) => {
                                                            const price = parseFloat(e.target.value) || 0;
                                                            const orderQty = form.getValues("orderQty") || 0;
                                                            form.setValue("totalOrderValue", parseFloat((price * orderQty).toFixed(2)));
                                                        }
                                                    })} placeholder="Enter selling price" />
                                                </div>

                                                {/* Total Order Value */}
                                                <div className="flex justify-between items-center py-1 bg-gradient-to-r from-green-50 to-blue-50 px-2 rounded -mx-1.5">
                                                    <span className="text-[9px] font-bold text-green-800">Total Order Value</span>
                                                    <span className="text-[11px] font-bold text-green-800">₹{form.watch("totalOrderValue")?.toFixed(2)}</span>
                                                </div>

                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* --- ADD/UPDATE BUTTON STRIP (New Location) --- */}


                                {/* --- ADDED JOB CONTENTS TABLE (Relocated Below Costing) --- */}








                                {/* --- COSTING SECTION CLEARED FROM HERE --- */}

                                <div className={`flex justify-between md:justify-end gap-2 mt-4 pb-4 px-2 ${mobileStep !== 3 ? "hidden md:flex" : ""}`}>
                                    <Button type="button" variant="outline" className="md:hidden" onClick={() => setMobileStep(2)}>Back</Button>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" className="h-8 md:h-7 gap-1 text-slate-500 hover:text-slate-800 px-4 text-sm md:text-xs" onClick={() => { form.reset(); setEditingContentId(null); }}>
                                            <Trash2 className="h-4 w-4 md:h-3 md:w-3" /> Clear Form
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            size="sm"
                                            variant="gradient-blue"
                                            className="h-8 md:h-7 text-sm md:text-xs font-bold px-6 disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-4 w-4 md:h-3 md:w-3 mr-1 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 md:h-3 md:w-3 mr-1" />
                                            )}
                                            {isSaving ? "Saving..." : "Save"}
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>



                </form>
            </Form>

            <ToolSelectionDialog open={toolDialogOpen} onOpenChange={setToolDialogOpen} onSelect={handleToolSelect} />
            <ToolSelectionDialog open={dieDialogOpen} onOpenChange={setDieDialogOpen} onSelect={handleDieSelect} typeFilter="FLEXO DIE" />
            <RollSelectionDialog open={rollDialogOpen} onOpenChange={setRollDialogOpen} onSelect={handleRollSelect} />
            <ProcessSelectionDialog open={processDialogOpen} onOpenChange={setProcessDialogOpen} onSelect={handleProcessSelect} preSelectedIds={form.watch("processIds")} />
        </div >
    );
};
