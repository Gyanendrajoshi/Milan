"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StockItem } from "@/types/stock-master";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<StockItem>[] = [
    {
        accessorKey: "itemCode",
        header: "Item Code",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("itemCode")}</div>
    },
    {
        accessorKey: "itemName",
        header: "Item Name",
        cell: ({ row }) => <div className="font-medium text-xs max-w-[200px] truncate" title={row.getValue("itemName")}>{row.getValue("itemName")}</div>
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.getValue("category")}</Badge>
    },
    {
        accessorKey: "batchNo",
        header: "Batch No",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("batchNo")}</div>
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    Qty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const uom = row.original.uom;
            return <div className="font-bold">{row.getValue("quantity")} <span className="text-gray-500 font-normal text-xs">{uom}</span></div>
        }
    },
    {
        accessorKey: "receivedDate",
        header: "Received",
        cell: ({ row }) => <div className="text-xs text-gray-500">{format(new Date(row.getValue("receivedDate")), "dd-MMM-yyyy")}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    className={
                        status === "In-Stock" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                            status === "Reserved" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                "bg-gray-100 text-gray-800"
                    }
                >
                    {status}
                </Badge>
            )
        }
    }
];
