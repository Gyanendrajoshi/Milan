"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProcessMaster } from "@/types/process-master";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { MOCK_CHARGE_TYPES } from "@/types/process-master";

interface ColumnsProps {
    onEdit: (data: ProcessMaster) => void;
    onDelete: (data: ProcessMaster) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<ProcessMaster>[] => [
    {
        accessorKey: "code",
        header: "Process Code",
        cell: ({ row }) => <span className="font-semibold text-blue-600">{row.original.code}</span>,
    },
    {
        accessorKey: "name",
        header: "Process Name",
    },
    {
        accessorKey: "chargeType",
        header: "Type of Charges",
        cell: ({ row }) => {
            const value = row.getValue("chargeType");
            const label = MOCK_CHARGE_TYPES.find((t) => t.value === value)?.label || value;
            return label;
        },
    },
    {
        accessorKey: "isUnitConversion",
        header: "Unit Conversion",
        cell: ({ row }) => (row.original.isUnitConversion ? "Yes" : "No"),
    },
    {
        accessorKey: "rate",
        header: "Rate",
        cell: ({ row }) => `${row.original.rate.toFixed(2)}`,
    },
    {
        id: "actions",
        enableColumnFilter: false,
        header: "",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.original)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(row.original)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
