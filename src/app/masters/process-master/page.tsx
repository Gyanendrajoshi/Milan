"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { ProcessMasterForm } from "@/components/forms/process-master-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProcessMaster } from "@/types/process-master";
import { getProcessMasterList, deleteProcess } from "@/services/api/process-service";
import { toast } from "sonner";

export default function ProcessMasterPage() {
    const [data, setData] = useState<ProcessMaster[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProcessMaster | null>(null);

    // Load data from localStorage via API service
    useEffect(() => {
        const loadData = async () => {
            const processes = await getProcessMasterList();
            setData(processes);
        };
        loadData();
    }, []);

    const refreshData = async () => {
        const processes = await getProcessMasterList();
        setData(processes);
    };

    const generateNextCode = (currentData: ProcessMaster[]) => {
        if (currentData.length === 0) return "PM00001";
        const lastCode = currentData[currentData.length - 1].code;
        const numberPart = parseInt(lastCode.replace("PM", ""), 10);
        const nextNumber = numberPart + 1;
        return `PM${nextNumber.toString().padStart(5, "0")}`;
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: ProcessMaster) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = async (item: ProcessMaster) => {
        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            try {
                await deleteProcess(item.id);
                toast.success("Process deleted successfully");
                refreshData();
            } catch (error) {
                toast.error("Failed to delete process");
                console.error(error);
            }
        }
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        refreshData();
        toast.success(editingItem ? "Process updated successfully" : "Process added successfully");
    };

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    }), []);

    const {
        filteredData,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(data, columns, {
        globalSearch: true,
        debounceMs: 300
    });

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">Process Master</CardTitle>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2">
                        <Button onClick={handleAdd} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
                            <Plus className="h-4 w-4 mr-2" /> <span className="inline">Add Process</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="name"
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search processes..."
                    />
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Process" : "Add Process"}</DialogTitle>
                    </DialogHeader>
                    <ProcessMasterForm
                        initialData={editingItem || undefined}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
