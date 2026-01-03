"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CategoryMaster } from "@/types/category-master"
import { Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProcessMaster } from "@/types/process-master"

interface ColumnsProps {
    onEdit: (data: CategoryMaster) => void
    onDelete: (data: CategoryMaster) => void
    processes?: ProcessMaster[]
}

export const getColumns = ({ onEdit, onDelete, processes = [] }: ColumnsProps): ColumnDef<CategoryMaster>[] => [
    {
        id: "name",
        accessorFn: (row) => row.name || (row as any).categoryName,
        header: "Name",
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.getValue("name")}</span>,
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <span className="text-muted-foreground truncate max-w-[300px] block" title={row.getValue("description") as string}>{row.getValue("description") || "-"}</span>,
    },
    {
        accessorKey: "processIds",
        header: "Processes",
        cell: ({ row }) => {
            const processIds = row.original.processIds || [];
            // Fallback for legacy data
            if (processIds.length === 0 && row.original.processId) {
                processIds.push(row.original.processId);
            }

            const processNames = processIds.map(id =>
                processes.find(p => p.id === id)?.name || "Unknown"
            );

            return (
                <div className="flex flex-wrap gap-1">
                    {processNames.length > 0 ? (
                        processNames.map((name, index) => (
                            <span key={index} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                {name}
                            </span>
                        ))
                    ) : (
                        <span className="text-muted-foreground/70 text-xs italic">No processes</span>
                    )}
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const category = row.original
            return (
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(category)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
