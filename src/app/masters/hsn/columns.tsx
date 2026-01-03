"use client"

import { ColumnDef } from "@tanstack/react-table"
import { HSNMaster } from "@/types/hsn-master"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
    onEdit: (data: HSNMaster) => void
    onDelete: (data: HSNMaster) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<HSNMaster>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "hsnCode",
        header: "HSN Code",
    },
    {
        accessorKey: "gstPercentage",
        header: "GST (%)",
        cell: ({ row }) => {
            return `${row.original.gstPercentage}%`
        },
    },
    {
        id: "actions",
        enableColumnFilter: false,
        header: "Actions",
        cell: ({ row }) => {
            const hsn = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(hsn)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(hsn)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
