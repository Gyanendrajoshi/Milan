"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PendingPOList } from "@/components/inventory/pending-po-list";
import { GRNForm } from "@/components/forms/grn-form";
import { BarcodePrintModal } from "@/components/inventory/barcode-print-modal";
import { GRN } from "@/types/grn-master";
import { mockGRNs } from "@/services/api/grn-service"; // To fetch last created? 
// Actually createGRN mock returns the object in real app, but createGRN is void in previous code?
// Let me check grn-form.tsx onSubmit. Ah, I made it call createGRN but didn't capture return.
// I should update grn-form to return data via onSuccess? 
// Or just fetch the latest GRN from mock service after success.

export default function GRNCreatePage() {
    const router = useRouter();
    const [step, setStep] = useState<"pending" | "form">("pending");
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // Barcode Modal State
    const [showBarcode, setShowBarcode] = useState(false);
    const [lastGRN, setLastGRN] = useState<GRN | null>(null);

    const handleCreateGRN = (items: any[]) => {
        setSelectedItems(items);
        setStep("form");
    };

    const handleGRNSuccess = () => {
        // Fetch the last created GRN to show in Modal
        // In a real app, the API would return it.
        // For Mock, we grab the first item from mockGRNs (since weunshifted)
        const latest = mockGRNs[0];
        setLastGRN(latest);
        setShowBarcode(true);
    };

    const handleModalClose = () => {
        setShowBarcode(false);
        router.push("/inventory/grn"); // Redirect to List
    };

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            {step === "pending" ? (
                <PendingPOList onCreateGRN={handleCreateGRN} />
            ) : (
                <GRNForm
                    initialItems={selectedItems}
                    onSuccess={handleGRNSuccess}
                    onCancel={() => setStep("pending")}
                />
            )}

            <BarcodePrintModal
                open={showBarcode}
                onClose={handleModalClose}
                grnData={lastGRN}
            />
        </div>
    );
}
