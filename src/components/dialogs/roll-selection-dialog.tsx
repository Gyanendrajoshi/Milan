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
    const [isLoading, setIsLoading] = useState(true);

    // Load rolls from localStorage - Always load when component mounts
    useEffect(() => {
        const loadRolls = async () => {
            setIsLoading(true);
            const data = await getRolls();
            console.log("Roll Dialog: Loaded rolls count:", data.length);
            setRolls(data);
            setIsLoading(false);
        };
        loadRolls();
    }, []); // Load once on mount
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
                <div className="flex-1 overflow-hidden p-6 pt-2 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        </div>
                    ) : null}
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
