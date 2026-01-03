"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns, DispatchJobRow } from "./columns";
import { historyColumns } from "./history-columns";
import { CreateDispatchDialog } from "./create-dispatch-dialog";
import { storage } from "@/services/storage";
import { dispatchStorage } from "@/services/dispatch-storage";
import { Loader2, Plus, List } from "lucide-react";
import { toast } from "sonner";

export default function DispatchPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<DispatchJobRow[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false); // Toggle List View

    // Load Data
    const loadData = () => {
        setIsLoading(true);
        try {
            const jobs = storage.getEstimations();
            const dispatches = dispatchStorage.getDispatches();

            // Set History Data (Sorted by Date Desc)
            setHistoryData([...dispatches].sort((a, b) => b.createdAt - a.createdAt));

            // Create a Map of JobID -> Dispatched Qty
            const dispatchMap = new Map<string, number>();
            dispatches.forEach(d => {
                d.items.forEach(item => {
                    const current = dispatchMap.get(item.jobId) || 0;
                    dispatchMap.set(item.jobId, current + (item.dispatchQty || 0));
                });
            });

            // Map Jobs to Dispatch Rows
            const rows: DispatchJobRow[] = jobs.map(job => {
                const totalDispatched = dispatchMap.get(job.id) || 0;
                const orderQty = job.quantity || 0;
                const pending = Math.max(0, orderQty - totalDispatched);

                let status: DispatchJobRow["status"] = "Pending";
                if (totalDispatched >= orderQty && orderQty > 0) {
                    status = "Dispatched";
                } else if (totalDispatched > 0) {
                    status = "Part Dispatch";
                }

                return {
                    id: job.id,
                    jobCardNo: job.jobCardNo,
                    clientId: job.clientId || "Unknown",
                    clientName: job.client || "Unknown",
                    jobName: job.jobName,
                    orderQty: orderQty,
                    dispatchedQty: totalDispatched,
                    pendingQty: pending,
                    deliveryDate: job.deliveryDate ? new Date(job.deliveryDate).toLocaleDateString() : "-",
                    status: status,
                    originalJob: job
                };
            });

            // Sorting by Job Card No descending by default
            rows.sort((a, b) => b.jobCardNo.localeCompare(a.jobCardNo));

            setData(rows);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dispatch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Derived Selected Rows
    const selectedRows = useMemo(() => {
        const selectedIds = Object.keys(rowSelection);
        return data.filter(row => selectedIds.includes(row.id));
    }, [data, rowSelection]);

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <CreateDispatchDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                selectedJobs={selectedRows}
                onSuccess={() => {
                    loadData();
                    setRowSelection({});
                }}
            />

            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-3 rounded-none shrink-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <TruckIcon className="w-5 h-5" />
                            </div>
                            {showHistory ? "Dispatch History" : "Dispatch Details"}
                        </CardTitle>
                        <p className="text-[10px] text-blue-100 font-medium uppercase tracking-wider opacity-80">
                            {showHistory ? `View History | Total: ${historyData.length}` : `Create Deliveries | Total: ${data.length}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistory(!showHistory)}
                            className="bg-white/10 hover:bg-white/20 text-white border-0"
                        >
                            <List className="w-4 h-4 mr-2" /> {showHistory ? "Create Deliveries" : "Show List"}
                        </Button>
                        {!showHistory && (
                            <Button
                                onClick={() => setDialogOpen(true)}
                                disabled={selectedRows.length === 0}
                                size="sm"
                                className="bg-white text-blue-600 hover:bg-white/90 font-bold shadow-sm border-0"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create Dispatch
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50/50">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        showHistory ? (
                            <DataTable
                                columns={historyColumns}
                                data={historyData}
                                searchKey="challanNo"
                                placeholder="Search Challan No..."
                                enableRowSelection={false}
                            />
                        ) : (
                            <DataTable
                                columns={columns}
                                data={data}
                                searchKey="jobName"
                                placeholder="Global Search Job, Client..."
                                enableRowSelection={true}
                                rowSelection={rowSelection}
                                onRowSelectionChange={setRowSelection}
                                getRowId={(row) => row.id}
                            />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function TruckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
        </svg>
    )
}
