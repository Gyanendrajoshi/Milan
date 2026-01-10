"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";

import { PurchaseOrder } from "@/services/api/purchase-order-service";
// import { PurchaseOrder } from "../../../services/mock-data/purchase-orders";
// import { poStorage } from "@/services/po-storage";
import { toast } from "sonner";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";

export default function PurchaseOrderListPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = React.useState<string>("All");

    const [data, setData] = React.useState<PurchaseOrder[]>([]);

    const loadData = () => {
        import("@/services/api/purchase-order-service").then(m => m.getPurchaseOrders()).then(pos => {
            setData(pos);
        });
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const handleView = (po: PurchaseOrder) => {
        router.push(`/inventory/purchase-order/create?id=${po.id}`);
    };

    const handleDelete = async (po: PurchaseOrder) => {
        if (!confirm(`Are you sure you want to delete PO ${po.poNumber}?`)) return;

        try {
            const { deletePurchaseOrder } = await import("@/services/api/purchase-order-service");
            await deletePurchaseOrder(po.id);
            toast.success("Purchase Order deleted successfully");
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete Purchase Order");
        }
    };

    const handlePrint = (po: PurchaseOrder) => {
        toast.info(`Printing PO: ${po.poNumber}`);
    };

    const columns = React.useMemo(() => getColumns({
        onView: handleView,
        onDelete: handleDelete,
        onPrint: handlePrint
    }), []);

    // Advanced search hook with debouncing
    const {
        filteredData: searchResults,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(data, columns, {
        globalSearch: true,
        columnSearch: false, // We can enable this if we want specific column filters
        debounceMs: 300
    });

    // Apply status filter on top of search results
    const filteredPOs = React.useMemo(() => {
        let data = searchResults;

        if (statusFilter !== "All") {
            data = data.filter((po: PurchaseOrder) => po.status === statusFilter);
        }

        return data;
    }, [searchResults, statusFilter]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-0">
            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none rounded-none">
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-6 py-2 rounded-none shrink-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">Purchase Orders</CardTitle>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                        <Link href="/inventory/purchase-order/create">
                            <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-lg shadow-black/10 shrink-0 px-4 font-bold border-0">
                                <Plus className="mr-2 h-4 w-4" /> Create New PO
                            </Button>
                        </Link>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                    {/* Filters */}
                    <DataTable
                        columns={columns}
                        data={filteredPOs}
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search PO or Supplier..."
                        toolbarExtras={
                            <div className="flex items-center gap-2">
                                <div className="w-32 sm:w-40">
                                    <Input type="date" className="h-9 text-sm" placeholder="Start Date" />
                                </div>
                                <div className="w-32 sm:w-40">
                                    <Input type="date" className="h-9 text-sm" placeholder="End Date" />
                                </div>
                                <div className="w-32 sm:w-40">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Status</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Partial">Partial</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-background hover:bg-muted shrink-0">
                                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        }
                        gridId="purchase-order-list"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
