"use client";

import { useState, useEffect, useMemo } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { ToolMaster } from "@/types/tool-master";
import { getTools, deleteTool } from "@/services/api/tool-service";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { ToolMasterForm } from "@/components/forms/tool-master-form";
import { toast } from "sonner";

export default function ToolMasterPage() {
  const [data, setData] = useState<ToolMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolMaster | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const tools = await getTools();
      setData(tools);
    } catch (error) {
      toast.error("Failed to fetch tools");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingTool(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tool: ToolMaster) => {
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (tool: ToolMaster) => {
    setEditingTool(tool);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingTool) return; // Changed from selectedTool
    try {
      await deleteTool(editingTool.id); // Changed from selectedTool
      toast.success("Tool deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete tool");
    } finally {
      setIsDeleteDialogOpen(false);
      setEditingTool(null); // Changed from setSelectedTool
    }
  };

  const handleSuccess = () => { // Renamed from handleFormSuccess
    setIsDialogOpen(false);
    setEditingTool(null); // Clear editing tool on success
    fetchData(); // Refresh data
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
            <CardTitle className="text-xl font-bold text-white">Tool Master</CardTitle>

          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <Button onClick={handleAdd} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
              <Plus className="h-4 w-4 mr-2" /> <span className="inline">Add Tool</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="toolName"
              searchValue={globalTerm}
              onSearch={setGlobalSearch}
              placeholder="Search tools..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            <DialogDescription>
              {editingTool
                ? "Update the details of the selected tool."
                : "Fill in the details to create a new tool."}
            </DialogDescription>
          </DialogHeader>
          <ToolMasterForm
            initialData={editingTool}
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
              This action cannot be undone. This will permanently delete the tool
              &quot;{editingTool?.toolName}&quot; and remove your data from our servers.
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
