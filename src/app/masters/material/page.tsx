"use client";

import { useState, useEffect, useMemo } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Material } from "@/types/material-master";
import { getMaterials, deleteMaterial } from "@/services/api/material-service";
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
import { MaterialMasterForm } from "@/components/forms/material-master-form";
import { toast } from "sonner";

export default function MaterialMasterPage() {
  const [data, setData] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const materials = await getMaterials();
      setData(materials);
    } catch (error) {
      toast.error("Failed to fetch materials");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedMaterial(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;
    try {
      await deleteMaterial(selectedMaterial.id);
      toast.success("Material deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete material");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);
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
            <CardTitle className="text-xl font-bold text-white">Material Master</CardTitle>

          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <Button onClick={handleAdd} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
              <Plus className="h-4 w-4 mr-2" /> <span className="inline">Add Material</span>
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
              searchKey="itemName"
              searchValue={globalTerm}
              onSearch={setGlobalSearch}
              placeholder="Search materials..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMaterial ? "Edit Material" : "Add New Material"}</DialogTitle>
            <DialogDescription>
              {selectedMaterial ? "Update the details of the selected material." : "Fill in the details to create a new material."}
            </DialogDescription>
          </DialogHeader>
          <MaterialMasterForm
            initialData={selectedMaterial}
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
              This action cannot be undone. This will permanently delete the material
              &quot;{selectedMaterial?.itemName}&quot; and remove your data from our servers.
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
