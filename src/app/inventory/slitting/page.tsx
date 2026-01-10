"use client";

import { SlittingForm } from "@/components/inventory/jumbo-slitting/slitting-form";

export default function SlittingPage() {
    return (
        <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Jumbo Roll Slitting</h1>
                <p className="text-sm text-muted-foreground">
                    New Slitting Process Flow
                </p>
            </div>

            <div className="flex-1">
                <SlittingForm />
            </div>
        </div>
    );
}
