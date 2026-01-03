"use client";

import { useState, useEffect } from "react";
import { storage } from "@/services/storage";
import { productionStorage } from "@/services/production-storage";
import { ProductionEntry } from "@/types/production";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductionListPage() {
    const [data, setData] = useState<ProductionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setIsLoading(true);

        // 1. Get all Jobs (Estimations)
        const jobs = storage.getEstimations();

        if (!jobs || jobs.length === 0) {
            setIsLoading(false);
            return;
        }

        // 2. Initialize Production entries
        try {
            const productionEntries = jobs.map(job => {
                return productionStorage.initForJob(job);
            }).filter(Boolean) as ProductionEntry[];

            setData(productionEntries);
        } catch (e) {
            console.error("Error initializing production entries:", e);
            toast.error("Error loading production data");
        }

        setIsLoading(false);
    };

    const filteredData = data.filter(item => {
        if (showHistory) {
            // Show Completed (and Dispatched if anticipated)
            return item.status === 'Completed' || (item.status as string) === 'Dispatched';
        } else {
            // Show Active
            return item.status !== 'Completed' && (item.status as string) !== 'Dispatched';
        }
    });

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-3 rounded-none shrink-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">Production Management</CardTitle>
                    </div>
                    <Button
                        onClick={() => setShowHistory(!showHistory)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white border-0"
                    >
                        {showHistory ? "Show Active Jobs" : "Show History / List"}
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50/50">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            searchKey="jobName"
                            placeholder={showHistory ? "Search History..." : "Search Active Jobs..."}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
