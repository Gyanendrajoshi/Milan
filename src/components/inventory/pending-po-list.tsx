"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { format } from "date-fns";
import { Search, Plus, XCircle, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { PurchaseOrderItem, PurchaseOrder } from "@/services/po-storage";
import { poStorage } from "@/services/po-storage";
import { grnStorage } from "@/services/grn-storage";


import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./pending-po-columns";

// Flattened Item Type for Display
export interface PendingItem extends PurchaseOrderItem {
    id: string;  // Item ID from PurchaseOrderItem
    poId: string;
    poNumber: string;
    poDate: string;
    supplierName: string;
}

interface PendingPOListProps {
    onCreateGRN: (items: PendingItem[]) => void;
    onShowList?: () => void;
}

export function PendingPOList({ onCreateGRN, onShowList }: PendingPOListProps) {
    const [supplierFilter, setSupplierFilter] = useState("All");
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

    // Load pending POs from localStorage
    useEffect(() => {
        const loadPendingPOs = () => {
            const pos = poStorage.getPending();
            setPurchaseOrders(pos);
        };
        loadPendingPOs();
    }, []);

    // Flatten POs to Items and Calculate Pending Qty from GRN History
    const pendingItems = useMemo(() => {
        const items: PendingItem[] = [];
        const allGRNs = grnStorage.getAll();

        purchaseOrders.forEach((po) => {
            if (po.status === "Closed" || po.status === "Cancelled") return;

            po.items.forEach((item: PurchaseOrderItem) => {
                // Calculate total received from all GRNs for this PO Item
                const totalReceived = allGRNs.reduce((sum, grn) => {
                    // Match by PO ID (preferred) or PO Number (fallback), and Item Code
                    const grnItems = grn.items.filter((gi) =>
                        (gi.poId === po.id || gi.poNumber === po.poNumber) &&
                        gi.itemCode === item.itemCode
                    );

                    if (grnItems.length > 0) {
                        const received = grnItems.reduce((s, i) => s + (i.receivedQty || 0), 0);
                        return sum + received;
                    }
                    return sum;
                }, 0);

                const pending = Math.max(0, item.orderedQty - totalReceived);

                if (pending > 0) {
                    items.push({
                        ...item,
                        receivedQty: totalReceived,
                        pendingQty: pending,
                        poId: po.id,
                        poNumber: po.poNumber,
                        poDate: po.poDate,
                        supplierName: po.supplierName,
                    });
                }
            });
        });
        return items;
    }, [purchaseOrders]);

    const handleForceClose = (id: string) => {
        toast.info("Force Close Clicked", { description: "This functionality is mock-only for now." });
    };

    // State for DataTable Selection
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    // Derive selected items from rowSelection state
    const selectedItems = useMemo(() => {
        return pendingItems.filter(item => rowSelection[item.id]);
    }, [rowSelection, pendingItems]);

    // Validation for Selection (Same Supplier)
    const validateSelection = (item: PendingItem) => {
        if (selectedItems.length > 0) {
            const currentSupplier = selectedItems[0].supplierName;
            if (item.supplierName !== currentSupplier) {
                toast.error("Cannot select items from different suppliers", {
                    description: `Current selection is for ${currentSupplier}. Please clear selection to switch.`
                });
                return false;
            }
        }
        return true;
    };

    const columns = useMemo(() => getColumns({
        onForceClose: handleForceClose,
        validateSelection
    }), [validateSelection]);

    // Advanced search hook
    const {
        filteredData: searchResults,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(pendingItems, columns, {
        globalSearch: true,
        debounceMs: 300
    });

    // Filter Items (Apply validation/supplier filter on top of search results)
    const filteredItems = useMemo(() => {
        let items = searchResults;

        if (supplierFilter !== "All") {
            items = items.filter(item => item.supplierName === supplierFilter);
        }

        return items;
    }, [searchResults, supplierFilter]);

    // Unique Suppliers for Filter
    const suppliers = useMemo(() => {
        const s = new Set(pendingItems.map((i) => i.supplierName));
        return Array.from(s);
    }, [pendingItems]);

    const handleCreateGRN = () => {
        if (selectedItems.length === 0) return;
        onCreateGRN(selectedItems);
    };

    const handleRefresh = () => {
        setGlobalSearch("");
        setSupplierFilter("All");
    };

    return (
        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold text-white">
                        Pending Purchase Orders
                    </CardTitle>
                    <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                        Selected: {selectedItems.length}
                    </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="ghost"
                        onClick={onShowList}
                        className="text-white hover:bg-white/10 hover:text-white font-medium h-9"
                    >
                        Show List
                    </Button>
                    <Button
                        onClick={handleCreateGRN}
                        disabled={selectedItems.length === 0}
                        className={cn(
                            "shadow-lg shrink-0 px-4 font-bold border-0 h-9 transition-all",
                            selectedItems.length > 0 ? "bg-white text-blue-600 hover:bg-white/90" : "bg-white/20 text-white cursor-not-allowed"
                        )}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create GRN ({selectedItems.length})
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden bg-slate-50">
                {/* Filters */}
                <DataTable
                    columns={columns}
                    data={filteredItems}
                    enableRowSelection={true}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    getRowId={(row) => row.id}
                    disableResponsive={false}
                    searchValue={globalTerm}
                    onSearch={setGlobalSearch}
                    placeholder="Search..."
                    toolbarExtras={
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="w-full sm:w-[200px]">
                                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                                    <SelectTrigger className="h-9 text-sm w-full">
                                        <SelectValue placeholder="Filter by supplier..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Suppliers</SelectItem>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-background hover:bg-muted shrink-0" onClick={handleRefresh}>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    }
                    gridId="pending-po-list"
                />
            </CardContent>
        </Card >
    );
}
