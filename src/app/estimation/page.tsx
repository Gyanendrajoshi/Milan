"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { EstimationForm } from "@/components/forms/estimation-form";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";

import { getEstimationColumns, Estimation } from "./estimation-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/services/storage";
import { toast } from "sonner";

export default function EstimationPage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedEstimation, setSelectedEstimation] = useState<Estimation | undefined>(undefined);

    const [estimations, setEstimations] = useState<Estimation[]>([]);

    const refreshData = () => {
        setEstimations(storage.getEstimations());
    };

    // Load initial data
    // Load initial data
    useEffect(() => {
        refreshData();
    }, []);

    const columns = useMemo(() => getEstimationColumns({
        onEdit: (data) => {
            setSelectedEstimation(data);
            setShowForm(true);
        },
        onPrint: (data) => console.log("Print", data),
        onDelete: (data) => {
            if (confirm(`Are you sure you want to delete ${data.jobCardNo}?`)) {
                storage.deleteEstimation(data.id);
                toast.success("Estimation Deleted");
                refreshData();
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
                        searchKey="jobCardNo" // Allow filtering by Job Card ID directly if needed by DataTable internals
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search job cards..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
