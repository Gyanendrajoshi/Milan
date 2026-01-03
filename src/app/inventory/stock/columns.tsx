"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StockItem } from "@/types/stock";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<StockItem>[] = [
    {
        accessorKey: "itemCode",
        header: "Item Code",
        cell: ({ row }) => <span className="font-bold text-xs text-gray-700">{row.getValue("itemCode")}</span>,
    },
    {
        accessorKey: "itemName",
        header: "Item Name",
        cell: ({ row }) => <span className="text-xs text-gray-600 font-medium">{row.getValue("itemName")}</span>,
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => <span className="text-xs text-center block w-full text-gray-500">{row.getValue("size")}</span>,
    },
    {
        accessorKey: "gsm",
        header: "GSM",
        cell: ({ row }) => <span className="text-xs text-center block w-full text-gray-500">{row.getValue("gsm") || "-"}</span>,
    },
    {
        accessorKey: "uom",
        header: "Unit",
        cell: ({ row }) => <span className="text-[10px] uppercase font-bold text-gray-400 text-center block w-full">{row.getValue("uom")}</span>,
    },
    {
        accessorKey: "stockQty",
        header: () => <div className="text-right">Stock</div>,
        cell: ({ row }) => {
            const qty = parseFloat(row.getValue("stockQty"));
            return <div className="text-right font-bold text-blue-600 text-xs">{qty.toFixed(2)}</div>;
        },
    },
    {
        accessorKey: "autoBatchNo",
        header: "Auto Batch No",
        cell: ({ row }) => <span className="text-[10px] font-mono bg-gray-50 px-1 py-0.5 rounded text-gray-600 border border-gray-100">{row.getValue("autoBatchNo")}</span>,
    },
    {
        accessorKey: "supplierBatchNo",
        header: "Batch No",
        cell: ({ row }) => <span className="text-xs text-gray-500">{row.getValue("supplierBatchNo")}</span>,
    },
    {
        accessorKey: "receiptDate",
        header: "Receipt Date",
        cell: ({ row }) => <span className="text-xs text-gray-500 whitespace-nowrap">{format(new Date(row.getValue("receiptDate")), "dd-MMM-yyyy")}</span>,
    },
    {
        accessorKey: "expiryDate",
        header: "Expiry Date",
        cell: ({ row }) => {
            const dateStr = row.getValue("expiryDate") as string;
            if (!dateStr) return <span className="text-[10px] text-gray-300">-</span>;
            const date = new Date(dateStr);
            const isExpired = new Date() > date;
            return (
                <span className={`text-xs whitespace-nowrap ${isExpired ? "text-red-500 font-bold" : "text-gray-500"}`}>
                    {format(date, "dd-MMM-yyyy")}
                </span>
            );
        },
    },
    {
        accessorKey: "agingDays",
        header: () => <div className="text-right">Aging</div>,
        cell: ({ row }) => {
            const days = row.getValue("agingDays") as number;
            let colorClass = "text-gray-600";
            if (days > 90) colorClass = "text-orange-500";
            if (days > 180) colorClass = "text-red-500 font-bold";

            return <div className={`text-right text-xs ${colorClass}`}>{days} Days</div>;
        },
    },
    // Location placeholder if needed, relying on data or static for now
];
