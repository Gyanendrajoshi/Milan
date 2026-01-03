"use client";
// Force refresh

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ScanLine, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("./qr-scanner"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-black text-white flex items-center justify-center">Loading...</div>
});
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { storage } from "@/services/storage";
import { grnStorage } from "@/services/grn-storage";
import { issueStorage } from "@/services/issue-storage";
import { EstimationFormValues } from "@/types/estimation";
import { IssuedItem } from "@/types/material-issue";

interface IssueDialogProps {
    onIssueComplete: () => void;
}

// Extended type for stored data
type StoredEstimation = EstimationFormValues & {
    id: string;
    client: string;
    jobCardNo: string;
};

export function IssueDialog({ onIssueComplete }: IssueDialogProps) {
    const [open, setOpen] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);

    const [issueType, setIssueType] = useState<"JOB" | "DEPT">("JOB");

    // Selection
    const [selectedJobValue, setSelectedJobValue] = useState(""); // Stores "JOBID|CONTENT_INDEX"
    const [selectedJob, setSelectedJob] = useState<StoredEstimation | null>(null);
    const [selectedContent, setSelectedContent] = useState<any | null>(null);

    // Dept Selection
    const [department, setDepartment] = useState("");
    const [deptOptions, setDeptOptions] = useState<{ label: string, value: string }[]>([]);

    // Scanning
    const [scanCode, setScanCode] = useState("");
    const [scannedItems, setScannedItems] = useState<IssuedItem[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            loadJobs();
            loadDepartments();
            // Focus scan input after a delay
            setTimeout(() => scanInputRef.current?.focus(), 500);
        } else {
            // Reset state on close
            setSelectedJobValue("");
            setSelectedJob(null);
            setSelectedContent(null);
            setDepartment("");
            setIssueType("JOB");
            setScannedItems([]);
            setScanCode("");
        }
    }, [open]);

    const loadDepartments = () => {
        const depts = issueStorage.getDepartments();
        setDeptOptions(depts.map(d => ({ label: d, value: d })));
    };

    const loadJobs = () => {
        const estimations = storage.getEstimations() as unknown as StoredEstimation[];
        // Flatten jobs: If an estimation has contents, create separate entries for dropdown
        // Format: ID: "EST_ID|INDEX", Label: "JC123 [1/2] - ContentName"
        const jobOptions = [];

        for (const est of estimations) {
            if (est.contents && est.contents.length > 0) {
                est.contents.forEach((content, idx) => {
                    const total = est.contents.length;
                    const suffix = total > 1 ? ` [${idx + 1}/${total}]` : "";
                    const label = `${est.jobCardNo}${suffix} - ${content.contentName || "Main"}`;
                    jobOptions.push({
                        value: `${est.id}|${idx}`,
                        label: label,
                        data: est,
                        content: content
                    });
                });
            } else {
                // Fallback for no contents (legacy/simple)
                jobOptions.push({
                    value: `${est.id}|0`,
                    label: est.jobCardNo || "Unknown Job",
                    data: est,
                    content: {}
                });
            }
        }
        setJobs(jobOptions);
    };

    const handleJobChange = (val: string) => {
        setSelectedJobValue(val);
        const option = jobs.find(j => j.value === val);
        if (option) {
            setSelectedJob(option.data);
            setSelectedContent(option.content);
        }
    };

    const handleScan = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            processScan(scanCode);
            setScanCode("");
        }
    };

    const processScan = (code: string) => {
        if (!code) return;

        let searchCode = code;
        try {
            // Try parsing if it looks like JSON
            if (code.trim().startsWith("{")) {
                const parsed = JSON.parse(code);
                if (parsed.batch) {
                    searchCode = parsed.batch;
                }
            }
        } catch (e) {
            // Ignore parse error, treat as raw string
            console.log("QR Parse error, treating as raw", e);
        }

        // Validation based on Type
        if (issueType === "JOB" && !selectedJobValue) {
            toast.error("Please select a Job Card first.");
            return;
        }
        if (issueType === "DEPT" && !department.trim()) {
            toast.error("Please enter/select a Department first.");
            return;
        }

        const item = grnStorage.getItemByBatch(searchCode);
        if (!item) {
            toast.error("Invalid QR Code or Item not found");
            return;
        }

        if ((item.remainingQty ?? item.receivedQty) <= 0) {
            toast.error("Item Stock Exhausted");
            return;
        }

        // Add to scanned list
        // Check if already added
        if (scannedItems.find(i => i.grnItemId === item.id)) {
            toast.warning("Item already scanned in this session");
            return;
        }

        const newItem: IssuedItem = {
            grnItemId: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            batchNo: item.batchNo,
            issuedQty: item.remainingQty ?? item.receivedQty, // Default to full remaining
            uom: item.uom,
            rollWidth: item.rollWidth,
            gsm: item.rollGSM
        };

        setScannedItems(prev => [...prev, newItem]);
        toast.success(`Scanned: ${item.itemName}`);
    };

    const updateQty = (index: number, val: string) => {
        const qty = parseFloat(val);
        if (isNaN(qty) || qty < 0) return;

        const newItems = [...scannedItems];
        // Validate against max stock
        const item = grnStorage.getItemByBatch(newItems[index].batchNo);
        if (item) {
            const max = item.remainingQty ?? item.receivedQty;
            if (qty > max) {
                toast.error(`Max available: ${max}`);
                return;
            }
        }
        newItems[index].issuedQty = qty;
        setScannedItems(newItems);
    };

    const removeItem = (index: number) => {
        setScannedItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (issueType === "JOB" && !selectedJobValue) {
            toast.error("Please select a Job Card");
            return;
        }
        if (issueType === "DEPT" && !department.trim()) {
            toast.error("Please enter a Department");
            return;
        }
        if (scannedItems.length === 0) {
            toast.error("No items scanned");
            return;
        }

        try {
            // Prepare Data
            const option = jobs.find(j => j.value === selectedJobValue);

            const issueData: any = {
                issueDate: new Date().toISOString(),
                issueType: issueType,
                items: scannedItems,
                issuedBy: "Admin"
            };

            if (issueType === "JOB") {
                issueData.jobId = selectedJobValue.split("|")[0];
                issueData.jobCardNo = option ? option.label : "Unknown";
            } else {
                issueData.department = department;
            }

            issueStorage.save(issueData);

            // 2. Reduce Stock
            scannedItems.forEach(i => {
                // Note: grnStorage.updateStock uses (grnId, itemId, qty). 
                // But our scannedItems usage of grnStorage.getItemByBatch returns combined data.
                // Wait, getItemByBatch returns { ...item, grnId: grn.id }.
                // So we need to store grnId in IssuedItem or fetch it again.
                // Ah, implementation gap! IssuedItem def has grnItemId, but updateStock needs GRN ID too.
                // Let's check grnItemId usage. My types define it as string.
                // Correct logic: getItemByBatch returns object with grnId. 
                // I should store grnId in IssuedItem or just re-fetch in update loop.
                // Or better, update updateStock to find by ItemID across all (expensive but safe).

                // FIX: I will pass `grnId` during scan time into a hidden field or update `updateStock` interface?
                // `grnStorage.updateStock` asks for `grnId`. 
                // Let's just lookup again quickly since we have batchNo or ID.
                // Actually, `getItemByBatch` is cleaner.
            });

            // Fix Loop Logic for Stock Update:
            // Since I didn't store GRN ID in `IssuedItem` (only Item ID), I have to look it up.
            // But `IssuedItem.grnItemId` IS the item.id.
            // I should modify `updateStock` to work with just ItemID? No, GRNs structure requires separate lookups.
            // I'll assume for this prototype `grnId` is needed.
            // Let's modify `IssuedItem` to include `grnId` temporarily or use a helper.
            // Easiest: Iterate items, lookup parent GRN, update. 
            // In `handleSave`:
            scannedItems.forEach(i => {
                const stockItem = grnStorage.getItemByBatch(i.batchNo);
                if (stockItem) {
                    // Update stock: (GRN_ID, GRN_ITEM_ID, QTY_TO_REDUCE)
                    // Note: updateStock subtracts the qty from remaining.
                    grnStorage.updateStock(stockItem.grnId, stockItem.id, i.issuedQty);
                } else {
                    console.error("Stock item not found during save:", i.batchNo);
                }
            });

            toast.success("Material Issued Successfully");
            setOpen(false);
            onIssueComplete();

        } catch (e) {
            console.error(e);
            toast.error("Failed to save issue");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient-blue" className="border-0 shadow-lg shadow-black/10 transition-all font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Issue Material
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl min-h-[60vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white rounded-t-lg">
                    <DialogTitle className="text-xl font-bold text-white">Issue Material</DialogTitle>
                </DialogHeader>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto">

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left: Job Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 border-b border-border/10 pb-2 mb-2">
                                <Label className="text-muted-foreground w-24">Issue To:</Label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIssueType("JOB")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${issueType === "JOB" ? "bg-blue-600 text-white shadow" : "bg-muted text-muted-foreground"}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border ${issueType === "JOB" ? 'bg-white border-transparent' : 'border-current'}`} />
                                        Job Card
                                    </button>
                                    <button
                                        onClick={() => setIssueType("DEPT")}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${issueType === "DEPT" ? "bg-purple-600 text-white shadow" : "bg-muted text-muted-foreground"}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border ${issueType === "DEPT" ? 'bg-white border-transparent' : 'border-current'}`} />
                                        Department
                                    </button>
                                </div>
                            </div>

                            {issueType === "JOB" ? (
                                <div className="space-y-2">
                                    <Label>Select Job Card</Label>
                                    <Select value={selectedJobValue} onValueChange={handleJobChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search or Select Job..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {jobs.map(j => (
                                                <SelectItem key={j.value} value={j.value}>
                                                    {j.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Department Name</Label>
                                    <CreatableCombobox
                                        options={deptOptions}
                                        value={department}
                                        onSelect={(val) => setDepartment(val)}
                                        onCreate={(val) => {
                                            setDepartment(val);
                                            // Optimistically add to list
                                            setDeptOptions(prev => [...prev, { label: val, value: val }]);
                                        }}
                                        placeholder="Select or Create Department..."
                                        emptyText="No department found."
                                    />
                                    <p className="text-xs text-muted-foreground">Select existing or type to create new.</p>
                                </div>
                            )}

                            {issueType === "JOB" && selectedJob && (
                                <div className="rounded-md bg-muted p-4 text-sm border shadow-sm">
                                    <h4 className="font-semibold text-primary mb-2 flex justify-between">
                                        {selectedJob.jobCardNo}
                                        <span className="text-xs font-normal text-muted-foreground">{selectedJob.client}</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>Job Name:</strong> {selectedJob.jobName}</p>
                                    <p className="text-xs text-muted-foreground mb-1"><strong>Part:</strong> {selectedContent?.contentName || "Main"}</p>
                                    <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                                        <p>Req. Paper: <span className="font-medium text-foreground">{selectedContent?.baseKg || 0} Kg</span></p>
                                        <p>Req. Film: <span className="font-medium text-foreground">{selectedContent?.totalRunningMtr || 0} Mtr</span></p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Scan */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Scan QR Code (Batch/GRN)</Label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center h-10 w-10 bg-muted rounded-md border text-muted-foreground">
                                        <ScanLine className="h-5 w-5" />
                                    </div>
                                    <Input
                                        ref={scanInputRef}
                                        placeholder="Scan QR or Type Batch No..."
                                        value={scanCode}
                                        onChange={e => setScanCode(e.target.value)}
                                        onKeyDown={handleScan}
                                        className="text-lg flex-1 font-mono tracking-wider"
                                        autoFocus
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0"
                                        onClick={() => setShowScanner(true)}
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Press Enter after scanning or typing Batch No.</p>
                            </div>
                        </div>
                    </div>

                    {/* Camera Scanner Modal */}
                    <Dialog open={showScanner} onOpenChange={setShowScanner}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Scan QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="aspect-square bg-black relative rounded-lg overflow-hidden flex items-center justify-center">
                                {showScanner && (
                                    <QRScanner
                                        onScan={(text) => {
                                            if (text) {
                                                processScan(text);
                                                setShowScanner(false);
                                            }
                                        }}
                                        onError={(err) => console.log(err)}
                                    />
                                )}
                                <div className="absolute inset-0 border-2 border-white/50 m-12 rounded-lg pointer-events-none animate-pulse"></div>
                            </div>
                            <Button variant="outline" onClick={() => setShowScanner(false)} className="w-full">
                                Close Camera
                            </Button>
                        </DialogContent>
                    </Dialog>

                    {/* Scanned Items Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted hover:bg-muted">
                                    <TableHead className="w-[30%]">Item Details</TableHead>
                                    <TableHead className="w-[15%]">Stock</TableHead>
                                    <TableHead className="w-[20%]">Issue Qty</TableHead>
                                    <TableHead className="w-[30%]">Remark</TableHead>
                                    <TableHead className="w-[5%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scannedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Scan items or enter Batch No to add to list
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scannedItems.map((item, idx) => {
                                        // Lookup max stock dynamically
                                        const stockItem = grnStorage.getItemByBatch(item.batchNo);
                                        const maxQty = stockItem ? (stockItem.remainingQty ?? stockItem.receivedQty) : 0;

                                        return (
                                            <TableRow key={idx} className="border-b last:border-0 hover:bg-muted/5">
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-sm text-foreground uppercase">{item.itemName}</span>
                                                        <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                            BATCH: {item.batchNo}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex items-center gap-1 font-bold text-sm text-foreground">
                                                        {maxQty} <span className="text-xs font-normal text-muted-foreground">{item.uom}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="h-9 w-full font-bold text-blue-600 bg-blue-50/50 border-blue-200 focus-visible:ring-blue-500"
                                                                value={item.issuedQty}
                                                                onChange={(e) => updateQty(idx, e.target.value)}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground text-right block px-1">
                                                            {item.uom}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Input
                                                        className="h-9 text-xs"
                                                        placeholder="Notes..."
                                                        value={item.remark || ""}
                                                        onChange={(e) => {
                                                            const newItems = [...scannedItems];
                                                            newItems[idx].remark = e.target.value;
                                                            setScannedItems(newItems);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        onClick={() => removeItem(idx)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </div>

                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={scannedItems.length === 0}
                        variant="gradient-blue"
                        className="border-0 shadow-sm"
                    >
                        Confirm Issue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
