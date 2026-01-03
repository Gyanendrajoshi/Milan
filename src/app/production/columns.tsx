"use strict";

import { ColumnDef } from "@tanstack/react-table";
import { ProductionEntry } from "@/types/production";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export const columns: ColumnDef<ProductionEntry>[] = [
    {
        accessorKey: "jobCardNo",
        header: "Job Card",
        cell: ({ row }) => {
            const dateStr = row.original.createdAt;
            const displayDate = dateStr ? new Date(dateStr).toLocaleDateString() : "N/A";
            return (
                <div>
                    <div className="font-bold text-blue-600">{row.original.jobCardNo || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{displayDate}</div>
                </div>
            );
        }
    },
    {
        accessorKey: "jobName",
        header: "Job Name",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.jobName || "Unnamed Job"}</div>
                <div className="text-xs text-muted-foreground">{row.original.clientName || "Unknown Client"}</div>
            </div>
        )
    },
    {
        accessorKey: "orderQty",
        header: "Order Qty",
        cell: ({ row }) => (
            <div className="font-bold font-mono text-blue-700">
                {(row.original.orderQty || 0).toLocaleString()}
            </div>
        )
    },
    {
        accessorKey: "deliveryDate",
        header: "Delivery",
        cell: ({ row }) => {
            try {
                return row.original.deliveryDate ? new Date(row.original.deliveryDate).toLocaleDateString() : "-";
            } catch (e) { return "-"; }
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let theme = "bg-gray-100 text-gray-600 border-gray-200";
            if (status === 'In Production') theme = "bg-amber-50 text-amber-600 border-amber-200";
            if (status === 'Completed') theme = "bg-green-50 text-green-600 border-green-200";

            return <Badge variant="outline" className={theme}>{status}</Badge>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const isCompleted = row.original.status === 'Completed' || (row.original.status as string) === 'Dispatched';

            return (
                <div className="flex justify-end">
                    <Link href={`./production/${row.original.jobId}`}>
                        <Button
                            size="sm"
                            className={isCompleted
                                ? "h-8 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                : "h-8 bg-theme-gradient-r text-white shadow-sm hover:opacity-90"
                            }
                        >
                            {isCompleted ? "View" : (
                                <>
                                    <Settings className="mr-2 h-3.5 w-3.5" />
                                    Production
                                </>
                            )}
                        </Button>
                    </Link>
                </div>
            );
        }
    }
];
