"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./columns";
import { stockService } from "@/services/stock-service";
import { StockItem } from "@/types/stock";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";

export default function StockPage() {
    const [data, setData] = React.useState<StockItem[]>([]);

    const loadData = () => {
        const items = stockService.getAllStock();
        setData(items);
    };

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        loadData();
    }, []);

    // Advanced search hook with debouncing (same as PO page)
    const {
        filteredData: searchResults,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(data, columns, {
        globalSearch: true,
        columnSearch: false,
        debounceMs: 300
    });

    if (!isMounted) {
        return null; // Or a loader
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 p-0">
            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none rounded-none">
                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-6 py-2 rounded-none shrink-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">Stock Inventory</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={searchResults}
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search by Item Code or Name..."
                        toolbarExtras={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 bg-background hover:bg-muted shrink-0"
                                    onClick={loadData}
                                >
                                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        }
                        gridId="stock-inventory"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
