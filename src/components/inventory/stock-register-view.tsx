"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/inventory/stock-columns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getStock } from "@/services/api/stock-service";
import { StockItem } from "@/types/stock-master";
import { toast } from "sonner";

export function StockRegisterView() {
    const [data, setData] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("All");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const stock = await getStock();
            setData(stock);
        } catch (error) {
            toast.error("Failed to fetch Stock");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = data.filter(item =>
        categoryFilter === "All" || item.category === categoryFilter
    );

    return (
        <CardContent className="flex-1 overflow-hidden p-0 space-y-4 flex flex-col pt-4">
            {/* Filters */}
            <div className="flex gap-4 items-center px-1">
                <div className="w-[200px]">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            <SelectItem value="Roll">Rolls</SelectItem>
                            <SelectItem value="Ink">Inks</SelectItem>
                            <SelectItem value="Material">Materials</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchKey="itemName"
                />
            )}
        </CardContent>
    );
}
