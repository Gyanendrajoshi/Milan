"use strict";
import React, { useEffect, useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Building2, AlertCircle } from "lucide-react";
import { MaterialIssue, IssuedItem } from "@/types/material-issue";
import { issueStorage } from "@/services/issue-storage";
import { consumptionStorage } from "@/services/consumption-storage";
import { toast } from "sonner";
import { ConsumedItem, MaterialConsumption } from "@/types/material-consumption";

interface MaterialConsumptionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobCardNo: string;
    jobId: string;
    clientName: string;
    contentName?: string;
    jobQuantity?: number;
}

interface ConsumptionRow {
    issueId: string;
    issueDate: string;
    itemName: string;
    description?: string; // e.g. 300GSM
    unit: string;
    batchNo: string;
    issuedQty: number;
    issuedBal: number;

    // Inputs
    consumeQty: string;
    remarks: string;

    // Hidden refs
    itemCode: string; // to link
    issueItemId: string; // pseudo ID
}

export function MaterialConsumptionDialog({
    isOpen,
    onClose,
    jobCardNo,
    jobId,
    clientName,
    contentName
}: MaterialConsumptionDialogProps) {
    const [context, setContext] = useState<"JOB" | "DEPT">("JOB");
    const [selectedDept, setSelectedDept] = useState<string>("");

    // Data
    const [issues, setIssues] = useState<MaterialIssue[]>([]);
    const [rows, setRows] = useState<ConsumptionRow[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadIssues();
        }
    }, [isOpen, context, selectedDept, jobCardNo]);

    const loadIssues = () => {
        const allIssues = issueStorage.getAll();
        let relevantIssues: MaterialIssue[] = [];

        if (context === "JOB") {
            // Filter by Job Card. 
            // Note: issueStorage might store jobCardNo differently, verify flexible matching if needed.
            relevantIssues = allIssues.filter(i => i.issueType === "JOB" && i.jobCardNo === jobCardNo);
        } else {
            // Filter by Dept
            if (!selectedDept) {
                setRows([]);
                return;
            }
            relevantIssues = allIssues.filter(i => i.issueType === "DEPT" && i.department === selectedDept);
        }

        setIssues(relevantIssues);

        // Convert issues to flattened rows
        const newRows: ConsumptionRow[] = [];

        relevantIssues.forEach(issue => {
            issue.items.forEach((item, idx) => {
                // Calculate Balance
                const totalConsumed = consumptionStorage.getConsumedQtyForIssue(issue.id, item.itemCode, item.batchNo);
                const balance = item.issuedQty - totalConsumed;

                // Only show if there is logic to consume (or show all? usually show all for history, but maybe filter 0 balance?)
                // User image shows "Issued Bal", implies we show active rows.
                // Let's show all for now so user can see what's depleted too.

                newRows.push({
                    issueId: issue.id,
                    issueDate: issue.issueDate,
                    itemName: item.itemName,
                    description: item.itemName, // Description usually same or enriched
                    unit: item.uom,
                    batchNo: item.batchNo,
                    issuedQty: item.issuedQty,
                    issuedBal: balance,
                    consumeQty: "0",
                    remarks: "",
                    itemCode: item.itemCode,
                    issueItemId: `${issue.id}-${idx}`
                });
            });
        });

        setRows(newRows);
    };

    const handleRowChange = (index: number, field: keyof ConsumptionRow, value: string) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);
    };

    const handleConfirm = () => {
        // Validation
        const itemsToSave: ConsumedItem[] = [];
        let hasError = false;

        for (const row of rows) {
            const qty = parseFloat(row.consumeQty || "0");
            if (qty > 0) {
                if (qty > row.issuedBal) {
                    toast.error(`Cannot consume ${qty} for ${row.itemName}. Max balance is ${row.issuedBal}`);
                    hasError = true;
                    break;
                }
                itemsToSave.push({
                    issueItemId: row.issueItemId,
                    itemCode: row.itemCode,
                    batchNo: row.batchNo,
                    consumedQty: qty,
                    uom: row.unit,
                    remarks: row.remarks
                });
            }
        }

        if (hasError) return;
        if (itemsToSave.length === 0) {
            toast.warning("No quantities entered to consume.");
            return;
        }

        // Save
        const newConsumption: MaterialConsumption = {
            id: `CONS-${Date.now()}`,
            date: new Date().toISOString(),
            jobId: context === "JOB" ? jobId : undefined,
            jobCardNo: context === "JOB" ? jobCardNo : undefined,
            department: context === "DEPT" ? selectedDept : undefined,
            items: itemsToSave,
            createdAt: new Date().toISOString()
        };

        consumptionStorage.save(newConsumption);
        toast.success("Consumption Saved Successfully");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v: boolean) => !v && onClose()}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden gap-0">
                <DialogHeader className="bg-theme-gradient-r p-4 shrink-0">
                    <div className="flex justify-between items-center text-white">
                        <DialogTitle className="text-lg font-bold">Material Consumption Entry</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 bg-white max-h-[80vh] overflow-y-auto">
                    {/* Context Selection */}
                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                        <RadioGroup
                            defaultValue="JOB"
                            className="flex items-center gap-6"
                            onValueChange={(v: string) => setContext(v as "JOB" | "DEPT")}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="JOB" id="r1" />
                                <Label htmlFor="r1" className="font-bold text-slate-700 text-xs uppercase tracking-wider">One Job Card</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="DEPT" id="r2" />
                                <Label htmlFor="r2" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Department/Other</Label>
                            </div>
                        </RadioGroup>

                        {context === "JOB" ? (
                            <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-4">
                                <div className="bg-blue-600 p-2 rounded-md text-white">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Context: Active Job Card</div>
                                    <div className="font-bold text-slate-800 text-sm">{jobCardNo} / {clientName}</div>
                                    {contentName && <div className="text-xs text-blue-600/80 mt-0.5">Content: {contentName}</div>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1">
                                <Select value={selectedDept} onValueChange={setSelectedDept}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Printing">Printing</SelectItem>
                                        <SelectItem value="Lamination">Lamination</SelectItem>
                                        <SelectItem value="Slitting">Slitting</SelectItem>
                                        <SelectItem value="Pouching">Pouching</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue No</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/3">Item Details</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Issued</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right text-blue-600">Issued Bal</th>
                                    <th className="p-3 text-[10px] font-bold text-red-600 uppercase tracking-wider text-right w-32">Consume Qty</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-slate-400 text-sm">
                                            No issued items found for this context.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-3 text-xs font-bold text-slate-700">{row.issueId.split('-')[1] || row.issueId}</td>
                                            <td className="p-3 text-xs text-slate-600">{new Date(row.issueDate).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-sm text-slate-800">{row.itemName}</div>
                                                <div className="text-[10px] text-slate-500">{row.description}</div>
                                            </td>
                                            <td className="p-3 text-xs text-slate-600">
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{row.unit}</span>
                                            </td>
                                            <td className="p-3 text-xs font-mono text-slate-600">{row.batchNo}</td>
                                            <td className="p-3 text-xs font-bold text-slate-700 text-right">{row.issuedQty}</td>
                                            <td className="p-3 text-xs font-bold text-blue-600 text-right text-lg">{row.issuedBal}</td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    className="h-9 text-right font-bold text-slate-900 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                                    value={row.consumeQty === "0" ? "" : row.consumeQty}
                                                    placeholder="0"
                                                    onChange={(e) => handleRowChange(idx, "consumeQty", e.target.value)}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    className="h-9 text-xs"
                                                    placeholder="Remarks..."
                                                    value={row.remarks}
                                                    onChange={(e) => handleRowChange(idx, "remarks", e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-start gap-3 text-orange-800">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <span className="font-bold block mb-0.5">VALIDATION RULE:</span>
                            You cannot consume more than the issued quantity. If actual consumption is higher, please request a New Issue.
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-slate-50 gap-2">
                    <Button variant="outline" onClick={onClose} className="border-slate-300">CANCEL</Button>
                    <Button onClick={handleConfirm} variant="gradient-blue" className="px-6 shadow-md shadow-blue-200">
                        CONFIRM CONSUMPTION
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
