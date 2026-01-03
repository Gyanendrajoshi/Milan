"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format, addDays } from "date-fns";
import { Save, Calculator, CalendarIcon, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { createGRN } from "@/services/api/grn-service"; // Mock
import { grnStorage } from "@/services/grn-storage";
import { GRN, GRNItem } from "@/types/grn-master";
import { PurchaseOrderItem } from "../../services/mock-data/purchase-orders"; // Type
import { mockMaterials } from "../../services/mock-data/materials";

// Form Schema
const grnFormSchema = z.object({
    supplierName: z.string(),
    grnDate: z.date(),
    supplierChallanNo: z.string().min(1, "Challan No is required"),
    challanDate: z.date(),
    vehicleNo: z.string().optional(),
    qcReferenceNo: z.string().optional(),
    remarks: z.string().optional(),
    items: z.array(z.object({
        id: z.string(), // PO Item ID
        poId: z.string().optional(),
        poNumber: z.string().optional(),
        poDate: z.string().optional(),
        itemCode: z.string(),
        itemName: z.string(),
        itemType: z.string().optional(), // Store type explicitly
        group: z.string().optional(),    // Store group explicitly (Paper, Ink, etc.)
        uom: z.string(),
        orderedQty: z.number(),
        pendingQty: z.number(),

        // Inputs
        receivedQty: z.number().min(0), // Primary Qty (in PO Unit)

        // Roll Specifics
        // PO Ordered Qty Mapping (for display)
        qtyRunMtr: z.number().optional(),
        qtySqMtr: z.number().optional(),
        qtyKg: z.number().optional(),

        // Roll Specifics
        receivedRM: z.number().optional(),
        receivedSqMtr: z.number().optional(),
        receivedKg: z.number().optional(),

        noOfRolls: z.number().min(1).default(1),

        batchNo: z.string(), // Auto Generated
        supplierBatchNo: z.string().optional(), // User Input
        expiryDate: z.date().optional(),

        // Specs for Logic (Hidden)
        rollWidthMM: z.number().optional(),
        rollTotalGSM: z.number().optional(),
    }))
});

type GRNFormValues = z.infer<typeof grnFormSchema>;

interface GRNFormProps {
    initialItems: any[]; // PendingItem[]
    onSuccess: (grn?: GRN) => void;
    onCancel: () => void;
    readOnly?: boolean;
    existingData?: GRN;
    onPrintBarcode?: () => void;
}

export function GRNForm({ initialItems, onSuccess, onCancel, readOnly = false, existingData, onPrintBarcode }: GRNFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const defaultValues: Partial<GRNFormValues> = useMemo(() => {
        if (existingData) {
            return {
                supplierName: existingData.supplierName,
                grnDate: new Date(existingData.grnDate),
                challanDate: new Date(existingData.challanDate),
                supplierChallanNo: existingData.supplierChallanNo,
                remarks: existingData.remarks,
                vehicleNo: existingData.vehicleNo,
                qcReferenceNo: existingData.qcReferenceNo,
                items: initialItems.map((item, idx) => ({
                    ...item,
                    receivedQty: optionsCheck(item, existingData),
                    receivedKg: getReceivedKg(item, existingData),
                    receivedRM: getReceivedRM(item, existingData),
                    receivedSqMtr: getReceivedSqMtr(item, existingData),
                    noOfRolls: item.noOfRolls || 1,
                    batchNo: item.batchNo || `GRNXXXXX-${idx}`,
                    supplierBatchNo: item.supplierBatchNo || "",
                    expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                    rollWidthMM: item.rollWidthMM || (item as any).rollWidth,
                    rollTotalGSM: item.rollTotalGSM || (item as any).rollGSM || (item as any).totalGSM
                }))
            };
        }

        return {
            supplierName: initialItems[0]?.supplierName || "",
            grnDate: new Date(),
            challanDate: new Date(),
            supplierChallanNo: "",
            items: initialItems.map((item, idx) => {
                // Find material specs
                const matchedMaterial = mockMaterials.find((m: { id: string; itemName: string }) => m.id === `m-${item.itemCode.toLowerCase()}`) || mockMaterials.find((m: { itemName: string }) => m.itemName.includes(item.itemName));

                const autoBatch = `GRNXXXXX-${item.itemCode}-${idx + 1}`;
                let expiryDate: Date | undefined = undefined;
                if (matchedMaterial?.shelfLifeDays) {
                    expiryDate = addDays(new Date(), matchedMaterial.shelfLifeDays);
                }

                return {
                    id: item.id,
                    poId: item.poId,
                    poNumber: item.poNumber,
                    poDate: item.poDate,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    itemType: (item as any).itemType,
                    group: (item as any).group,
                    uom: item.uom,
                    orderedQty: item.orderedQty,
                    pendingQty: item.pendingQty,
                    receivedQty: 0,
                    noOfRolls: 1,
                    batchNo: autoBatch,
                    supplierBatchNo: "",
                    expiryDate: expiryDate,
                    // PRIORITIZE PO ITEM DATA over Master Lookup
                    rollWidthMM: (item as any).rollWidthMM || (item as any).rollWidth || matchedMaterial?.widthMm,
                    rollTotalGSM: (item as any).rollTotalGSM || (item as any).rollGSM || (item as any).totalGSM || matchedMaterial?.gsm,

                    // Map Quantities
                    qtyRunMtr: (item as any).qtyRunMtr,
                    qtySqMtr: (item as any).qtySqMtr,
                    qtyKg: (item as any).qtyKg,
                };
            })
        };
    }, [initialItems, existingData]);

    // Helpers for safe optional access (to avoid cluttering useMemo)
    function optionsCheck(item: any, data: GRN) {
        // Logic to find matching item in stored GRN if needed, or just map by index?
        // For now, assuming initialItems map 1:1 to data.items by index/order or ID
        const found = data.items.find(i => i.itemCode === item.itemCode); // Simple match
        return found?.receivedQty || 0;
    }
    function getReceivedKg(item: any, data: GRN) {
        const found = data.items.find(i => i.itemCode === item.itemCode);
        return found?.receivedKg;
    }
    function getReceivedRM(item: any, data: GRN) {
        const found = data.items.find(i => i.itemCode === item.itemCode);
        return found?.receivedRM;
    }
    function getReceivedSqMtr(item: any, data: GRN) {
        const found = data.items.find(i => i.itemCode === item.itemCode);
        return found?.receivedSqMtr;
    }

    const form = useForm<GRNFormValues>({
        resolver: zodResolver(grnFormSchema) as any,
        defaultValues,
    });

    const { fields, update } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // --- 3-Unit Calculation Logic ---
    const handleValueChange = (index: number, field: "RM" | "SQM" | "KG" | "Qty", value: number) => {
        const currentItem = form.getValues(`items.${index}`);
        const { rollWidthMM, rollTotalGSM } = currentItem;

        // Safety: treat NaN as 0 for calculations
        const safeValue = isNaN(value) ? 0 : value;

        // Clone updates
        const updates: Partial<typeof currentItem> = {};

        if (rollWidthMM && rollTotalGSM && rollWidthMM > 0 && rollTotalGSM > 0) {
            // It's a Roll with Specs - Auto Calculate
            if (field === "RM") {
                updates.receivedRM = value;
                const sqm = (safeValue * rollWidthMM) / 1000;
                updates.receivedSqMtr = parseFloat(sqm.toFixed(2));
                const kg = (sqm * rollTotalGSM) / 1000;
                updates.receivedKg = parseFloat(kg.toFixed(2));
            } else if (field === "SQM") {
                updates.receivedSqMtr = value;
                const rm = (safeValue * 1000) / rollWidthMM;
                updates.receivedRM = parseFloat(rm.toFixed(2));
                const kg = (safeValue * rollTotalGSM) / 1000;
                updates.receivedKg = parseFloat(kg.toFixed(2));
            } else if (field === "KG") {
                updates.receivedKg = value;
                const sqm = (safeValue * 1000) / rollTotalGSM;
                updates.receivedSqMtr = parseFloat(sqm.toFixed(2));
                const rm = (sqm * 1000) / rollWidthMM;
                updates.receivedRM = parseFloat(rm.toFixed(2));
            }
        } else {
            // Roll without specs or Material - Allow Manual Entry for respective field
            if (field === "RM") updates.receivedRM = value;
            if (field === "SQM") updates.receivedSqMtr = value;
            if (field === "KG") updates.receivedKg = value;
            if (field === "Qty") updates.receivedQty = value;
        }

        // Always sync Qty if UOM is Kg (for both cases)
        if (currentItem.uom.toLowerCase() === "kg" && updates.receivedKg !== undefined) {
            updates.receivedQty = updates.receivedKg;
        }

        // Apply
        // Apply updates using setValue to avoid re-rendering the field array (which loses focus)
        Object.entries(updates).forEach(([key, val]) => {
            if (val !== undefined) {
                form.setValue(`items.${index}.${key}` as any, val, { shouldValidate: true, shouldDirty: true });
            }
        });
    };

    const onSubmit = async (data: GRNFormValues) => {
        try {
            setIsLoading(true);
            // Transform to API format
            const apiData: any = {
                grnDate: data.grnDate.toISOString(),
                supplierName: data.supplierName,
                supplierChallanNo: data.supplierChallanNo,
                challanDate: data.challanDate.toISOString(),
                vehicleNo: data.vehicleNo,
                qcReferenceNo: data.qcReferenceNo,
                remarks: data.remarks,
                status: "Submitted",
                items: data.items.map(item => ({
                    ...item,
                    expiryDate: item.expiryDate?.toISOString()
                }))
            };

            // await createGRN(apiData);
            const savedGRN = grnStorage.save(apiData);
            toast.success("GRN Created Successfully", { description: "Stock updated." });
            onSuccess(savedGRN);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create GRN");
        } finally {
            setIsLoading(false);
        }
    };

    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `GRN-${initialItems[0]?.poNumber || "Doc"}`,
    });

    return (
        <Card ref={printRef} className="flex-1 flex flex-col border-0 shadow-none rounded-none overflow-hidden h-full bg-slate-50 print:bg-white print:overflow-visible">
            {/* Print Only Header */}
            <div className="hidden print:flex flex-col mb-4 border-b pb-4">
                <h1 className="text-2xl font-bold text-center"> GOODS RECEIPT NOTE </h1>
                <p className="text-center text-gray-500 text-xs"> This is a computer generated document. </p>
            </div>
            {/* Top Bar: PO Details & GRN No */}
            <div className="bg-white border-b px-2 py-0.5 flex items-start justify-between shrink-0 shadow-sm">
                <div className="flex gap-8">
                    <div className="flex flex-col py-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-0.5">PO No</label>
                        <span className="font-bold text-xs text-blue-600 break-words max-w-[300px] leading-tight">
                            {/* Assuming items come from same PO or showing multipled */}
                            {[...new Set(initialItems.map(i => i.poNumber))].join(", ")}
                        </span>
                    </div>
                    <div className="flex flex-col py-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-0.5">PO Date</label>
                        <span className="font-semibold text-xs text-gray-900 leading-tight">
                            {/* Show range or single date */}
                            {format(new Date(initialItems[0].poDate), "dd-MMM-yyyy")}
                        </span>
                    </div>
                    <div className="flex flex-col py-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-0.5">Supplier</label>
                        <span className="font-semibold text-xs text-gray-900 leading-tight">{form.getValues("supplierName")}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end py-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-0.5">GRN No</label>
                    <div className="bg-blue-50 text-blue-700 px-2 py-0 rounded-sm text-[10px] font-bold border border-blue-100 leading-tight">
                        {existingData?.grnNumber || `GRN0000X-${format(new Date(), "yy")}`}
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-auto p-0">
                <div className="bg-white rounded-none shadow-sm border-0">
                    <Table>
                        <TableHeader className="bg-gray-50 h-7 sticky top-0 z-10">
                            <TableRow className="h-7 border-b border-gray-200">
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[100px]">Item Code</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[200px]">Item Detail</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 text-center w-[100px]">PO Qty</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 text-center w-[50px]">Unit</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 text-center w-[60px]">Pending</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 text-center w-[140px] bg-blue-50/50">Received *</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[120px]">Auto Batch</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[120px] bg-blue-50/50">Supp. Batch</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[120px]">Expiry *</TableHead>
                                <TableHead className="h-7 p-0 px-2 text-[10px] font-bold uppercase text-gray-500 w-[100px]">Remark</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => {
                                const isRoll = !!field.rollWidthMM || field.group === "Paper" || field.group === "Roll" || field.itemType === "Roll";
                                return (
                                    <TableRow key={field.id} className="hover:bg-gray-50 border-b border-gray-100">
                                        <TableCell className="text-xs font-medium text-gray-700">{field.itemCode}</TableCell>
                                        <TableCell className="text-xs text-gray-600 max-w-[200px] truncate" title={field.itemName}>
                                            <div className="flex flex-col">
                                                <span>{field.itemName}</span>
                                                {isRoll && <span className="text-[9px] text-gray-400 mt-0.5">W: {field.rollWidthMM} | GSM: {field.rollTotalGSM}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-center p-1">
                                            {isRoll ? (
                                                <div className="flex flex-col gap-0.5 text-[10px] text-gray-600 font-medium bg-gray-50 rounded p-1 border border-gray-100">
                                                    {(() => {
                                                        const qty = field.orderedQty;
                                                        const uom = field.uom?.toLowerCase();
                                                        let rm = 0, sqm = 0, kg = 0;

                                                        const width = field.rollWidthMM || 0;
                                                        const gsm = field.rollTotalGSM || 0;

                                                        // Safety checks for division
                                                        const safeWidth = width > 0 ? width : 1;
                                                        const safeGSM = gsm > 0 ? gsm : 1;

                                                        if (uom === 'kg') {
                                                            kg = qty;
                                                            // Avoid division by zero display issues
                                                            if (gsm > 0) sqm = (kg * 1000) / gsm;
                                                            if (width > 0) rm = (sqm * 1000) / width;
                                                        } else if (uom === 'sq. mtr' || uom === 'sqm') {
                                                            sqm = qty;
                                                            if (width > 0) rm = (sqm * 1000) / width;
                                                            kg = (sqm * gsm) / 1000;
                                                        } else if (uom === 'run. mtr' || uom === 'rm') {
                                                            rm = qty;
                                                            sqm = (rm * width) / 1000;
                                                            kg = (sqm * gsm) / 1000;
                                                        } else {
                                                            // Fallback
                                                            kg = qty;
                                                            if (gsm > 0) sqm = (kg * 1000) / gsm;
                                                            if (width > 0) rm = (sqm * 1000) / width;
                                                        }

                                                        // Helper to format or show safe fallback
                                                        const fmt = (val: number) => (isFinite(val) && !isNaN(val)) ? val.toFixed(2) : "-";

                                                        return (
                                                            <>
                                                                <span title="Running Meter">{fmt(rm)} RM</span>
                                                                <span title="Square Meter">{fmt(sqm)} SQM</span>
                                                                <span title="Weight">{fmt(kg)} Kg</span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <span>{field.orderedQty}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-center">{field.uom}</TableCell>
                                        <TableCell className="text-xs text-center font-bold text-gray-800">{field.pendingQty}</TableCell>

                                        {/* Received Column: Showing Run Mtr input for Rolls */}
                                        <TableCell className="p-2 bg-blue-50/20">
                                            {isRoll ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-semibold text-gray-500 w-12 text-right">Run. Mtr</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="h-6 w-20 text-[10px] text-center bg-white border-slate-200 focus:border-blue-500 transition-colors px-1"
                                                            placeholder="0"
                                                            {...form.register(`items.${index}.receivedRM`, {
                                                                valueAsNumber: true,
                                                                onChange: (e) => handleValueChange(index, "RM", parseFloat(e.target.value) || 0)
                                                            })}
                                                            disabled={readOnly}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-semibold text-gray-500 w-12 text-right">Sq. Mtr</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="h-6 w-20 text-[10px] text-center bg-white border-slate-200 focus:border-blue-500 transition-colors px-1"
                                                            placeholder="0"
                                                            {...form.register(`items.${index}.receivedSqMtr`, {
                                                                valueAsNumber: true,
                                                                onChange: (e) => handleValueChange(index, "SQM", parseFloat(e.target.value) || 0)
                                                            })}
                                                            disabled={readOnly}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-semibold text-gray-500 w-12 text-right">Kg</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            className="h-6 w-20 text-[10px] text-center bg-white border-slate-200 focus:border-blue-500 transition-colors px-1"
                                                            placeholder="0"
                                                            {...form.register(`items.${index}.receivedKg`, {
                                                                valueAsNumber: true,
                                                                onChange: (e) => handleValueChange(index, "KG", parseFloat(e.target.value) || 0)
                                                            })}
                                                            disabled={readOnly}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    className="h-6 w-full text-[10px] text-center bg-white border-slate-200 focus:border-blue-500 transition-colors px-1"
                                                    placeholder="Qty"
                                                    {...form.register(`items.${index}.receivedQty`, {
                                                        valueAsNumber: true,
                                                        onChange: (e) => handleValueChange(index, "Qty", parseFloat(e.target.value) || 0)
                                                    })}
                                                    disabled={readOnly}
                                                />
                                            )}
                                        </TableCell>

                                        {/* Auto Batch No */}
                                        <TableCell>
                                            <Input
                                                {...form.register(`items.${index}.batchNo`)}
                                                className="h-6 text-[10px] bg-gray-50 text-gray-500 font-mono border-slate-200 px-1"
                                                readOnly
                                                placeholder="Auto"
                                            />
                                        </TableCell>

                                        {/* Supplier Batch No */}
                                        <TableCell className="bg-blue-50/20">
                                            <Input
                                                {...form.register(`items.${index}.supplierBatchNo`)}
                                                className="h-6 text-[10px] bg-white border-slate-200 focus:border-blue-500 transition-colors px-1"
                                                placeholder="Enter..."
                                                disabled={readOnly}
                                            />
                                        </TableCell>

                                        {/* Expiry */}
                                        <TableCell>
                                            <Input
                                                type="date"
                                                className="h-6 w-full text-[10px] bg-white px-1 cursor-pointer border-slate-200 focus:border-blue-500 transition-colors"
                                                placeholder="Select"
                                                value={form.watch(`items.${index}.expiryDate`) ? format(form.watch(`items.${index}.expiryDate`)!, "yyyy-MM-dd") : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value ? new Date(e.target.value) : undefined;
                                                    form.setValue(`items.${index}.expiryDate`, val);
                                                }}
                                                onClick={(e) => e.currentTarget.showPicker()}
                                                disabled={readOnly}
                                            />
                                        </TableCell>

                                        {/* Remarks */}
                                        <TableCell>
                                            <Input className="h-6 text-[10px] bg-white border-slate-200 focus:border-blue-500 transition-colors px-1" placeholder="Optional" disabled={readOnly} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Footer Form */}
            <div className="bg-white border-t p-6 shrink-0">
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Supplier Challan No *</label>
                        <Input
                            {...form.register("supplierChallanNo")}
                            className="h-8 bg-white border-gray-300 focus:bg-white transition-all text-xs"
                            placeholder="Enter Challan No"
                            disabled={readOnly}
                        />
                        {form.formState.errors.supplierChallanNo && <span className="text-red-500 text-[10px]">{form.formState.errors.supplierChallanNo.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Challan Date</label>
                        <Input
                            type="date"
                            className="h-8 bg-white border-gray-300 focus:bg-white transition-all text-xs cursor-pointer"
                            value={form.watch("challanDate") ? format(form.watch("challanDate"), "yyyy-MM-dd") : ""}
                            onChange={(e) => form.setValue("challanDate", e.target.value ? new Date(e.target.value) : new Date())}
                            onClick={(e) => e.currentTarget.showPicker()}
                            disabled={readOnly}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Vehicle No</label>
                        <Input
                            {...form.register("vehicleNo")}
                            className="h-8 bg-white border-gray-300 focus:bg-white transition-all text-xs"
                            disabled={readOnly}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Received By</label>
                        <Input
                            value="admin" // Mock
                            disabled
                            className="h-8 bg-gray-50 border-gray-300 text-gray-500 text-xs"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Common Remark</label>
                    <Input
                        {...form.register("remarks")}
                        className="h-8 bg-white border-gray-300 focus:bg-white transition-all text-xs"
                        disabled={readOnly}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-dashed">
                    {!readOnly && (
                        <>
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="h-10 min-w-[100px] border-gray-300 font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 uppercase tracking-wide text-xs print:hidden"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isLoading}
                                variant="gradient-blue"
                                className="h-10 min-w-[120px] uppercase tracking-wide text-xs shadow-md print:hidden"
                            >
                                {isLoading ? "Saving..." : "Save GRN"}
                            </Button>
                        </>
                    )}
                    {readOnly && (
                        <>
                            <Button
                                onClick={() => handlePrint && handlePrint()}
                                className="h-10 min-w-[100px] bg-blue-600 text-white font-bold uppercase tracking-wide text-xs shadow-md print:hidden"
                            >
                                <Printer className="mr-2 h-4 w-4" /> Print Document
                            </Button>
                            {onPrintBarcode && (
                                <Button
                                    onClick={onPrintBarcode}
                                    className="h-10 min-w-[100px] bg-indigo-600 text-white font-bold uppercase tracking-wide text-xs shadow-md print:hidden ml-2"
                                >
                                    <span className="mr-2 text-lg leading-none">≣</span> Print Barcodes
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
