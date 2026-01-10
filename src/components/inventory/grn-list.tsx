"use client";

import { useMemo, useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getGRNColumns, GRNFlatItem } from "./grn-columns";
import { grnStorage } from "@/services/grn-storage";
import { rollStorage } from "@/services/storage/roll-storage";
import { materialStorage } from "@/services/storage/material-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GRNForm } from "@/components/forms/grn-form";
import { GRN, GRNItem } from "@/types/grn-master";
import { BarcodePrintModal } from "@/components/inventory/barcode-print-modal";

interface GRNListProps {
    onBack: () => void;
}

export function GRNList({ onBack }: GRNListProps) {
    const [viewGRN, setViewGRN] = useMemo<[GRN | null, (grn: GRN | null) => void]>(() => {
        // Just using useState - hooks rule, can't put useState in useMemo callback like this?
        // Wait, I am inside component.
        return [null, () => { }];
    }, []); // Mistake in thinking, fixing below.

    // START FIX
    // Using standard useState
    const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [showBarcode, setShowBarcode] = useState(false);
    const [grns, setGrns] = useState<GRN[]>([]);

    // Load data on mount and refresh
    // Load data on mount
    useEffect(() => {
        setGrns(grnStorage.getAll());
    }, []);

    // Handle refresh
    const refreshData = () => {
        setGrns(grnStorage.getAll());
    };

    // Flatten GRN data for display
    const data = useMemo(() => {
        const flatItems: GRNFlatItem[] = [];
        grns.forEach(grn => {
            grn.items.forEach(item => {
                flatItems.push({
                    id: `${grn.id}-${item.id}`,
                    grnId: grn.id,
                    grnNo: grn.grnNumber || "Pending",
                    grnDate: grn.grnDate,
                    poNumber: item.poNumber || "PO-Unknown",
                    poDate: item.poDate || new Date().toISOString(),
                    supplierName: grn.supplierName,
                    itemCode: item.itemCode,
                    itemName: (() => {
                        let name = item.itemName;
                        // Fallback for missing/unknown item names using Master Data lookup
                        if (!name || name.trim() === "" || name === "Unknown Item") {
                            const normalizedCode = (item.itemCode || "").trim().toLowerCase();
                            // Try Roll Master
                            const roll = rollStorage.getAll().find(r => (r.itemCode || "").trim().toLowerCase() === normalizedCode);
                            if (roll) return roll.itemName;
                            // Try Material Master
                            const material = materialStorage.getAll().find(m => (m.itemCode || "").trim().toLowerCase() === normalizedCode);
                            if (material) return material.itemName;
                        }
                        return name;
                    })(),
                    group: "Paper",
                    uom: item.uom,
                    receivedQty: item.receivedQty,
                    receivedKg: item.receivedKg,
                    batchNo: item.batchNo,
                    expiryDate: item.expiryDate,
                    challanNo: grn.supplierChallanNo,
                    challanDate: grn.challanDate,
                    receivedBy: "admin"
                });
            });
        });
        return flatItems.sort((a, b) => new Date(b.grnDate).getTime() - new Date(a.grnDate).getTime());
    }, [grns]);

    const handlePrint = (grnId: string) => {
        const grn = grns.find(g => g.id === grnId);
        if (grn) {
            setSelectedGRN(grn);
            setIsPrintOpen(true);
        }
    };

    const handlePrintBarcode = (grnId: string) => {
        const grn = grns.find(g => g.id === grnId);
        if (grn) {
            setSelectedGRN(grn);
            setShowBarcode(true);
        }
    };

    const handleDelete = (grnId: string) => {
        grnStorage.delete(grnId);
        refreshData();
        toast.success("GRN Deleted Successfully");
    };

    const columns = useMemo(() => getGRNColumns({
        onPrint: handlePrint,
        onPrintBarcode: handlePrintBarcode,
        onDelete: handleDelete
    }), [grns]); // Allow recreating columns when data changes to ensure handlers have fresh closure

    const {
        filteredData,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(data, columns, {
        globalSearch: true,
        debounceMs: 300
    });

    return (
        <Card className="flex-1 flex flex-col border-0 shadow-none rounded-none overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8 text-white hover:bg-white/20 hover:text-white -ml-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-0.5">
                        <CardTitle className="text-xl font-bold text-white">GRN Register</CardTitle>
                        <p className="text-[10px] text-blue-100 font-medium opacity-90">History of Material Receipts | Total: {filteredData.length}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Add export/print actions if needed */}
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 flex flex-col">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchKey="poInfo"
                    enableRowSelection={false}
                    searchValue={globalTerm}
                    onSearch={setGlobalSearch}
                    placeholder="Search GRNs..."
                    gridId="grn-list"
                />
            </CardContent>

            {/* Print Dialog */}
            <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-4 py-2 bg-theme-gradient-r shrink-0">
                        <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                            <Printer className="h-5 w-5" /> Print GRN
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden bg-slate-50 p-4">
                        {selectedGRN && (
                            // We need to map GRN items back to "Form Items" shape if needed
                            // Or we update GRNForm to accept "GRN" object directly?
                            // GRNForm takes "initialItems" which are PendingItems structure.
                            // Let's create a minimal adaptor.
                            <GRNForm
                                initialItems={selectedGRN.items.map((i: GRNItem) => ({
                                    ...i,
                                    pendingQty: 0, // Not relevant for print
                                    orderedQty: i.orderedQty,
                                    // Map back other fields if names differ? 
                                    // Actually GRN Item has most fields.
                                    poNumber: i.poNumber || "N/A",
                                    poDate: i.poDate || new Date().toISOString(),
                                    supplierName: selectedGRN.supplierName
                                }))}
                                onSuccess={() => { }}
                                onCancel={() => setIsPrintOpen(false)}
                                readOnly={true} // New Prop we need to add
                                existingData={selectedGRN} // Pass full object for header fields lookup
                                onPrintBarcode={() => setShowBarcode(true)} // Prop to trigger barcode print
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Barcode Modal */}
            <BarcodePrintModal
                open={showBarcode}
                onClose={() => setShowBarcode(false)}
                grnData={selectedGRN}
            />
        </Card>
    );
}
