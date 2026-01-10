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
import { Package } from "lucide-react";
import { RollMaster } from "@/types/roll-master";
import { ColumnDef } from "@tanstack/react-table";

interface RollMasterSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableRolls: (RollMaster & { totalStock: number; uom: string })[];
    onSelect: (rollMaster: RollMaster & { totalStock: number; uom: string }) => void;
}

export function RollMasterSelectionDialog({
    open,
    onOpenChange,
    availableRolls,
    onSelect,
}: RollMasterSelectionDialogProps) {
    // Debug: Log available rolls
    console.log('Roll Master Dialog - Available Rolls:', availableRolls);
    console.log('Roll Master Dialog - Rolls Count:', availableRolls.length);

    const columns: ColumnDef<RollMaster & { totalStock: number; uom: string }>[] = useMemo(() => [
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
            cell: ({ row }) => {
                const displayName = row.original.itemName ||
                    `${row.original.itemType || 'Roll'} ${row.original.rollWidthMM}mm ${row.original.totalGSM}gsm`;

                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{displayName}</span>
                        {row.original.supplierItemCode && (
                            <span className="text-xs text-muted-foreground">
                                MFG Code: {row.original.supplierItemCode}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "rollWidthMM",
            header: "Width (mm)",
            cell: ({ row }) => (
                <span className="font-bold text-purple-600 dark:text-purple-400">
                    {row.original.rollWidthMM}
                </span>
            ),
        },
        {
            accessorKey: "totalGSM",
            header: "GSM",
            cell: ({ row }) => (
                <span className="font-semibold">
                    {row.original.totalGSM || '-'}
                </span>
            ),
        },
        {
            accessorKey: "quality",
            header: "Quality",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.quality || '-'}
                </span>
            ),
        },
        {
            accessorKey: "mill",
            header: "Mill",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.mill || '-'}
                </span>
            ),
        },
        {
            accessorKey: "totalStock",
            header: () => (
                <div className="flex items-center justify-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    Stock
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${row.original.totalStock > 100
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : row.original.totalStock > 0
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}>
                        {row.original.totalStock} {row.original.uom}
                    </span>
                </div>
            ),
        },
        {
            id: "select",
            header: "",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="gradient-blue"
                    className="border-0"
                    onClick={() => {
                        onSelect(row.original);
                        onOpenChange(false);
                    }}
                >
                    Select
                </Button>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ], [onSelect, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white rounded-t-lg">
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Select Roll Type
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-4">
                    {availableRolls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">
                                No rolls available
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Please create a GRN to add rolls to inventory
                            </p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={availableRolls}
                            searchKey="itemName"
                            hideToolbar={false}
                            hidePagination={true}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
