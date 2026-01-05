"use client";

import { useState } from "react";
import { PendingPOList } from "@/components/inventory/pending-po-list";
import { GRNList } from "@/components/inventory/grn-list";
import { GRNForm } from "@/components/forms/grn-form";
import { BarcodePrintModal } from "@/components/inventory/barcode-print-modal";
import { GRN } from "@/types/grn-master";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GRNCreateViewProps {
    onGrnCreated?: () => void;
}

export function GRNCreateView({ onGrnCreated }: GRNCreateViewProps) {
    const [view, setView] = useState<"pending" | "list">("pending");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [showBarcode, setShowBarcode] = useState(false);
    const [lastGRN, setLastGRN] = useState<GRN | null>(null);

    const handleCreateGRN = (items: any[]) => {
        setSelectedItems(items);
        setIsFormOpen(true);
    };

    const handleGRNSuccess = (grn?: GRN) => {
        setIsFormOpen(false);
        // Use the passed GRN or fallback (though it should always be passed now)
        if (grn) {
            setLastGRN(grn);
            setTimeout(() => setShowBarcode(true), 300); // Small delay for smooth transition
        }
    };

    const handleModalClose = () => {
        setShowBarcode(false);
        setSelectedItems([]);
        if (onGrnCreated) {
            onGrnCreated();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {view === "list" ? (
                <GRNList onBack={() => setView("pending")} />
            ) : (
                <PendingPOList
                    onCreateGRN={handleCreateGRN}
                    onShowList={() => setView("list")}
                />
            )}

            {/* GRN Entry Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-4 py-2 bg-theme-gradient-r shrink-0">
                        <DialogTitle className="text-white text-xl font-bold">
                            Goods Receipt Note
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden bg-slate-50 p-4">
                        <GRNForm
                            initialItems={selectedItems}
                            onSuccess={handleGRNSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <BarcodePrintModal
                open={showBarcode}
                onClose={handleModalClose}
                grnData={lastGRN}
            />
        </div>
    );
}
