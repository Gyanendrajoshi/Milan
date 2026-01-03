"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingItem } from "./pending-po-list";
import { toast } from "sonner";

interface GetColumnsProps {
    onForceClose: (id: string) => void;
    validateSelection: (item: PendingItem) => boolean;
}

export const getColumns = ({ onForceClose, validateSelection }: GetColumnsProps): ColumnDef<PendingItem>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => {
                    // "Select All" logic with validation could be tricky here because we need to know IF we can select all.
                    // For now, we'll let the standard behavior try to select all, and the row-level validation (if we implemented it via state interception) would catch it.
                    // But wait, header "Select All" selects all rows in the view.
                    // We should probably rely on the listener in the parent component to filter out invalid selections if "Select All" is clicked.
                    // OR, custom logic here:
                    table.toggleAllPageRowsSelected(!!value);
                }}
                aria-label="Select all"
                className="border-gray-400"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                    if (value) {
                        // Trying to select
                        if (!validateSelection(row.original)) {
                            // Validation failed (toast already shown in validator usually, or we show here)
                            // returning here prevents the toggle
                            return;
                        }
                    }
                    row.toggleSelected(!!value);
                }}
                aria-label="Select row"
                className="border-gray-300"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: "poNumber",
        header: "PO No",
        cell: ({ row }) => <span className="font-medium text-blue-600 text-xs">{row.getValue("poNumber")}</span>,
    },
    {
        accessorKey: "poDate",
        header: "PO Date",
        cell: ({ row }) => <span className="text-xs text-gray-500">{format(new Date(row.getValue("poDate")), "dd-MMM-yy")}</span>,
    },
    {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => <span className="text-xs font-medium text-gray-700">{row.getValue("supplierName")}</span>,
    },
    {
        id: "group",
        header: "Group",
        accessorFn: (row) => row.group === "Paper" ? "Roll" : row.group,
        cell: ({ row }) => <span className="text-xs text-gray-500">{row.getValue("group")}</span>,
    },
    {
        accessorKey: "itemCode",
        header: "Item Code",
        cell: ({ row }) => <span className="text-xs font-mono text-gray-600">{row.getValue("itemCode")}</span>,
    },
    {
        accessorKey: "itemName",
        header: "Item Details",
        cell: ({ row }) => <span className="text-xs text-gray-700 truncate max-w-[250px] block" title={row.getValue("itemName")}>{row.getValue("itemName")}</span>,
    },
    {
        accessorKey: "uom",
        header: ({ column }) => <div className="text-center">Unit</div>,
        cell: ({ row }) => <div className="text-xs text-gray-500 text-center">{row.getValue("uom")}</div>,
    },
    {
        accessorKey: "orderedQty",
        header: ({ column }) => <div className="text-right">Ordered</div>,
        cell: ({ row }) => <div className="text-right text-xs font-medium">{row.getValue("orderedQty")}</div>,
    },
    {
        accessorKey: "receivedQty",
        header: ({ column }) => <div className="text-right">Received</div>,
        cell: ({ row }) => <div className="text-right text-xs text-gray-500">{row.getValue("receivedQty")}</div>,
    },
    {
        accessorKey: "pendingQty",
        header: ({ column }) => <div className="text-right">Pending</div>,
        cell: ({ row }) => <div className="text-right text-xs font-bold text-blue-600">{row.getValue("pendingQty")}</div>,
    },
    {
        id: "actions",
        header: ({ column }) => <div className="text-center">Action</div>,
        cell: ({ row }) => (
            <div className="text-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onForceClose(row.original.id)}
                    className="h-6 text-[10px] text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                    Force Close
                </Button>
            </div>
        ),
    },
];
