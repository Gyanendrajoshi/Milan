"use client";

import { GRNCreateView } from "@/components/inventory/grn-create-view";

export default function InventoryPage() {
    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
                <GRNCreateView />
            </div>
        </div>
    );
}
