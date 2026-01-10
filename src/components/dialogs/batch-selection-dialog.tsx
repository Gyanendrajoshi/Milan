"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { Package, Search } from "lucide-react";
import { GRNItem } from "@/types/grn-master";
import { ColumnDef } from "@tanstack/react-table";
import { GRN } from "@/types/grn-master";
import { slittingService } from "@/services/api/slitting-service";

interface BatchSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rollMasterId: string;
    rollMasterName?: string;
    onSelect: (item: GRNItem & { grnId: string; rollMasterId: string }) => void;
}

export function BatchSelectionDialog({
    open,
    onOpenChange,
    rollMasterId,
    rollMasterName,
    onSelect,
}: BatchSelectionDialogProps) {

    // Fetch data using the service
    // Note: In a real app this might use React Query or useEffect, 
    // but here we can derive it since we have synchronous storage access in the service
    const data = useMemo(() => {
        if (!open || !rollMasterId) return [];
        return slittingService.getGRNItemsByRollMaster(rollMasterId);
    }, [open, rollMasterId]);

    const columns: ColumnDef<GRNItem & { grnId: string }>[] = useMemo(() => [
        {
            accessorKey: "itemCode",
            header: "Item Code",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {row.original.itemCode}
                </span>
            ),
        },
        {
            accessorKey: "itemName",
            header: "Item Name",
            cell: ({ row }) => (
                <span className="font-medium text-sm">
                    {row.original.itemName}
                </span>
            ),
        },
        {
            accessorKey: "uom",
            header: "Stock Unit",
            cell: ({ row }) => (
                <span className="text-sm border px-2 py-0.5 rounded bg-muted">
                    {row.original.uom}
                </span>
            ),
        },
        {
            accessorKey: "remainingQty",
            header: "Stock",
            cell: ({ row }) => (
                <span className={`font-bold ${(row.original.remainingQty || 0) > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500"
                    }`}>
                    {(row.original.remainingQty ?? row.original.receivedQty ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            // Display GRN Number (using ID as fallback if separate number not available in this view)
            accessorKey: "grnId",
            header: "GRN No",
            cell: ({ row }) => {
                // If the stock is from "STOCK" directly (slitting output), show that
                // Otherwise show the GRN ID/Number
                const isStock = row.original.grnId === "STOCK";
                return (
                    <span className="text-xs text-muted-foreground font-mono">
                        {isStock ? "STOCK-IN" : row.original.grnId}
                    </span>
                );
            }
        },
        {
            accessorKey: "batchNo",
            header: "Batch No",
            cell: ({ row }) => (
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {row.original.batchNo}
                </span>
            ),
        },
        {
            accessorKey: "supplierBatchNo",
            header: "Supp.Batch No",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {row.original.supplierBatchNo || "-"}
                </span>
            ),
        },
        {
            id: "select",
            header: "",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="gradient-blue"
                    className="h-7 border-0"
                    onClick={() => {
                        onSelect(row.original as any);
                        onOpenChange(false);
                    }}
                >
                    Select
                </Button>
            ),
        },
    ], [onSelect, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white rounded-t-lg">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Select Specific Roll (Batch)
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-muted/30 px-6 py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                        Showing rolls for: <span className="font-semibold text-foreground">{rollMasterName || "Detailed View"}</span>
                    </span>
                </div>

                <div className="flex-1 overflow-hidden p-6 pt-4">
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">
                                No matching stock found
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Try selecting a different roll type.
                            </p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            searchKey="batchNo"
                            placeholder="Search by Batch No..."
                            hideToolbar={false}
                            hidePagination={false}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
