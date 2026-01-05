"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ToolMaster } from "../../types/tool-master";
import { getTools } from "@/services/api/tool-service";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface ToolSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (tool: ToolMaster) => void;
    typeFilter?: string;
}

export function ToolSelectionDialog({ open, onOpenChange, onSelect, typeFilter }: ToolSelectionDialogProps) {
    const [tools, setTools] = useState<ToolMaster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load tools from localStorage - Load whenever dialog opens
    useEffect(() => {
        if (open) {
            const loadTools = async () => {
                setIsLoading(true);
                const data = await getTools();
                console.log("Tool Dialog: Loaded tools count:", data.length);
                setTools(data);
                setIsLoading(false);
            };
            loadTools();
        }
    }, [open]);
    const columns: ColumnDef<ToolMaster>[] = useMemo(() => {
        const defaultCols: ColumnDef<ToolMaster>[] = [
            {
                accessorKey: "toolNo",
                header: "Tool No",
            },
            {
                accessorKey: "toolName",
                header: "Tool Name",
            },
            {
                accessorKey: "noOfTeeth",
                header: "Teeth",
            },
            {
                accessorKey: "circumferenceMM",
                header: "Circum.(mm)",
            },
            {
                accessorKey: "toolRefCode",
                header: "Ref Code",
            },
        ];

        // Custom columns for Flexo Die (or others if needed)
        if (typeFilter === "FLEXO DIE") {
            const dieCols: ColumnDef<ToolMaster>[] = [
                {
                    accessorKey: "toolNo",
                    header: "Tool No",
                },
                {
                    accessorKey: "toolName",
                    header: "Tool Name",
                },
                {
                    accessorKey: "toolRefCode",
                    header: "Ref Code",
                },
            ];
            // Add select button
            dieCols.push({
                id: "select",
                header: "",
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        variant="gradient-blue"
                        className="border-0"
                        onClick={() => {
                            onSelect(row.original);
                            onOpenChange(false);
                        }}
                    >
                        Select
                    </Button>
                ),
                enableSorting: false,
                enableHiding: false,
            });
            return dieCols;
        }

        // Add select button to default
        defaultCols.push({
            id: "select",
            header: "",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="gradient-blue"
                    className="border-0"
                    onClick={() => {
                        onSelect(row.original);
                        onOpenChange(false);
                    }}
                >
                    Select
                </Button>
            ),
            enableSorting: false,
            enableHiding: false,
        });

        return defaultCols;
    }, [onSelect, onOpenChange, typeFilter]);

    const filteredData = useMemo(() => {
        if (!typeFilter) return tools;
        return tools.filter((t: ToolMaster) => t.toolPrefix === typeFilter);
    }, [typeFilter, tools]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[60vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white">
                    <DialogTitle className="text-white">Select Tool {typeFilter ? `(${typeFilter})` : ""} [{tools.length}]</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-6 pt-2 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        </div>
                    ) : null}
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="toolName"
                        hideToolbar={true}
                        hidePagination={true}
                        disableResponsive={true}
                    />
                </div>
                <DialogFooter className="p-6 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
