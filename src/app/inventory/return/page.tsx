"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getReturnColumns, ReturnRegisterRow } from "@/components/inventory/return-columns";
import { ReturnDialog } from "@/components/inventory/return-dialog";
import { returnStorage } from "@/services/return-storage";
import { MaterialReturn } from "@/types/material-return";

export default function ReturnPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [data, setData] = useState<MaterialReturn[]>([]);

    useEffect(() => {
        setData(returnStorage.getAll());
    }, [refreshKey]);

    const handleReturnComplete = () => {
        setRefreshKey(p => p + 1);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this Return? Stock will be adjusted accordingly.")) {
            returnStorage.delete(id);
            setRefreshKey(p => p + 1);
        }
    };

    // Flatten Data: 1 Return has multiple items -> Multiple Rows
    const flatData = useMemo(() => {
        const rows: ReturnRegisterRow[] = [];
        data.forEach(ret => {
            if (ret.items && ret.items.length > 0) {
                ret.items.forEach(item => {
                    rows.push({
                        id: ret.id,
                        returnDate: ret.returnDate,
                        issueId: ret.issueId,
                        issueDate: ret.issueDate,
                        jobCardNo: ret.jobCardNo,
                        department: ret.department,
                        itemCode: item.itemCode,
                        itemName: item.itemName,
                        batchNo: item.batchNo,
                        issuedQty: item.issuedQty,
                        returnedQty: item.returnedQty,
                        uom: item.uom,
                        rollWidth: item.rollWidth,
                        gsm: item.gsm,
                        qualityStatus: item.qualityStatus,
                        returnReason: item.returnReason,
                        originalReturnId: ret.id
                    });
                });
            } else {
                // Handle empty returns if any
                rows.push({
                    id: ret.id,
                    returnDate: ret.returnDate,
                    issueId: ret.issueId,
                    issueDate: ret.issueDate,
                    jobCardNo: ret.jobCardNo,
                    department: ret.department,
                    itemCode: "-",
                    itemName: "No Items",
                    batchNo: "-",
                    issuedQty: 0,
                    returnedQty: 0,
                    uom: "-",
                    originalReturnId: ret.id
                });
            }
        });
        return rows;
    }, [data]);

    const columns = useMemo(() => getReturnColumns(handleDelete), []);

    const {
        filteredData,
        globalTerm,
        setGlobalSearch
    } = useBacchaSearch(flatData, columns, {
        globalSearch: true,
        debounceMs: 300
    });

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">Material Return Register</CardTitle>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2">
                        <ReturnDialog onReturnComplete={handleReturnComplete} />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="issueId"
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search by Return No, Issue No, Job Card, or Batch..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
