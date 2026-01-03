import { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseOrderForm } from "@/components/forms/purchase-order-form";

export const metadata: Metadata = {
    title: "Create Purchase Order | Milan Industries",
    description: "Create a new purchase order for inventory.",
};

export default function CreatePurchaseOrderPage() {
    return (
        <div className="h-full flex flex-col">
            <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <PurchaseOrderForm />
            </Suspense>
        </div>
    );
}

