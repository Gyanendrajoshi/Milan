"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GRN } from "@/types/grn-master";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { grnStorage } from "@/services/grn-storage";

interface GRNDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    grn: GRN | null;
}

export function GRNDetailsDialog({ open, onOpenChange, grn: initialGrn }: GRNDetailsDialogProps) {
    const [grn, setGrn] = useState<GRN | null>(null);

    useEffect(() => {
        if (open && initialGrn) {
            // Fetch fresh data from storage
            const freshData = grnStorage.getById(initialGrn.id);
            setGrn(freshData || initialGrn);
        } else {
            setGrn(null);
        }
    }, [open, initialGrn]);

    if (!grn) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        <span>{grn.grnNumber}</span>
                        <span className="text-sm font-normal text-muted-foreground mr-8">
                            {format(new Date(grn.grnDate), "dd MMM yyyy")}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg">
                    <div>
                        <span className="text-muted-foreground">Supplier:</span> <span className="font-semibold">{grn.supplierName}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Challan No:</span> <span className="font-semibold">{grn.supplierChallanNo}</span>
                    </div>
                </div>

                <div className="border rounded-md mt-4 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Batch No</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                                <TableHead className="text-right">Remaining (Stock)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grn.items.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <div className="font-medium">{item.itemName}</div>
                                        <div className="text-xs text-muted-foreground">{item.itemCode}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{item.batchNo}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.receivedQty} {item.uom}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-blue-600">
                                        {item.remainingQty ?? item.receivedQty} {item.uom}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${(item.remainingQty ?? item.receivedQty) === 0 ? "bg-red-50 text-red-600 border-red-200" :
                                            (item.remainingQty ?? item.receivedQty) < item.receivedQty ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                "bg-green-50 text-green-600 border-green-200"
                                            }`}>
                                            {(item.remainingQty ?? item.receivedQty) === 0 ? "Consumed" :
                                                (item.remainingQty ?? item.receivedQty) < item.receivedQty ? "Partially Issued" : "Available"}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
