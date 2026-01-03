"use client"

import { ColumnDef } from "@tanstack/react-table"
import { RollMaster } from "@/types/roll-master"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define props for actions to pass handlers
interface ColumnsProps {
    onEdit: (data: RollMaster) => void
    onDelete: (data: RollMaster) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<RollMaster>[] => [
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
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const roll = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(roll)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(roll)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
