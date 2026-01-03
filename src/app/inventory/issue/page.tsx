"use client";

import { useState, useMemo, useEffect } from "react";
import { useBacchaSearch } from "@/hooks/useBacchaSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getIssueColumns, IssueRegisterRow } from "@/components/inventory/issue-columns";
import { IssueDialog } from "../../../components/inventory/issue-dialog";
import { issueStorage } from "@/services/issue-storage";
import { MaterialIssue } from "@/types/material-issue";

export default function IssuePage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [data, setData] = useState<MaterialIssue[]>([]);

    useEffect(() => {
        setData(issueStorage.getAll());
    }, [refreshKey]);

    const handleIssueComplete = () => {
        setRefreshKey(p => p + 1);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this specific Issue Invoice? Stock will not be auto-reverted in this demo version.")) {
            issueStorage.delete(id);
            setRefreshKey(p => p + 1);
        }
    };

    // Flatten Data: 1 Issue has multiple items -> Multiple Rows
    const flatData = useMemo(() => {
        const rows: IssueRegisterRow[] = [];
        data.forEach(issue => {
            if (issue.items && issue.items.length > 0) {
                issue.items.forEach(item => {
                    rows.push({
                        id: issue.id,
                        issueDate: issue.issueDate,
                        jobCardNo: issue.jobCardNo,
                        department: issue.department,
                        itemName: item.itemName,
                        batchNo: item.batchNo,
                        issuedQty: item.issuedQty,
                        uom: item.uom,
                        originalIssueId: issue.id
                    });
                });
            } else {
                // Handle empty issues if any
                rows.push({
                    id: issue.id,
                    issueDate: issue.issueDate,
                    jobCardNo: issue.jobCardNo,
                    department: issue.department,
                    itemName: "No Items",
                    batchNo: "-",
                    issuedQty: 0,
                    uom: "-",
                    originalIssueId: issue.id
                });
            }
        });
        return rows;
    }, [data]);

    const columns = useMemo(() => getIssueColumns(handleDelete), []);

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
                        <CardTitle className="text-xl font-bold text-white">Material Issue Register</CardTitle>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-2">
                        <IssueDialog onIssueComplete={handleIssueComplete} />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        searchKey="jobCardNo"
                        searchValue={globalTerm}
                        onSearch={setGlobalSearch}
                        placeholder="Search by Job Card, Batch, or Issue No..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
