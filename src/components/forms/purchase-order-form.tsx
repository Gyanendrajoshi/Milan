"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Plus, Printer, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { MultiRollSelectionDialog } from "@/components/dialogs/multi-roll-selection-dialog";
import { MultiMaterialSelectionDialog } from "@/components/dialogs/multi-material-selection-dialog";

import { poStorage } from "@/services/po-storage";
import { mockSuppliers } from "../../services/mock-data/suppliers";
import { mockHSN as mockHSNs } from "../../services/mock-data/hsn";
import { COMPANY_PROFILE } from "../../services/mock-data/company-settings";
import { cn } from "@/lib/utils";

// --- Schema ---
const poItemSchema = z.object({
    id: z.string(), // internal unique id for key
    itemId: z.string().optional(),
    itemCode: z.string(),
    itemName: z.string(),
    itemType: z.enum(["Roll", "Material"]),

    // For Rolls: specs needed for conversion
    rollWidthMM: z.number().optional(),
    rollTotalGSM: z.number().optional(),

    // Quantities
    qtyRunMtr: z.number().optional(),
    qtySqMtr: z.number().optional(),
    qtyKg: z.number().optional(),
    qtyUnit: z.number().optional(), // For Materials

    reqDate: z.date().optional(),
    rateType: z.string(), // KG, Sq.Mtr, Each, etc.
    rate: z.number().min(0),

    // Amounts
    basicAmount: z.number(),
    taxAmount: z.number(),
    cgstAmt: z.number().optional(),
    sgstAmt: z.number().optional(),
    igstAmt: z.number().optional(),
    totalAmount: z.number(),

    hsnCode: z.string().optional(),
    gstPercent: z.number().optional(),
    remark: z.string().optional(),
});

const poSchema = z.object({
    poNumber: z.string(),
    poDate: z.date(),
    supplierId: z.string().min(1, "Supplier is required"),
    items: z.array(poItemSchema).min(1, "At least one item is required"),

    otherCharges: z.number().min(0).default(0),
    otherChargeDescription: z.string().optional(),
    remarks: z.string().optional(),

    // Grand Totals
    grandBasic: z.number(),
    grandTax: z.number(),
    grandTotal: z.number(),
});

type POFormValues = z.infer<typeof poSchema>;

export function PurchaseOrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [rollDialogOpen, setRollDialogOpen] = useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(poSchema),
        defaultValues: {
            // Auto-generate PO Number: PO{SEQ}-{YY}
            // Using random seq for now, but formatted correctly
            poNumber: `PO${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}-${new Date().getFullYear().toString().slice(-2)}`,
            poDate: new Date(),
            supplierId: "",
            items: [],
            otherCharges: 0,
            otherChargeDescription: "",
            grandBasic: 0,
            grandTax: 0,
            grandTotal: 0,
        },
    });

    // Load Data if Edit Mode
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const po = poStorage.getById(id);
            if (po) {
                // Use ID directly for robust linking
                const supplierId = po.supplierId || "";
                console.log("DEBUG PO EDIT:", { poId: id, foundPO: po, resolvedSupplierId: supplierId, allSuppliers: mockSuppliers });


                // Enrich Items causing they might lack rate/amounts in mock
                const enrichedItems = po.items.map((i: any) => {
                    const item = i as any;
                    // Strict type inference for Zod schema match
                    const itemType: "Roll" | "Material" = (item.itemType || item.group) === "Roll" ? "Roll" : "Material";

                    return {
                        ...i,
                        id: i.id || Math.random().toString(36).substr(2, 9), // Keep existing ID if present
                        itemId: i.id,
                        itemCode: i.itemCode || "",
                        itemName: i.itemName || "",
                        itemType: itemType,
                        rollWidthMM: item.rollWidthMM || 0,
                        rollTotalGSM: item.rollTotalGSM || 0,
                        qtyRunMtr: item.qtyRunMtr || 0,
                        qtySqMtr: item.qtySqMtr || 0,
                        qtyKg: item.qtyKg || item.orderedQty || 0, // Fallback to orderedQty
                        qtyUnit: item.qtyUnit || item.orderedQty || 0,
                        rate: item.rate || 0,
                        basicAmount: item.basicAmount || 0,
                        taxAmount: item.taxAmount || 0,
                        cgstAmt: item.cgstAmt || 0,
                        sgstAmt: item.sgstAmt || 0,
                        igstAmt: item.igstAmt || 0,
                        totalAmount: item.totalAmount || 0,
                        rateType: item.uom === "Kg" ? "KG" : "Unit", // Align with getCalculatedItem 'KG' check
                        reqDate: item.reqDate ? new Date(item.reqDate) : undefined,
                        hsnCode: item.hsnCode || "",
                        gstPercent: item.gstPercent || 0,
                        remark: item.remark || "",
                    };
                });

                const formData = {
                    ...po,
                    supplierId, // Injected
                    poDate: new Date(po.poDate),
                    items: enrichedItems,
                    grandBasic: 0, // Recalc needed? Or trust mock? Mock has grandTotal but not breakdown.
                    grandTax: 0,
                    grandTotal: po.grandTotal
                };

                form.reset(formData);
            }
        }
    }, [searchParams, form]);

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // --- Calculations ---
    // Use useWatch for better performance and deep nested observation
    const watchItems = useWatch({ control: form.control, name: "items" }) || [];
    const watchOther = useWatch({ control: form.control, name: "otherCharges" }) || 0;
    const watchSupplierId = useWatch({ control: form.control, name: "supplierId" });

    const HOST_STATE = COMPANY_PROFILE.state;

    // Helper to get derived item values for display
    // Moved up to ensure accessibility in useEffect and render
    const getCalculatedItem = (item: any) => {
        if (!item) return { basicAmt: 0, cgst: 0, sgst: 0, igst: 0, taxAmt: 0, totalAmt: 0 };

        const selectedSupplier = mockSuppliers.find(s => s.id === watchSupplierId);
        const supplierState = selectedSupplier?.state || HOST_STATE;
        const isInterState = supplierState !== HOST_STATE;

        const billingQty = item.itemType === "Roll"
            ? (item.rateType === "KG" ? item.qtyKg : item.rateType === "Sq.Mtr" ? item.qtySqMtr : item.qtyRunMtr) || 0
            : item.qtyUnit || 0;

        const basicAmt = (billingQty * (item.rate || 0));
        let gst = item.gstPercent || 0;
        if (!gst && item.hsnCode) {
            const hsn = mockHSNs.find(h => h.hsnCode === item.hsnCode);
            if (hsn) gst = hsn.gstPercentage;
        }
        const taxAmt = (basicAmt * gst) / 100;

        let cgst = 0, sgst = 0, igst = 0;
        if (isInterState) igst = taxAmt;
        else { cgst = taxAmt / 2; sgst = taxAmt / 2; }

        const totalAmt = basicAmt + taxAmt;

        return { basicAmt, cgst, sgst, igst, taxAmt, totalAmt };
    };

    // Derived Totals (calculated during render to stay perfectly in sync)
    const { totalBasic, totalTax, grandTotal } = useMemo(() => {
        const totals = watchItems.reduce((acc: { basic: number; tax: number }, item: any) => {
            const calcs = getCalculatedItem(item);
            acc.basic += calcs.basicAmt;
            acc.tax += calcs.taxAmt;
            return acc;
        }, { basic: 0, tax: 0 });

        return {
            totalBasic: totals.basic,
            totalTax: totals.tax,
            grandTotal: totals.basic + totals.tax + (watchOther || 0)
        };
    }, [watchItems, watchOther, watchSupplierId]);




    // --- Handlers ---

    // Roll Conversion Logic
    const handleRollQtyChange = (index: number, type: 'run' | 'sq' | 'kg', val: number) => {
        const item = form.getValues(`items.${index}`);
        if (!item.rollWidthMM || !item.rollTotalGSM) return; // Cannot convert without specs

        const width = item.rollWidthMM;
        const gsm = item.rollTotalGSM;

        // Safety: treat NaN as 0
        const value = isNaN(val) ? 0 : val;

        let run = 0, sq = 0, kg = 0;

        if (type === 'run') {
            run = value;
            sq = (run * width) / 1000;
            kg = (sq * gsm) / 1000;
        } else if (type === 'sq') {
            sq = value;
            run = (sq * 1000) / width;
            kg = (sq * gsm) / 1000;
        } else if (type === 'kg') {
            kg = value;
            sq = (kg * 1000) / gsm;
            run = (sq * 1000) / width;
        }

        form.setValue(`items.${index}.qtyRunMtr`, parseFloat(run.toFixed(2)));
        form.setValue(`items.${index}.qtySqMtr`, parseFloat(sq.toFixed(2)));
        form.setValue(`items.${index}.qtyKg`, parseFloat(kg.toFixed(2)));
    };

    const handleAddRolls = (rolls: any[]) => {
        const hsnMap = new Map(mockHSNs.map(h => [h.hsnCode, h.gstPercentage]));

        const newItems = rolls.map(r => {
            const gst = hsnMap.get(r.hsnCode) || 0;
            return {
                id: Math.random().toString(36).substr(2, 9),
                itemId: r.id,
                itemCode: r.itemCode,
                itemName: r.itemName,
                itemType: "Roll" as const,
                rollWidthMM: r.rollWidthMM,
                rollTotalGSM: r.totalGSM,
                qtyRunMtr: 0,
                qtySqMtr: 0,
                qtyKg: 0,
                reqDate: new Date(),
                rateType: r.purchaseUnit || "KG", // Default from master
                rate: r.purchaseRate || 0,
                basicAmount: 0,
                taxAmount: 0,
                totalAmount: 0,
                hsnCode: r.hsnCode,
                gstPercent: gst,
            };
        });
        append(newItems);
    };

    const handleAddMaterials = (materials: any[]) => {
        const hsnMap = new Map(mockHSNs.map(h => [h.hsnCode, h.gstPercentage]));

        const newItems = materials.map(m => {
            const gst = hsnMap.get(m.hsnCode) || 0;
            return {
                id: Math.random().toString(36).substr(2, 9),
                itemId: m.id,
                itemCode: m.itemCode || m.id.substring(0, 6),
                itemName: m.itemName,
                itemType: "Material" as const,
                qtyUnit: 0,
                reqDate: new Date(),
                rateType: m.purchaseUnit || "Nos",
                rate: m.purchaseRate || 0,
                basicAmount: 0,
                taxAmount: 0,
                totalAmount: 0,
                hsnCode: m.hsnCode,
                gstPercent: gst,
            };
        });
        append(newItems);
    };

    const onSubmit = (data: POFormValues) => {
        // Validation: Check for duplicate PO Number (exclude current PO if editing)
        const currentId = searchParams.get("id");
        const allPOs = poStorage.getAll();
        const isDuplicate = allPOs.some(p => p.poNumber === data.poNumber && p.id !== currentId);
        if (isDuplicate) {
            toast.error("Duplicate PO Number", {
                description: `PO Number ${data.poNumber} already exists. Please choose a unique number.`
            });
            return;
        }

        // Production Step: Recalculate all items to ensure data integrity before submission
        // This prevents any mismatch between displayed values (derived) and stored values.
        const finalItems = data.items.map(item => {
            const calcs = getCalculatedItem(item);
            return {
                ...item,
                basicAmount: parseFloat(calcs.basicAmt.toFixed(2)),
                taxAmount: parseFloat(calcs.taxAmt.toFixed(2)),
                cgstAmt: parseFloat(calcs.cgst.toFixed(2)),
                sgstAmt: parseFloat(calcs.sgst.toFixed(2)),
                igstAmt: parseFloat(calcs.igst.toFixed(2)),
                totalAmount: parseFloat(calcs.totalAmt.toFixed(2)),
            };
        });

        const finalData = {
            ...data,
            items: finalItems,
            // Ensure Grand Totals match the sum of final items
            grandBasic: parseFloat(finalItems.reduce((sum, item) => sum + item.basicAmount, 0).toFixed(2)),
            grandTax: parseFloat(finalItems.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)),
            grandTotal: parseFloat((
                finalItems.reduce((sum, item) => sum + item.totalAmount, 0) + (data.otherCharges || 0)
            ).toFixed(2))
        };

        // Transform to PO storage format
        const selectedSupplier = mockSuppliers.find(s => s.id === finalData.supplierId);
        const poData = {
            ...finalData,
            poDate: finalData.poDate.toISOString().split('T')[0],
            supplierName: selectedSupplier?.supplierName || "",
            status: "Pending" as const,
            items: finalData.items.map(item => {
                const orderedQty = item.itemType === "Roll" ? (item.qtyKg || 0) : (item.qtyUnit || 0);
                return {
                    id: item.id,
                    itemId: item.itemId,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    group: item.itemType,
                    uom: item.rateType,
                    orderedQty: orderedQty,
                    receivedQty: 0,
                    pendingQty: orderedQty,
                    rate: item.rate,
                    rateType: item.rateType,
                    basicAmount: item.basicAmount,
                    taxAmount: item.taxAmount,
                    totalAmount: item.totalAmount,
                    hsnCode: item.hsnCode,
                    gstPercent: item.gstPercent,
                    cgstAmt: item.cgstAmt,
                    sgstAmt: item.sgstAmt,
                    igstAmt: item.igstAmt,
                    rollWidthMM: item.rollWidthMM,
                    rollTotalGSM: item.rollTotalGSM,
                    // Save all quantity fields for edit mode
                    qtyRunMtr: item.qtyRunMtr,
                    qtySqMtr: item.qtySqMtr,
                    qtyKg: item.qtyKg,
                    qtyUnit: item.qtyUnit,
                    reqDate: item.reqDate,
                    remark: item.remark,
                    purchaseUnit: item.rateType,
                    purchaseRate: item.rate
                };
            })
        };

        // Save to storage
        const savedPO = poStorage.save(poData);

        console.log("PO Saved:", savedPO);
        toast.success("Purchase Order Created Successfully", {
            description: `PO Number: ${savedPO.poNumber}`,
        });

        setTimeout(() => router.push("/inventory/purchase-order"), 1000);
    };

    const handleCancel = () => {
        router.push("/inventory/purchase-order");
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 print:bg-white">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 print:space-y-0">

                    {/* Header */}
                    <Card className="rounded-none border-0 shadow-sm overflow-hidden print:shadow-none print:border-0">
                        <CardHeader className="py-2 px-4 bg-theme-gradient-r text-white rounded-none print:bg-none print:text-black print:px-0">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        className="h-6 w-6 text-white hover:bg-white/20 hover:text-white -ml-1 print:hidden"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <div>
                                        <CardTitle className="text-base font-bold print:text-xl">Purchase Order</CardTitle>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-[10px] opacity-90 print:opacity-100 print:text-xs">
                                    <span className="bg-white/20 px-2 py-0.5 rounded print:bg-transparent print:border print:border-gray-300">Host State: {HOST_STATE}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded print:bg-transparent print:border print:border-gray-300">
                                        Supplier State: {mockSuppliers.find(s => s.id === form.watch("supplierId"))?.state || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 bg-white print:p-0 print:mt-4">
                            <div className="flex flex-col md:flex-row items-end gap-2 print:grid print:grid-cols-3 print:gap-4">
                                <FormField
                                    control={form.control}
                                    name="poNumber"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 w-[140px] print:w-full">
                                            <FormLabel className="text-xs font-bold text-gray-500">PO Number</FormLabel>
                                            <FormControl>
                                                <Input disabled {...field} className="bg-slate-50 h-8 text-xs font-bold border-slate-200 text-slate-700 opacity-100 print:bg-transparent print:border-0 print:p-0 print:h-auto" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="poDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 w-[140px] print:w-full">
                                            <FormLabel className="text-xs font-bold text-gray-500">PO Date</FormLabel>
                                            <FormControl>
                                                <Input value={format(field.value, "dd-MM-yyyy")} disabled className="bg-slate-50 h-8 text-xs font-bold border-slate-200 text-slate-700 opacity-100 print:bg-transparent print:border-0 print:p-0 print:h-auto" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 w-[200px] print:w-full">
                                            <FormLabel className="text-xs font-bold text-gray-500">Supplier</FormLabel>
                                            <div className="print:hidden">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Select Supplier" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {mockSuppliers.map((s) => (
                                                            <SelectItem key={s.id} value={s.id} className="text-xs">{s.supplierName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Print-only Text */}
                                            <div className="hidden print:block text-xs font-bold pt-1">
                                                {mockSuppliers.find(s => s.id === field.value)?.supplierName || ""}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2 pb-0.5 print:hidden">
                                    <Button type="button" onClick={() => setRollDialogOpen(true)} variant="gradient-blue" className="shadow-sm h-8 text-xs gap-1 px-3 border-0">
                                        <Plus className="w-3 h-3" /> Roll
                                    </Button>
                                    <Button type="button" onClick={() => setMaterialDialogOpen(true)} variant="gradient-blue" className="shadow-sm h-8 text-xs gap-1 px-3 border-0">
                                        <Plus className="w-3 h-3" /> Material
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table Area */}
                    <div className="px-4 print:px-0">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden rounded-none print:shadow-none print:ring-0">
                            <div className="overflow-x-auto max-h-[250px] overflow-y-auto print:max-h-none print:overflow-visible">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-slate-100 sticky top-0 z-10 shadow-sm print:static print:shadow-none print:bg-transparent print:border-b print:border-black">
                                        <tr>
                                            <th className="px-3 py-1 w-24">Item Code</th>
                                            <th className="px-3 py-1">Item Name</th>
                                            <th className="px-3 py-1 w-32">Order Qty</th>
                                            <th className="px-3 py-1 w-32">Req. Date</th>
                                            <th className="px-3 py-1 w-20">Rate Type</th>
                                            <th className="px-3 py-1 w-24 text-right">Rate</th>
                                            <th className="px-3 py-1 w-24 text-right">Basic Amt</th>
                                            <th className="px-3 py-1 w-16 text-right">CGST</th>
                                            <th className="px-3 py-1 w-16 text-right">SGST</th>
                                            <th className="px-3 py-1 w-16 text-right">IGST</th>
                                            <th className="px-3 py-1 w-24 text-right">Total Amt</th>
                                            <th className="px-3 py-1 w-32">Remark</th>
                                            <th className="px-3 py-1 w-10 print:hidden">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                        {fields.map((field, index) => {
                                            const item = form.watch(`items.${index}`);
                                            return (
                                                <tr key={field.id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                                                    <td className="px-3 py-1 font-medium text-[10px] text-gray-700">{item.itemCode}</td>
                                                    <td className="px-3 py-1">
                                                        <div className="text-xs font-medium text-blue-800 print:text-black">{item.itemName}</div>
                                                        {item.itemType === "Roll" && (
                                                            <div className="text-[10px] text-gray-400 print:text-gray-600">
                                                                {item.rollWidthMM}mm | {item.rollTotalGSM}gsm
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {/* Print View for Qty */}
                                                        <div className="hidden print:block text-xs">
                                                            {item.itemType === "Roll"
                                                                ? `${item.qtyKg} Kg (${item.qtyRunMtr} Mtr)`
                                                                : `${item.qtyUnit} Units`
                                                            }
                                                        </div>
                                                        <div className="print:hidden">
                                                            {item.itemType === "Roll" ? (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[9px] text-gray-400 w-8">Run.Mtr</span>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="h-6 w-20 text-[10px] px-1 border-slate-200"
                                                                            {...form.register(`items.${index}.qtyRunMtr`, { valueAsNumber: true })}
                                                                            onChange={(e) => handleRollQtyChange(index, "run", parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[9px] text-gray-400 w-8">Sq.Mtr</span>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="h-6 w-20 text-[10px] px-1 border-slate-200"
                                                                            {...form.register(`items.${index}.qtySqMtr`, { valueAsNumber: true })}
                                                                            onChange={(e) => handleRollQtyChange(index, "sq", parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-[9px] text-gray-400 w-8 font-bold">Kg</span>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="h-6 w-20 text-[10px] px-1 font-bold bg-blue-50 border-blue-100 text-blue-700"
                                                                            {...form.register(`items.${index}.qtyKg`, { valueAsNumber: true })}
                                                                            onChange={(e) => handleRollQtyChange(index, "kg", parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="h-7 w-20 text-xs border-slate-200"
                                                                    {...form.register(`items.${index}.qtyUnit`, { valueAsNumber: true })}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-gray-500">
                                                        <div className="print:hidden">
                                                            <Input
                                                                type="date"
                                                                className="h-7 w-32 text-xs border-slate-200"
                                                                {...form.register(`items.${index}.reqDate`, { valueAsDate: true })}
                                                                value={item.reqDate instanceof Date && !isNaN(item.reqDate.getTime()) ? format(item.reqDate, "yyyy-MM-dd") : ""}
                                                                onChange={(e) => {
                                                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                                                    form.setValue(`items.${index}.reqDate`, date);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="hidden print:block">
                                                            {item.reqDate instanceof Date && !isNaN(item.reqDate.getTime()) ? format(item.reqDate, "dd-MM-yyyy") : "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs">{item.rateType}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="print:hidden">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                className="h-7 w-20 text-right text-xs border-slate-200"
                                                                {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                                                            />
                                                        </div>
                                                        <div className="hidden print:block text-right">
                                                            {item.rate}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-xs font-medium">
                                                        {(() => {
                                                            const calc = getCalculatedItem(item);
                                                            return `₹${calc.basicAmt.toFixed(2)}`;
                                                        })()}
                                                    </td>
                                                    {(() => {
                                                        const calc = getCalculatedItem(item);
                                                        return (
                                                            <>
                                                                <td className="px-3 py-2 text-right text-xs text-gray-600">₹{calc.cgst.toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-right text-xs text-gray-600">₹{calc.sgst.toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-right text-xs text-gray-600">₹{calc.igst.toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-right text-xs font-bold text-blue-700 print:text-black">₹{calc.totalAmt.toFixed(2)}</td>
                                                            </>
                                                        );
                                                    })()}
                                                    <td className="px-3 py-2">
                                                        <Input className="h-7 text-xs border-slate-200 print:border-0 print:p-0" placeholder="Optional..." {...form.register(`items.${index}.remark`)} />
                                                    </td>
                                                    <td className="px-3 py-2 text-center print:hidden">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {fields.length === 0 && (
                                            <tr>
                                                <td colSpan={13} className="h-32 text-center text-gray-400 text-sm">
                                                    No items added. Click "+ Paper" or "+ Material" to start.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-2 print:px-0">
                        <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-white print:shadow-none print:ring-0">
                            <CardContent className="p-2">
                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="flex-1 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="remarks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-bold text-gray-500">Remarks</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Enter any remarks..." className="h-16 resize-none print:border-0 print:p-0 print:h-auto" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-full md:w-96 space-y-3 bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Basic Amount:</span>
                                            <span className="font-bold">₹{totalBasic.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Tax Amount:</span>
                                            <span className="font-bold text-orange-600 print:text-black">₹{totalTax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 space-y-2">
                                            <div className="flex justify-between items-center text-sm gap-2">
                                                <span className="text-gray-600 w-24">Other:</span>
                                                <Input
                                                    placeholder="Description"
                                                    className="h-7 flex-1 text-xs bg-white print:bg-transparent print:border-0 print:p-0"
                                                    {...form.register("otherChargeDescription")}
                                                />
                                                <Input
                                                    type="number"
                                                    className="h-7 w-20 text-right bg-white print:bg-transparent print:border-0 print:p-0"
                                                    {...form.register("otherCharges", { valueAsNumber: true })}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-800">Grand Total:</span>
                                            <span className="text-xl font-bold text-blue-700 print:text-black">₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-slate-100 print:hidden">
                                    <Button type="button" variant="outline" onClick={handleCancel} className="border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</Button>
                                    <Button type="button" variant="outline" onClick={handlePrint} className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                                        <Printer className="w-4 h-4" /> Print
                                    </Button>
                                    <Button type="submit" variant="gradient-blue" className="gap-2">
                                        <Save className="w-4 h-4" /> Create PO
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </form>
            </Form>

            <MultiRollSelectionDialog
                open={rollDialogOpen}
                onOpenChange={setRollDialogOpen}
                onSelect={handleAddRolls}
            />
            <MultiMaterialSelectionDialog
                open={materialDialogOpen}
                onOpenChange={setMaterialDialogOpen}
                onSelect={handleAddMaterials}
            />
        </div>
    );
}
