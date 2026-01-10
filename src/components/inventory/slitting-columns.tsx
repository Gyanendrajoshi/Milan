"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, QrCode } from "lucide-react";

export type SlittingRegisterRow = {
    id: string;                 // Slitting Job ID (SL...)
    slittingDate: string;
    inputBatch: string;
    inputWidth: number;
    itemName: string;           // Item Name
    outputBatch: string;
    outputWidth: number;
    outputRM: number;
    outputKg: number;
    gsm: number;
    wastageKg?: number;         // Only shown on first row
    outputIndex: number;        // Which output (1, 2, 3...)
    totalOutputs: number;       // Total number of outputs
    originalJobId: string;      // For deletion
    qrCodeData?: string;        // QR code data for printing
};

export const getSlittingColumns = (
    onDelete: (id: string) => void,
    onPrintQR?: (id: string) => void
): ColumnDef<SlittingRegisterRow>[] => [
    {
        accessorKey: "id",
        header: "Slitting No",
        cell: ({ row }) => {
            const isFirstRow = row.original.outputIndex === 1;
            return (
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold">{row.original.id}</span>
                    {isFirstRow && row.original.totalOutputs > 1 && (
                        <span className="text-[10px] text-muted-foreground">
                            ({row.original.totalOutputs} outputs)
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "slittingDate",
        header: "Date",
        cell: ({ row }) => (
            <span className="text-xs">
                {format(new Date(row.original.slittingDate), "dd MMM yyyy")}
            </span>
        ),
    },
    {
        accessorKey: "inputBatch",
        header: "Input Roll",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-medium">{row.original.inputBatch}</span>
                <span className="text-[10px] text-muted-foreground">
                    {row.original.inputWidth}mm
                </span>
            </div>
        ),
    },
    {
        accessorKey: "itemName",
        header: "Item Name",
        cell: ({ row }) => (
            <span className="text-xs">{row.original.itemName}</span>
        ),
    },
    {
        accessorKey: "outputBatch",
        header: "Output Roll",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-medium text-blue-600">
                    {row.original.outputBatch}
                </span>
                <span className="text-[10px] text-muted-foreground">
                    Part {row.original.outputIndex}/{row.original.totalOutputs}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "outputWidth",
        header: "Width",
        cell: ({ row }) => (
            <span className="text-xs font-medium">{row.original.outputWidth} mm</span>
        ),
    },
    {
        accessorKey: "outputRM",
        header: "RM",
        cell: ({ row }) => (
            <span className="text-xs">{row.original.outputRM.toFixed(2)} m</span>
        ),
    },
    {
        accessorKey: "outputKg",
        header: "Weight",
        cell: ({ row }) => (
            <span className="text-xs font-medium">{row.original.outputKg.toFixed(2)} Kg</span>
        ),
    },
    {
        accessorKey: "gsm",
        header: "GSM",
        cell: ({ row }) => (
            <span className="text-xs">{row.original.gsm}</span>
        ),
    },
    {
        accessorKey: "wastageKg",
        header: "Wastage",
        cell: ({ row }) => {
            if (row.original.wastageKg === undefined) return null;
            const wastage = row.original.wastageKg;
            return (
                <span className={`text-xs font-medium ${wastage > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {wastage > 0 ? `+${wastage.toFixed(2)}` : wastage.toFixed(2)} Kg
                </span>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            // Only show actions on first row
            if (row.original.outputIndex !== 1) return null;
            return (
                <div className="flex items-center gap-2">
                    {onPrintQR && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            onClick={() => onPrintQR(row.original.originalJobId)}
                            title="Print QR Codes"
                        >
                            <QrCode className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => onDelete(row.original.originalJobId)}
                        title="Delete Slitting Job"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
