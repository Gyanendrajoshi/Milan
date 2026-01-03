"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GRN } from "@/types/grn-master";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ColumnProps {
    onView: (grn: GRN) => void;
}

export const getColumns = ({ onView }: ColumnProps): ColumnDef<GRN>[] => [
    {
        accessorKey: "grnNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 hover:bg-transparent"
                >
                    GRN No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-bold text-primary">{row.getValue("grnNumber")}</div>,
    },
    {
        accessorKey: "grnDate",
        header: "Date",
        cell: ({ row }) => <div>{format(new Date(row.getValue("grnDate")), "dd-MMM-yyyy")}</div>,
    },
    {
        accessorKey: "supplierName",
        header: "Supplier",
    },
    {
        accessorKey: "supplierChallanNo",
        header: "Challan No",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.getValue("status") === "Draft" ? "secondary" : "default"} className="text-[10px]">
                {row.getValue("status")}
            </Badge>
        )
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const grn = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => onView(grn)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
