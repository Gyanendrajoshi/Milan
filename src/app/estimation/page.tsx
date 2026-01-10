"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { EstimationForm } from "@/components/forms/estimation-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

import { getEstimationColumns, Estimation } from "./estimation-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstimations, getEstimationById, deleteEstimation } from "@/services/api/estimation-service";
import { toast } from "sonner";

export default function EstimationPage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedEstimation, setSelectedEstimation] = useState<Estimation | undefined>(undefined);

    const [estimations, setEstimations] = useState<Estimation[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getEstimations();
            setEstimations(data || []);
        } catch (error) {
            console.error("Failed to fetch estimations", error);
            toast.error("Failed to load estimations");
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        refreshData();
    }, []);

    const columns = useMemo(() => getEstimationColumns({
        onEdit: async (data) => {
            // Fetch full details before showing form because list view has shallow data
            setLoading(true);
            try {
                // Ensure we get the full object with nested details
                const fullData = await getEstimationById(data.id);
                setSelectedEstimation(fullData);
                setShowForm(true);
            } catch (error) {
                console.error("Failed to load details", error);
                toast.error("Failed to load estimation details");
            } finally {
                setLoading(false);
            }
        },
        onPrint: (data) => console.log("Print", data),
        onDelete: async (data) => {
            if (confirm(`Are you sure you want to delete ${data.jobCardNo}?`)) {
                try {
                    await deleteEstimation(data.id);
                    toast.success("Estimation Deleted");
                    refreshData();
                } catch (error) {
                    toast.error("Failed to delete estimation");
                }
            }
        },
    }), []);

    const {
        filteredData,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(estimations, columns, {
        globalSearch: true,
        debounceMs: 300
    });

    if (showForm) {
        return (
            <div className="h-full">
                <EstimationForm
                    key={selectedEstimation?.id ?? 'new'}
                    onBack={() => {
                        setShowForm(false);
                        setSelectedEstimation(undefined);
                        refreshData();
                    }}
                    initialData={selectedEstimation}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-sm rounded-none">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 shrink-0 bg-theme-gradient-r text-white rounded-none">
                    <div>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            Estimation & Job Card
                        </CardTitle>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-sm h-8 text-xs border-0">
                        <Plus className="mr-2 h-3.5 w-3.5" /> New Estimation / Job
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="jobCardNo"
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search job cards..."
                        isLoading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
