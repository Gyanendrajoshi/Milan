"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DispatchJobRow } from "./columns";
import { X } from "lucide-react";

interface PackagingDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: DispatchJobRow | null;
    onSave: (jobId: string, totalQty: number, packagingData: any) => void;
}

export function PackagingDetailsDialog({ open, onOpenChange, job, onSave }: PackagingDetailsDialogProps) {
    // Packaging Fields
    const [numBoxes, setNumBoxes] = useState<number>(0);
    const [bundlesPerBox, setBundlesPerBox] = useState<number>(0);
    const [qtyPerBundle, setQtyPerBundle] = useState<number>(0);
    const [weightPerBox, setWeightPerBox] = useState<number>(0);

    // Calculated
    const [totalDispatchQty, setTotalDispatchQty] = useState<number>(0);

    // Initialize or Reset
    useEffect(() => {
        if (open && job) {
            // Check if we want to retain previous values if editing? 
            // For now, reset or rely on parent passing initial data if needed. 
            // Assuming simplified flow: always new/blank or minimal.
            // If we want preservation, we'd need to pass existing data into props.
            setNumBoxes(1);
            setBundlesPerBox(1);
            setQtyPerBundle(0);
            setWeightPerBox(0);
        }
    }, [open, job]);

    // Auto Calculate Total
    useEffect(() => {
        const total = (numBoxes || 0) * (bundlesPerBox || 0) * (qtyPerBundle || 0);
        setTotalDispatchQty(total);
    }, [numBoxes, bundlesPerBox, qtyPerBundle]);

    const handleSave = () => {
        if (!job) return;
        onSave(job.id, totalDispatchQty, {
            numBoxes,
            bundlesPerBox,
            qtyPerBundle,
            weightPerBox
        });
        onOpenChange(false);
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-bold text-slate-800">
                        Packaging Details: <span className="text-blue-600">{job.jobCardNo}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Header Info Card */}
                    <div className="bg-slate-50 border rounded-md p-3 flex justify-between items-center">
                        <div>
                            <span className="font-bold text-slate-800">{job.jobName}</span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-sm text-slate-500">Client: {job.clientName}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                            Pending: <span className="text-orange-600 font-bold">{job.pendingQty?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Number of Boxes</Label>
                            <Input
                                type="number"
                                className="h-9"
                                value={numBoxes}
                                onChange={e => setNumBoxes(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Bundles per Box</Label>
                            <Input
                                type="number"
                                className="h-9"
                                value={bundlesPerBox}
                                onChange={e => setBundlesPerBox(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Qty per Bundle</Label>
                            <Input
                                type="number"
                                className="h-9"
                                value={qtyPerBundle}
                                onChange={e => setQtyPerBundle(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Weight per Box (kg)</Label>
                            <Input
                                type="number"
                                className="h-9"
                                value={weightPerBox}
                                onChange={e => setWeightPerBox(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                    </div>

                    {/* Total Result */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 uppercase">Total Dispatch Quantity</Label>
                        <div className="flex items-center gap-3">
                            <div className="h-10 flex-1 bg-blue-50/50 border border-blue-100 rounded-md flex items-center px-4 font-bold text-blue-700 text-lg">
                                {totalDispatchQty.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 text-right leading-tight max-w-[150px]">
                                Calculated: {totalDispatchQty} pcs
                                <br />
                                (Auto-updates from boxes)
                            </div>
                        </div>
                    </div>

                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 border-t sm:justify-end">
                    <Button onClick={handleSave} variant="gradient-blue" className="px-5">
                        Add to List
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
