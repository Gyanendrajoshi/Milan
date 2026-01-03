"use client";

import { useState, useEffect, useMemo } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { RollMaster } from "@/types/roll-master";
import { getRolls, deleteRoll } from "@/services/api/roll-service";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RollMasterForm } from "@/components/forms/roll-master-form";
import { toast } from "sonner";
import { mockPurchaseOrders } from "@/services/mock-data/purchase-orders";

export default function RollMasterPage() {
  const [data, setData] = useState<RollMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoll, setEditingRoll] = useState<RollMaster | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const rolls = await getRolls();
      setData(rolls);
    } catch (error) {
      toast.error("Failed to fetch rolls");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingRoll(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (roll: RollMaster) => {
    setEditingRoll(roll);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (roll: RollMaster) => {
    setEditingRoll(roll); // Use editingRoll for deletion context
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingRoll) return;

    // Referential Integrity Check
    // Check if this roll is used in any Purchase Order (Open or Closed)
    const isUsedInPO = mockPurchaseOrders.some(po =>
      po.items.some(item => item.itemCode === editingRoll.itemCode)
    );

    if (isUsedInPO) {
      toast.error("Cannot delete Roll", {
        description: `This roll is used in existing Purchase Orders. Please remove it from POs first.`
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteRoll(editingRoll.id);
      toast.success("Roll deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete roll");
    } finally {
      setIsDeleteDialogOpen(false);
      setEditingRoll(null);
    }
  };

  const handleSuccess = () => { // Renamed from handleFormSuccess
    setIsDialogOpen(false);
    setEditingRoll(null);
    // In a real app with SWR/TanStack Query, we would invalidate cache here.
    // Since we are using mock data that updates in place, we might need to force re-render or refetch if we were fetching.
    // For now, if getRolls was SWR, it would auto update. With simple useEffect, we might need to refetch.
    // Let's add a simple refetch trigger or just rely on state update if data was state.
    // Actually our Page component fetches on mount. To refresh, we can reload or add a refresh trigger.
    // For this demo, let's just reload the list.
    fetchData(); // Changed from window.location.reload() to fetchData() for better UX
  };

  const columns = useMemo(() => getColumns({
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-6 py-2 rounded-none">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-white">Roll Master</CardTitle>

          </div>
          <div className="flex items-center justify-end space-x-4">
            <Button onClick={handleAdd} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
              <Plus className="mr-2 h-4 w-4" /> Add Roll
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="quality"
              searchValue={globalTerm}
              onSearch={setGlobalSearch}
              placeholder="Search rolls..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoll ? "Edit Roll" : "Add New Roll"}
            </DialogTitle>
            <DialogDescription>
              {editingRoll
                ? "Update the details of the selected roll."
                : "Fill in the details to create a new roll."}
            </DialogDescription>
          </DialogHeader>
          <RollMasterForm
            initialData={editingRoll}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the roll
              &quot;{editingRoll?.itemName}&quot; and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
