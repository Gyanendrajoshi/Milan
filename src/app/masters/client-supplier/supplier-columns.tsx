"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@/types/client-supplier"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
    onEdit: (data: Supplier) => void
    onDelete: (data: Supplier) => void
}

export const getSupplierColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Supplier>[] => [
    {
        accessorKey: "supplierName",
        header: "Supplier Name",
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => <span className="truncate max-w-[200px] block" title={row.getValue("address") as string}>{row.getValue("address") || "-"}</span>,
    },
    {
        accessorKey: "mobileNumber",
        header: "Mobile",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "gstNumber",
        header: "GST Number",
        cell: ({ row }) => row.original.gstNumber || "-",
    },
    {
        accessorKey: "excessQuantityTolerance",
        header: "Tolerance (%)",
        cell: ({ row }) => row.original.excessQuantityTolerance ? `${row.original.excessQuantityTolerance}%` : "-",
    },
    {
        accessorKey: "state",
        header: "State",
    },
    {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => row.original.country || "-",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(supplier)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(supplier)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
