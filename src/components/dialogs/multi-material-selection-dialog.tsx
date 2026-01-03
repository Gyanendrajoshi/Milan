"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Material } from "@/types/material-master";
import { getMaterials } from "@/services/api/material-service";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiMaterialSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (materials: Material[]) => void;
}

export function MultiMaterialSelectionDialog({ open, onOpenChange, onSelect }: MultiMaterialSelectionDialogProps) {
    const [rowSelection, setRowSelection] = useState({});
    const [materials, setMaterials] = useState<Material[]>([]);

    // Load materials from localStorage
    useEffect(() => {
        const loadMaterials = async () => {
            const data = await getMaterials();
            setMaterials(data);
        };
        if (open) {
            loadMaterials();
        }
    }, [open]);

    const selectedMaterials = useMemo(() => {
        const selectedIndices = Object.keys(rowSelection);
        return materials.filter((_, index) => selectedIndices.includes(index.toString()));
    }, [rowSelection, materials]);

    const columns: ColumnDef<Material>[] = useMemo(() => [
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
            accessorKey: "itemName",
            header: "Item Name",
        },
        {
            accessorKey: "itemGroup",
            header: "Group",
        },
        {
            accessorKey: "purchaseUnit",
            header: "Unit",
        },
        {
            accessorKey: "purchaseRate",
            header: "Rate",
            cell: ({ row }) => `₹${row.original.purchaseRate?.toFixed(2) || "0.00"}`,
        },
        {
            accessorKey: "hsnCode",
            header: "HSN Code",
        },
    ], []);

    const handleConfirm = () => {
        onSelect(selectedMaterials);
        onOpenChange(false);
        setRowSelection({});
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white">
                    <DialogTitle className="text-white">Select Materials (Multiple)</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-6 pt-2">
                    <DataTable
                        columns={columns}
                        data={materials}
                        searchKey="itemName"
                        hideToolbar={false}
                        hidePagination={true}
                        enableRowSelection={true}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                </div>
                <DialogFooter className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {selectedMaterials.length} material(s) selected
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={selectedMaterials.length === 0}
                            variant="gradient-blue"
                        >
                            Add Selected Materials
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
