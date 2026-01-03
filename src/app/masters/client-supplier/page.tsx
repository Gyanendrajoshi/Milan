"use client";

import { useState, useEffect, useMemo } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Client, Supplier } from "@/types/client-supplier";
import { getClients, deleteClient } from "@/services/api/client-service";
import { getSuppliers, deleteSupplier } from "@/services/api/supplier-service";
import { DataTable } from "@/components/ui/data-table";
import { getClientColumns } from "./client-columns";
import { getSupplierColumns } from "./supplier-columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ClientForm } from "@/components/forms/client-form";
import { SupplierForm } from "@/components/forms/supplier-form";
import { toast } from "sonner";

export default function ClientSupplierPage() {
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);





  const fetchClients = async () => {
    try {
      setIsLoadingClients(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      toast.error("Failed to fetch clients");
      console.error(error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
      console.error(error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchSuppliers();
  }, []);

  // Reset search when tab changes - No longer needed with separate hooks

  // Client handlers
  const handleAddClient = () => {
    setSelectedClient(null);
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteClient = async () => {
    if (!selectedClient) return;
    try {
      await deleteClient(selectedClient.id);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete record");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  // Supplier handlers
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    try {
      await deleteSupplier(selectedSupplier.id);
      toast.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete supplier");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    if (activeTab === "clients") {
      fetchClients();
    } else {
      fetchSuppliers();
    }
  };

  const clientColumns = useMemo(() => getClientColumns({
    onEdit: handleEditClient,
    onDelete: handleDeleteClient,
  }), []);

  const supplierColumns = useMemo(() => getSupplierColumns({
    onEdit: handleEditSupplier,
    onDelete: handleDeleteSupplier,
  }), []);

  const clientSearch = useBacchaSearch(clients, clientColumns, {
    globalSearch: true,
    debounceMs: 300
  });

  const supplierSearch = useBacchaSearch(suppliers, supplierColumns, {
    globalSearch: true,
    debounceMs: 300
  });

  const currentSearch = activeTab === "clients" ? clientSearch : supplierSearch;

  return (
    <div className="container mx-auto h-full flex flex-col p-0">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none rounded-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl font-bold text-white">Client/Supplier</CardTitle>
              <TabsList className="bg-white/20 p-0.5 h-7">
                <TabsTrigger
                  value="clients"
                  className="h-6 px-3 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white/90 hover:text-white transition-all"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger
                  value="suppliers"
                  className="h-6 px-3 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white/90 hover:text-white transition-all"
                >
                  Suppliers
                </TabsTrigger>
              </TabsList>
            </div>
            <Button
              onClick={activeTab === "clients" ? handleAddClient : handleAddSupplier}
              className="bg-white text-blue-600 hover:bg-white/90 font-bold shadow-lg shadow-black/10 h-8 shrink-0 px-4 border-0 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="inline">Add {activeTab === "clients" ? "Client" : "Supplier"}</span>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">


            <TabsContent value="clients" className="flex-1 mt-0 overflow-hidden">
              {isLoadingClients ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <DataTable
                  columns={clientColumns}
                  data={clientSearch.filteredData}
                  searchKey="clientName"
                  searchValue={currentSearch.globalTerm}
                  onSearch={currentSearch.setGlobalSearch}
                  placeholder="Search Clients..."
                />
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="flex-1 mt-0 overflow-hidden">
              {isLoadingSuppliers ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <DataTable
                  columns={supplierColumns}
                  data={supplierSearch.filteredData}
                  searchKey="supplierName"
                  searchValue={currentSearch.globalTerm}
                  onSearch={currentSearch.setGlobalSearch}
                  placeholder="Search Suppliers..."
                />
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClient
                ? "Edit Client"
                : selectedSupplier
                  ? "Edit Supplier"
                  : activeTab === "clients"
                    ? "Add New Client"
                    : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              {selectedClient || selectedSupplier
                ? "Update the details below."
                : "Fill in the details to create a new entry."}
            </DialogDescription>
          </DialogHeader>
          {activeTab === "clients" || selectedClient ? (
            <ClientForm initialData={selectedClient} onSuccess={handleFormSuccess} />
          ) : (
            <SupplierForm initialData={selectedSupplier} onSuccess={handleFormSuccess} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {selectedClient ? `client "${selectedClient.clientName}"` : `supplier "${selectedSupplier?.supplierName}"`}{" "}
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={selectedClient ? handleConfirmDeleteClient : handleConfirmDeleteSupplier}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
