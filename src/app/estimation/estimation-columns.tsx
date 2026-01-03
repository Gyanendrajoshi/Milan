"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash, MoreHorizontal, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the type for the Estimation Table Row matching user request
export type Estimation = {
    id: string // Internal ID
    jobCardNo: string // Display ID
    jobName: string
    client: string
    clientId?: string // Added for Dispatch Module compatibility
    quantity: number
    deliveryDate: string
    status: string
}

interface ColumnsProps {
    onEdit: (data: Estimation) => void
    onPrint: (data: Estimation) => void
    onDelete: (data: Estimation) => void
}

export const getEstimationColumns = ({ onEdit, onPrint, onDelete }: ColumnsProps): ColumnDef<Estimation>[] => [
    {
        accessorKey: "jobCardNo",
        header: "Job Card",
        cell: ({ row }) => <span className="font-bold text-primary text-xs">{row.getValue("jobCardNo")}</span>,
    },
    {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => <span className="text-foreground font-bold text-xs">{row.getValue("client")}</span>,
    },
    {
        accessorKey: "jobName",
        header: "Job Name",
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue("jobName")}</span>,
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue("quantity")}</span>,
    },
    {
        accessorKey: "deliveryDate",
        header: "Delivery Date",
        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue("deliveryDate")}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant="outline" className={
                    status === "Approved" ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0" :
                        status === "Pending" ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0" :
                            "bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0"
                }>{status}</Badge>
            )
        },
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const est = row.original
            return (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(est)}
                        className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                        title="Edit"
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint(est)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Print"
                    >
                        <Printer className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(est)}
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                    >
                        <Trash className="h-3 w-3" />
                    </Button>
                </div>
            )
        },
    },
]
