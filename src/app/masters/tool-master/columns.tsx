"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ToolMaster } from "@/types/tool-master"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnsProps {
    onEdit: (data: ToolMaster) => void
    onDelete: (data: ToolMaster) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<ToolMaster>[] => [
    {
        accessorKey: "toolPrefix",
        header: "Tool Type",
    },
    {
        accessorKey: "toolNo",
        header: "Tool No",
    },
    {
        accessorKey: "toolName",
        header: "Name",
        cell: ({ row }) => <span className="font-semibold text-gray-900">{row.getValue("toolName")}</span>,
    },
    {
        accessorKey: "toolRefCode",
        header: "Ref Code",
    },
    {
        accessorKey: "jobSize",
        header: "Job Size",
        cell: ({ row }) => row.original.jobSize || "-",
    },
    {
        accessorKey: "acrossUps",
        header: "Across Ups",
        cell: ({ row }) => row.original.acrossUps || "-",
    },
    {
        accessorKey: "aroundUps",
        header: "Around Ups",
        cell: ({ row }) => row.original.aroundUps || "-",
    },
    {
        accessorKey: "acrossGap",
        header: "Across Gap",
        cell: ({ row }) => row.original.acrossGap || "-",
    },
    {
        accessorKey: "aroundGap",
        header: "Around Gap",
        cell: ({ row }) => row.original.aroundGap || "-",
    },
    {
        accessorKey: "noOfTeeth",
        header: "Teeth",
    },
    {
        accessorKey: "circumferenceMM",
        header: "Circ. (mm)",
    },
    {
        accessorKey: "circumferenceInch",
        header: "Circ. (Inch)",
        cell: ({ row }) => row.original.circumferenceInch || "-",
    },
    {
        accessorKey: "hsnCode",
        header: "HSN Code",
        cell: ({ row }) => <span className="text-blue-600 font-medium">{row.getValue("hsnCode") || "-"}</span>,
    },
    {
        accessorKey: "purchaseUnit",
        header: "Unit",
        cell: ({ row }) => row.original.purchaseUnit || "-",
    },
    {
        accessorKey: "purchaseRate",
        header: "Rate",
        cell: ({ row }) => `₹${row.original.purchaseRate?.toFixed(2) || "0.00"}`,
    },


    {
        accessorKey: "toolDescription",
        header: "Description",
        cell: ({ row }) => <span className="text-gray-600 truncate max-w-[200px] block" title={row.getValue("toolDescription") as string}>{row.getValue("toolDescription") || "-"}</span>,
    },
    {
        id: "actions",
        enableColumnFilter: false,
        header: "Actions",
        cell: ({ row }) => {
            const tool = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(tool)}
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(tool)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
