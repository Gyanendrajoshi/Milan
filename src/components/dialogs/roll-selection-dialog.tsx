"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { RollMaster } from "@/types/roll-master";
import { getRolls } from "@/services/api/roll-service";
import { ColumnDef } from "@tanstack/react-table";

interface RollSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (roll: RollMaster) => void;
}

export function RollSelectionDialog({ open, onOpenChange, onSelect }: RollSelectionDialogProps) {
    const [rolls, setRolls] = useState<RollMaster[]>([]);

    // Load rolls from localStorage
    useEffect(() => {
        const loadRolls = async () => {
            const data = await getRolls();
            setRolls(data);
        };
        if (open) {
            loadRolls();
        }
    }, [open]);
    const columns: ColumnDef<RollMaster>[] = useMemo(() => [
        {
            accessorKey: "itemCode",
            header: "Item Code",
        },
        {
            accessorKey: "itemType",
            header: "Type",
        },
        {
            accessorKey: "supplierItemCode",
            header: "Mfg",
            cell: ({ row }) => row.original.supplierItemCode || "-",
        },
        {
            accessorKey: "quality",
            header: "Quality",
        },
        {
            accessorKey: "rollWidthMM",
            header: "Width (mm)",
        },
        {
            accessorKey: "mill",
            header: "Mill",
        },
        {
            accessorKey: "faceGSM",
            header: "Face GSM",
            cell: ({ row }) => row.original.faceGSM || "-",
        },
        {
            accessorKey: "releaseGSM",
            header: "Release GSM",
            cell: ({ row }) => row.original.releaseGSM || "-",
        },
        {
            accessorKey: "adhesiveGSM",
            header: "Adhesive GSM",
            cell: ({ row }) => row.original.adhesiveGSM || "-",
        },
        {
            accessorKey: "thicknessMicron",
            header: "Thickness",
            cell: ({ row }) => row.original.thicknessMicron || "-",
        },
        {
            accessorKey: "totalGSM",
            header: "Total GSM",
            cell: ({ row }) => row.original.totalGSM || "-",
        },
        {
            accessorKey: "purchaseUnit",
            header: "Purchase Unit",
            cell: ({ row }) => row.original.purchaseUnit || "-",
        },
        {
            accessorKey: "purchaseRate",
            header: "Rate",
            cell: ({ row }) => `₹${row.original.purchaseRate?.toFixed(2) || "0.00"}`,
        },
        {
            accessorKey: "stockUnit",
            header: "Stock Unit",
            cell: ({ row }) => row.original.stockUnit || "-",
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
            <DialogContent className="max-w-[90vw] h-[70vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white">
                    <DialogTitle className="text-white">Select Material (Roll) [{rolls.length}]</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-6 pt-2">
                    <DataTable
                        columns={columns}
                        data={rolls}
                        searchKey="quality"
                        hideToolbar={true}
                        hidePagination={true}
                        disableResponsive={true}
                    />
                </div>
                <DialogFooter className="p-6 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
