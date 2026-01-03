"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Material } from "@/types/material-master"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
    onEdit: (data: Material) => void
    onDelete: (data: Material) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Material>[] => [
    {
        accessorKey: "itemCode",
        header: "Item Code",
        cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.itemCode}</span>,
    },
    {
        accessorKey: "itemName",
        header: "Item Name",
    },
    {
        accessorKey: "itemGroup",
        header: "Item Group",
    },
    {
        accessorKey: "shelfLifeDays",
        header: "Shelf Life",
        cell: ({ row }) => row.original.shelfLifeDays ? `${row.original.shelfLifeDays} days` : "-",
    },
    {
        accessorKey: "purchaseUnit",
        header: "Unit",
    },
    {
        accessorKey: "purchaseRate",
        header: "Rate (₹)",
        cell: ({ row }) => `₹${row.original.purchaseRate.toFixed(2)}`,
    },
    {
        accessorKey: "hsnCode",
        header: "HSN Code",
        cell: ({ row }) => row.original.hsnCode || "-",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const material = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(material)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(material)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
