"use client";

import { useState, useEffect, useMemo } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { HSNMaster } from "@/types/hsn-master";
import { getHSNCodes, deleteHSN } from "@/services/api/hsn-service";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { HSNMasterForm } from "@/components/forms/hsn-master-form";
import { toast } from "sonner";

export default function HSNMasterPage() {
  const [data, setData] = useState<HSNMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHSN, setSelectedHSN] = useState<HSNMaster | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const hsnCodes = await getHSNCodes();
      setData(hsnCodes);
    } catch (error) {
      toast.error("Failed to fetch HSN codes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedHSN(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (hsn: HSNMaster) => {
    setSelectedHSN(hsn);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (hsn: HSNMaster) => {
    setSelectedHSN(hsn);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHSN) return;
    try {
      await deleteHSN(selectedHSN.id);
      toast.success("HSN deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete HSN");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedHSN(null);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchData();
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-white">HSN Master</CardTitle>

          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <Button onClick={handleAdd} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
              <Plus className="h-4 w-4 mr-2" /> <span className="inline">Add HSN</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="hsnCode"
              searchValue={globalTerm}
              onSearch={setGlobalSearch}
              placeholder="Search HSN codes..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHSN ? "Edit HSN" : "Add New HSN"}</DialogTitle>
            <DialogDescription>
              {selectedHSN ? "Update the details of the selected HSN code." : "Fill in the details to create a new HSN code."}
            </DialogDescription>
          </DialogHeader>
          <HSNMasterForm
            initialData={selectedHSN}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the HSN code
              &quot;{selectedHSN?.hsnCode} - {selectedHSN?.name}&quot; and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
