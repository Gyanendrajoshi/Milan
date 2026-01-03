"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Truck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// We define a synthetic type that combines Job Data + Dispatch Calculation
export type DispatchJobRow = {
    id: string; // Job ID
    jobCardNo: string;
    clientId: string; // Client ID
    clientName: string; // Display Name
    jobName: string;
    orderQty: number;
    dispatchedQty: number; // Calculated
    pendingQty: number; // Calculated
    deliveryDate: string;
    status: "Pending" | "Part Dispatch" | "Dispatched";
    originalJob: any; // Keep reference if needed
}

export const columns: ColumnDef<DispatchJobRow>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "jobCardNo",
        header: "Job Card",
        cell: ({ row }) => <div className="font-medium text-xs text-blue-900">{row.getValue("jobCardNo")}</div>,
    },
    {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ row }) => <div className="truncate max-w-[150px] text-xs font-semibold text-slate-700">{row.getValue("clientName")}</div>,
    },
    {
        accessorKey: "jobName",
        header: "Job Name",
        cell: ({ row }) => <div className="truncate max-w-[150px] text-xs font-medium text-slate-600">{row.getValue("jobName")}</div>,
    },
    {
        accessorKey: "orderQty",
        header: ({ column }) => (
            <div className="text-right">Order Qty</div>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-slate-700 text-xs">{row.getValue<number>("orderQty").toLocaleString()}</div>,
    },
    {
        accessorKey: "dispatchedQty",
        header: ({ column }) => (
            <div className="text-right text-green-600">Dispatched</div>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-green-600 text-xs">{row.getValue<number>("dispatchedQty").toLocaleString()}</div>,
    },
    {
        accessorKey: "pendingQty",
        header: ({ column }) => (
            <div className="text-right text-orange-600">Pending</div>
        ),
        cell: ({ row }) => <div className="text-right font-bold text-orange-600 text-xs">{row.getValue<number>("pendingQty").toLocaleString()}</div>,
    },
    {
        accessorKey: "deliveryDate",
        header: "Delivery",
        cell: ({ row }) => <div className="text-xs text-slate-500">{row.getValue("deliveryDate")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            let variant = "secondary" as "secondary" | "default" | "destructive" | "outline";
            let className = "text-xs font-normal";

            if (status === "Dispatched") {
                variant = "default";
                className += " bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
            } else if (status === "Part Dispatch") {
                variant = "secondary";
                className += " bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
            } else {
                className += " bg-orange-50 text-orange-600 border-orange-100";
            }

            return (
                <Badge variant="outline" className={className}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            // Can add row actions later if needed
            return null;
        },
    },
];
