"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Client } from "@/types/client-supplier"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
    onEdit: (data: Client) => void
    onDelete: (data: Client) => void
}

export const getClientColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Client>[] => [
    {
        accessorKey: "clientName",
        header: "Client Name",
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
        header: "GSTIN",
        cell: ({ row }) => row.original.gstNumber || "-",
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
            const client = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(client)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(client)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
