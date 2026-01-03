"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export type IssueRegisterRow = {
    id: string; // Issue ID (MI...)
    issueDate: string;
    jobCardNo?: string;
    department?: string;
    itemName: string;
    batchNo: string;
    issuedQty: number;
    uom: string;
    originalIssueId: string; // For deletion
};

export const getIssueColumns = (onDelete: (id: string) => void): ColumnDef<IssueRegisterRow>[] => [
    {
        accessorKey: "id",
        header: "Issue No",
        cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.id}</span>,
    },
    {
        accessorKey: "issueDate",
        header: "Date",
        cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.issueDate), "dd MMM yyyy")}</span>,
    },
    {
        accessorKey: "jobCardNo",
        header: "Job Card/Dept",
        cell: ({ row }) => <span className="font-semibold text-xs text-primary">{row.original.jobCardNo || row.original.department}</span>,
    },
    {
        accessorKey: "batchNo",
        header: "Batch No",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-mono text-xs">{row.original.batchNo}</span>
                <span className="text-[10px] text-muted-foreground">{row.original.itemName}</span>
            </div>
        ),
    },
    {
        accessorKey: "issuedQty",
        header: "Qnty",
        cell: ({ row }) => <span className="text-xs font-medium">{row.original.issuedQty} {row.original.uom}</span>,
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700"
                onClick={() => onDelete(row.original.originalIssueId)}
                title="Delete Entire Issue Invoice"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        ),
    },
];
