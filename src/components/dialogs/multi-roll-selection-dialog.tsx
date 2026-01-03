"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { RollMaster } from "@/types/roll-master";
import { getRolls } from "@/services/api/roll-service";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiRollSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (rolls: RollMaster[]) => void;
}

export function MultiRollSelectionDialog({ open, onOpenChange, onSelect }: MultiRollSelectionDialogProps) {
    const [rowSelection, setRowSelection] = useState({});
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

    const selectedRolls = useMemo(() => {
        const selectedIndices = Object.keys(rowSelection);
        return rolls.filter((_, index) => selectedIndices.includes(index.toString()));
    }, [rowSelection, rolls]);

    const columns: ColumnDef<RollMaster>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
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
            header: "Mfg Item Code",
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
    ], []);

    const handleConfirm = () => {
        onSelect(selectedRolls);
        onOpenChange(false);
        setRowSelection({});
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[70vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white">
                    <DialogTitle className="text-white">Select Rolls (Multiple)</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-6 pt-2">
                    <DataTable
                        columns={columns}
                        data={rolls}
                        searchKey="quality"
                        hideToolbar={false}
                        hidePagination={true}
                        enableRowSelection={true}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                </div>
                <DialogFooter className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {selectedRolls.length} roll(s) selected
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={selectedRolls.length === 0}
                            variant="gradient-blue"
                        >
                            Add Selected Rolls
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
