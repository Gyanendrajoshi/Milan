"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DispatchEntry } from "@/services/dispatch-storage";
import { format } from "date-fns";
import { Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const historyColumns: ColumnDef<DispatchEntry>[] = [
    {
        accessorKey: "challanNo",
        header: "Challan #",
        cell: ({ row }) => <div className="font-mono text-xs font-bold text-blue-800">{row.getValue("challanNo")}</div>,
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <div className="text-xs text-slate-600">{row.getValue("date")}</div>,
    },
    {
        accessorKey: "items", // Virtual accessor
        header: "Client",
        cell: ({ row }) => {
            const items = row.original.items;
            const clientName = items.length > 0 ? items[0].clientName : "Unknown";
            return <div className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{clientName}</div>;
        }
    },
    {
        id: "jobCount",
        header: "Jobs",
        cell: ({ row }) => <div className="text-xs text-center font-medium bg-slate-100 rounded px-1.5 py-0.5 w-fit">{row.original.items.length}</div>,
    },
    {
        id: "totalQty",
        header: ({ column }) => <div className="text-right">Total Qty</div>,
        cell: ({ row }) => {
            const total = row.original.items.reduce((s, i) => s + (i.dispatchQty || 0), 0);
            return <div className="text-right font-bold text-xs text-green-700">{total.toLocaleString()}</div>;
        }
    },
    {
        accessorKey: "vehicleNo",
        header: "Vehicle",
        cell: ({ row }) => <div className="text-xs text-slate-500 uppercase">{row.getValue("vehicleNo") || "-"}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] font-normal">
                {row.getValue("status")}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                    <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                    <Printer className="w-3.5 h-3.5" />
                </Button>
            </div>
        )
    }
];
