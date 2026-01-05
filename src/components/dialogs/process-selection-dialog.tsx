"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getProcessMasterList } from "@/services/api/process-service";
import { DataTable } from "@/components/ui/data-table";
import { ProcessMaster } from "@/types/process-master";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";

interface ProcessSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (selectedIds: string[]) => void;
    preSelectedIds?: string[];
}

const EMPTY_ARRAY: string[] = [];

export function ProcessSelectionDialog({ open, onOpenChange, onSelect, preSelectedIds = EMPTY_ARRAY }: ProcessSelectionDialogProps) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [processes, setProcesses] = useState<ProcessMaster[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load processes from localStorage - Load whenever dialog opens
    useEffect(() => {
        if (open) {
            const loadProcesses = async () => {
                setIsLoading(true);
                const data = await getProcessMasterList();
                console.log("Process Dialog: Loaded processes count:", data.length);
                setProcesses(data);
                setIsLoading(false);
            };
            loadProcesses();
        }
    }, [open]);

    // Sync pre-selected IDs when dialog opens
    useEffect(() => {
        if (open) {
            const initialSelection: RowSelectionState = {};
            preSelectedIds.forEach(id => {
                initialSelection[id] = true;
            });
            setRowSelection(initialSelection);
        }
    }, [open, preSelectedIds]);

    const handleConfirm = () => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
        onSelect(selectedIds);
        onOpenChange(false);
    };

    const columns: ColumnDef<ProcessMaster>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "name",
            header: "Process Name",
        },
        {
            accessorKey: "chargeType",
            header: "Type",
        },
        {
            accessorKey: "rate",
            header: "Rate",
        },
    ], []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[60vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white">
                    <DialogTitle className="text-white">Select Processes [{processes.length}]</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden p-6 pt-2 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        </div>
                    ) : null}
                    <DataTable
                        columns={columns}
                        data={processes}
                        searchKey="name"
                        enableRowSelection={true}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        hideToolbar={true}
                        hidePagination={true}
                        disableResponsive={true}
                        getRowId={(row) => row.id}
                    />
                </div>
                <DialogFooter className="p-6 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="gradient-blue" onClick={handleConfirm}>Confirm Selection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
