"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { UserMaster } from "@/types/user-master";
import { getUserMasterList, saveUserMaster, deleteUserMaster } from "@/services/api/user-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { UserMasterForm } from "@/components/forms/user-master-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UserMasterPage() {
    const [data, setData] = useState<UserMaster[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UserMaster | undefined>(undefined);

    const loadData = async () => {
        const users = await getUserMasterList();
        setData(users);
    };

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setEditingItem(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (user: UserMaster) => {
        setEditingItem(user);
        setIsDialogOpen(true);
    };

    const handleDelete = async (user: UserMaster) => {
        if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
            try {
                await deleteUserMaster(user.id);
                loadData();
                toast.success("User deleted successfully");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete user");
            }
        }
    };

    const handleSuccess = async (values: any) => {
        try {
            await saveUserMaster({ ...values, id: editingItem?.id });
            loadData();
            setIsDialogOpen(false);
            toast.success(editingItem ? "User updated successfully" : "User created successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save user");
        }
    };

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    }), [handleEdit, handleDelete]);

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
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                    <CardTitle className="text-xl font-bold text-white">User Master</CardTitle>
                    <Button
                        onClick={handleAdd}
                        className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0 w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" /> <span className="inline">Add User</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="name"
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search users..."
                    />
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-full max-w-full h-full md:h-[90vh] md:max-w-4xl p-0 overflow-hidden flex flex-col bg-slate-50 gap-0">
                    <DialogHeader className="px-6 py-4 border-b bg-white">
                        <DialogTitle>{editingItem ? "Edit User" : "Create New User"}</DialogTitle>
                    </DialogHeader>
                    <UserMasterForm
                        initialData={editingItem}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
