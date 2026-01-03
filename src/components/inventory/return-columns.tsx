"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ReturnRegisterRow = {
    id: string; // Return ID (MR...)
    returnDate: string;
    issueId: string; // MI...
    issueDate: string; // For display below Issue ID
    jobCardNo?: string;
    department?: string;
    itemCode: string;
    itemName: string;
    batchNo: string;
    issuedQty: number;
    returnedQty: number;
    uom: string;
    rollWidth?: number;
    gsm?: number;
    qualityStatus?: string;
    returnReason?: string;
    originalReturnId: string; // For deletion
};

export const getReturnColumns = (onDelete: (id: string) => void): ColumnDef<ReturnRegisterRow>[] => [
    {
        accessorKey: "issueId",
        header: "ISSUE NUMBER",
        cell: ({ row }) => (
            <div className="space-y-0.5">
                <div className="font-mono text-xs font-bold text-primary">
                    {row.original.issueId}
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {format(new Date(row.original.issueDate), 'dd MMM yyyy')}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "itemDetails",
        header: "ITEM DETAILS",
        cell: ({ row }) => (
            <div className="space-y-0.5 max-w-[280px]">
                <div className="text-xs font-medium text-foreground">
                    {row.original.itemName}
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {row.original.itemCode}
                    {row.original.rollWidth && row.original.gsm &&
                        ` • ${row.original.rollWidth}mm × ${row.original.gsm} GSM`
                    }
                </div>
            </div>
        ),
    },
    {
        accessorKey: "clientSource",
        header: "CLIENT / SOURCE",
        cell: ({ row }) => (
            <div className="space-y-0.5">
                <div className="text-xs font-medium text-foreground">
                    {row.original.jobCardNo || row.original.department || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                    {row.original.jobCardNo ? 'Job Card' : 'Department'}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "batchNo",
        header: "BATCH",
        cell: ({ row }) => (
            <div className="font-mono text-xs text-foreground">
                {row.original.batchNo}
            </div>
        ),
    },
    {
        accessorKey: "issuedQty",
        header: "ISSUED QTY",
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground">
                {row.original.issuedQty.toLocaleString()} {row.original.uom}
            </div>
        ),
    },
    {
        accessorKey: "returnedQty",
        header: "RETURNED QTY",
        cell: ({ row }) => (
            <div className="text-xs font-bold text-green-600">
                {row.original.returnedQty.toLocaleString()} {row.original.uom}
            </div>
        ),
    },
    {
        accessorKey: "qualityStatus",
        header: "QUALITY STATUS",
        cell: ({ row }) => {
            const status = row.original.qualityStatus;
            const variant =
                status === 'OK' ? 'default' :
                    status === 'DAMAGED' ? 'destructive' :
                        'secondary';

            return (
                <Badge variant={variant} className="text-[10px]">
                    {status || 'OK'}
                </Badge>
            );
        },
    },
    {
        accessorKey: "returnReason",
        header: "RETURN REASON",
        cell: ({ row }) => (
            <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                {row.original.returnReason || '-'}
            </div>
        ),
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(row.original.originalReturnId)}
                title="Delete Return"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        ),
    },
];
