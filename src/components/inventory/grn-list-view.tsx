"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "@/app/inventory/grn/columns"; // Reusing existing

import { getGRNs } from "@/services/api/grn-service";
import { GRN } from "@/types/grn-master";
import { toast } from "sonner";

import { GRNDetailsDialog } from "./grn-details-dialog";

export function GRNListView() {
    const [data, setData] = useState<GRN[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog State
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const grns = await getGRNs();
            setData(grns);
        } catch (error) {
            toast.error("Failed to fetch GRNs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleView = (grn: GRN) => {
        setSelectedGrn(grn);
        setViewOpen(true);
    };

    const columns = getColumns({
        onView: handleView,
    });

    return (
        <CardContent className="flex-1 overflow-hidden p-0 pt-4 flex flex-col gap-4">
            <div className="flex justify-end px-1">
                <Link href="/inventory/grn/create">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md h-8 px-4 font-bold">
                        <Plus className="mr-2 h-4 w-4" /> Create GRN
                    </Button>
                </Link>
            </div>
            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    searchKey="supplierName"
                />
            )}

            <GRNDetailsDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                grn={selectedGrn}
            />
        </CardContent>
    );
}
