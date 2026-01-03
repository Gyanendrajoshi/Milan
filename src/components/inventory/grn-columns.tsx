"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GRN } from "@/types/grn-master"; // Assuming type exists or I need to check mocking
// If GRN type doesn't support flattened items, we might need a FlattenedGRNItem type if the table shows ITEMS, not just GRN headers.
// The image shows multiple rows for what looks like items, but they share PO Info. 
// Actually, the image shows "PO00019/25-26" and items. It looks like a line-item level table, or a grouped table?
// All rows have "PO INFO", "SUPPLIER".
// It seems to be a flattened list of GRN Items with their parent GRN Details.
// Let's assume we are displaying "GRN Items" joined with "GRN Header" info.

export interface GRNFlatItem {
    id: string; // Item ID or composite
    grnId: string;
    grnNo: string;
    grnDate: string;
    poNumber: string;
    poDate: string;
    supplierName: string;
    itemCode: string;
    itemName: string;
    group: string; // e.g., Paper
    uom: string;
    receivedQty: number;
    receivedKg?: number; // Optional based on image showing "49.9 Kg"
    batchNo: string;
    expiryDate?: string;
    challanNo: string;
    challanDate: string;
    receivedBy: string;
}

interface GRNColumnActions {
    onPrint: (grnId: string) => void;
    onPrintBarcode: (grnId: string) => void;
    onDelete: (grnId: string) => void;
}

export const getGRNColumns = ({ onPrint, onPrintBarcode, onDelete }: GRNColumnActions): ColumnDef<GRNFlatItem>[] => [
    {
        accessorKey: "grnInfo",
        header: ({ column }) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-blue-600">GRN Info</span>
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-xs">{row.original.grnNo}</span>
                <span className="text-[10px] text-gray-500">{format(new Date(row.original.grnDate), "dd-MMM-yy")}</span>
            </div>
        ),
    },
    {
        accessorKey: "poInfo",
        header: ({ column }) => (
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-blue-600">PO Info</span>
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-xs">{row.original.poNumber}</span>
                <span className="text-[10px] text-gray-500">{format(new Date(row.original.poDate), "dd-MMM-yy")}</span>
            </div>
        ),
    },
    {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => <span className="text-xs font-medium text-gray-700">{row.original.supplierName}</span>,
    },
    {
        accessorKey: "group",
        header: "Group",
        cell: ({ row }) => <span className="text-xs text-gray-500">{row.original.group}</span>,
    },
    {
        accessorKey: "itemDetails",
        header: "Item Details",
        cell: ({ row }) => (
            <div className="flex flex-col max-w-[250px]">
                <span className="text-xs font-medium text-gray-900 truncate" title={row.original.itemName}>{row.original.itemName}</span>
                <span className="text-[10px] text-gray-500 font-mono">{row.original.itemCode}</span>
            </div>
        ),
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
            <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-blue-600">{row.original.receivedQty}</span>
                    <span className="text-[10px] text-gray-500">{row.original.uom}</span>
                </div>
                {row.original.receivedKg && (
                    <span className="text-[10px] text-gray-400">Wt: {row.original.receivedKg} Kg</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "batchInfo",
        header: "Batch / Expiry",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700">{row.original.batchNo}</span>
                {row.original.expiryDate && (
                    <span className="text-[10px] text-gray-500">EXP: {format(new Date(row.original.expiryDate), "MM/yyyy")}</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "challanInfo",
        header: "Challan",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-xs text-gray-700">{row.original.challanNo}</span>
                <span className="text-[10px] text-gray-500">{format(new Date(row.original.challanDate), "dd-MMM-yy")}</span>
            </div>
        ),
    },
    {
        accessorKey: "receivedBy",
        header: "Rec By",
        cell: ({ row }) => <span className="text-xs text-center block text-gray-600">{row.original.receivedBy}</span>,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onPrint(row.original.grnId)} // Use GRN ID
                    title="Print Document"
                >
                    <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => onPrintBarcode(row.original.grnId)}
                    title="Print Stickers"
                >
                    <span className="text-lg leading-none">≣</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(row.original.grnId)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        ),
    },
];
