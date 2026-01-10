"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PurchaseOrder } from "@/services/api/purchase-order-service"
import { Edit, Trash2, Printer, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Define props for actions to pass handlers
interface ColumnsProps {
    onView: (data: PurchaseOrder) => void
    onDelete: (data: PurchaseOrder) => void
    onPrint?: (data: PurchaseOrder) => void
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
        case "Partial":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "Closed":
            return "bg-green-100 text-green-800 hover:bg-green-100";
        case "Cancelled":
            return "bg-red-100 text-red-800 hover:bg-red-100";
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
};

export const getColumns = ({ onView, onDelete, onPrint }: ColumnsProps): ColumnDef<PurchaseOrder>[] => [
    {
        accessorKey: "poNumber",
        header: "PO Number",
        cell: ({ row }) => <span className="font-medium text-blue-700">{row.original.poNumber}</span>,
    },
    {
        accessorKey: "poDate",
        header: "PO Date",
        cell: ({ row }) => <span className="text-slate-600">{format(new Date(row.original.poDate), "dd MMM yyyy")}</span>,
    },
    {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.supplierName || row.original.supplierId}</span>,
    },
    {
        accessorKey: "grandTotal",
        header: "Grand Total",
        cell: ({ row }) => <span className="font-bold text-slate-700">₹{row.original.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5 rounded-sm font-semibold pointer-events-none", getStatusColor(row.original.status))}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const po = row.original
            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(po)}
                        className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="View/Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint?.(po)}
                        className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        title="Print"
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(po)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
