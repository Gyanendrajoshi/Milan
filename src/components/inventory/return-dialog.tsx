"use client";

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

import { issueStorage } from "@/services/issue-storage";
import { returnStorage } from "@/services/return-storage";
import { MaterialIssue } from "@/types/material-issue";
import { ReturnedItem } from "@/types/material-return";
import { grnStorage } from "@/services/grn-storage";

interface ReturnDialogProps {
    onReturnComplete: () => void;
}

const RETURN_REASONS = [
    "Excess Material",
    "Job Cancelled",
    "Material Damaged",
    "Wrong Material Issued",
    "Quality Issue",
    "Other"
];

const QUALITY_STATUS = [
    { value: "OK", label: "OK" },
    { value: "DAMAGED", label: "Damaged" },
    { value: "PENDING_INSPECTION", label: "Pending Inspection" }
];

export function ReturnDialog({ onReturnComplete }: ReturnDialogProps) {
    const [open, setOpen] = useState(false);
    const [issues, setIssues] = useState<MaterialIssue[]>([]);

    const [scanCode, setScanCode] = useState("");
    const [selectedIssue, setSelectedIssue] = useState<MaterialIssue | null>(null);
    const [returnItems, setReturnItems] = useState<ReturnedItem[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            loadIssues();
            setTimeout(() => scanInputRef.current?.focus(), 500);
        } else {
            // Reset state on close
            setSelectedIssue(null);
            setReturnItems([]);
            setScanCode("");
        }
    }, [open]);

    const loadIssues = () => {
        const allIssues = issueStorage.getAll();
        setIssues(allIssues);
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
                if (parsed.id || parsed.issueId) {
                    searchCode = parsed.id || parsed.issueId;
                }
            }
        } catch (e) {
            console.log("QR Parse error, treating as raw", e);
        }

        // Find Issue by ID
        const issue = issues.find(i => i.id === searchCode);
        if (!issue) {
            toast.error("Issue not found. Please check the Issue ID.");
            return;
        }

        setSelectedIssue(issue);

        // Populate return items from issue
        const items: ReturnedItem[] = issue.items.map(item => {
            // Calculate previously returned quantity
            const previouslyReturned = returnStorage.getTotalReturnedQty(issue.id, item.grnItemId);

            return {
                issueItemId: item.grnItemId, // Using grnItemId as unique identifier
                grnItemId: item.grnItemId,
                itemCode: item.itemCode,
                itemName: item.itemName,
                batchNo: item.batchNo,
                issuedQty: item.issuedQty,
                returnedQty: item.issuedQty - previouslyReturned, // Default to remaining qty
                previouslyReturnedQty: previouslyReturned,
                uom: item.uom,
                rollWidth: item.rollWidth,
                gsm: item.gsm,
                qualityStatus: 'OK',
                returnReason: 'Excess Material'
            };
        });

        setReturnItems(items);
        toast.success(`Loaded Issue: ${issue.id}`);
    };

    const updateReturnQty = (index: number, val: string) => {
        const qty = parseFloat(val);
        if (isNaN(qty) || qty < 0) return;

        const newItems = [...returnItems];
        const item = newItems[index];

        // Validate: returnedQty + previouslyReturnedQty <= issuedQty
        const maxAllowed = item.issuedQty - item.previouslyReturnedQty;
        if (qty > maxAllowed) {
            toast.error(`Max returnable: ${maxAllowed} ${item.uom}`);
            return;
        }

        newItems[index].returnedQty = qty;
        setReturnItems(newItems);
    };

    const updateQualityStatus = (index: number, status: string) => {
        const newItems = [...returnItems];
        newItems[index].qualityStatus = status as any;
        setReturnItems(newItems);
    };

    const updateReturnReason = (index: number, reason: string) => {
        const newItems = [...returnItems];
        newItems[index].returnReason = reason;
        setReturnItems(newItems);
    };

    const updateRemark = (index: number, remark: string) => {
        const newItems = [...returnItems];
        newItems[index].remark = remark;
        setReturnItems(newItems);
    };

    const removeItem = (index: number) => {
        setReturnItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!selectedIssue) {
            toast.error("Please scan/select an Issue first");
            return;
        }
        if (returnItems.length === 0) {
            toast.error("No items to return");
            return;
        }

        // Filter out items with zero return quantity
        const validItems = returnItems.filter(item => item.returnedQty > 0);
        if (validItems.length === 0) {
            toast.error("Please enter return quantities");
            return;
        }

        try {
            const returnData = {
                returnDate: new Date().toISOString(),
                issueId: selectedIssue.id,
                issueDate: selectedIssue.issueDate,
                jobCardNo: selectedIssue.jobCardNo,
                department: selectedIssue.department,
                items: validItems,
                returnedBy: "Admin"
            };

            returnStorage.save(returnData);
            toast.success("Material Returned Successfully");
            setOpen(false);
            onReturnComplete();

        } catch (e) {
            console.error(e);
            toast.error("Failed to save return");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient-blue" className="border-0 shadow-lg shadow-black/10 transition-all font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Return Material
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl min-h-[70vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white rounded-t-lg">
                    <DialogTitle className="text-xl font-bold text-white">Return Material</DialogTitle>
                </DialogHeader>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto">

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Left: Issue Selection */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Scan Issue QR Code or Enter Issue ID</Label>
                                <div className="flex gap-2">
                                    <div className="flex items-center justify-center h-10 w-10 bg-muted rounded-md border text-muted-foreground">
                                        <ScanLine className="h-5 w-5" />
                                    </div>
                                    <Input
                                        ref={scanInputRef}
                                        placeholder="Scan QR or Type Issue ID (MI00001/25-26)..."
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
                                <p className="text-xs text-muted-foreground">Press Enter after scanning or typing Issue ID.</p>
                            </div>

                            {selectedIssue && (
                                <div className="rounded-md bg-muted p-4 text-sm border shadow-sm">
                                    <h4 className="font-semibold text-primary mb-2 flex justify-between">
                                        {selectedIssue.id}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {new Date(selectedIssue.issueDate).toLocaleDateString()}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        <strong>Job/Dept:</strong> {selectedIssue.jobCardNo || selectedIssue.department}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        <strong>Items:</strong> {selectedIssue.items.length}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right: Manual Selection Fallback */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Or Select from List</Label>
                                <Select
                                    value={selectedIssue?.id || ""}
                                    onValueChange={(val) => {
                                        const issue = issues.find(i => i.id === val);
                                        if (issue) {
                                            processScan(val);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Issue..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {issues.map(issue => (
                                            <SelectItem key={issue.id} value={issue.id}>
                                                {issue.id} - {issue.jobCardNo || issue.department}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Select an existing issue to return materials.</p>
                            </div>
                        </div>
                    </div>

                    {/* Camera Scanner Modal */}
                    <Dialog open={showScanner} onOpenChange={setShowScanner}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Scan Issue QR Code</DialogTitle>
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

                    {/* Return Items Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted hover:bg-muted">
                                    <TableHead className="w-[20%]">Item Details</TableHead>
                                    <TableHead className="w-[10%]">Issued</TableHead>
                                    <TableHead className="w-[10%]">Prev. Ret.</TableHead>
                                    <TableHead className="w-[12%]">Return Qty</TableHead>
                                    <TableHead className="w-[15%]">Quality</TableHead>
                                    <TableHead className="w-[15%]">Reason</TableHead>
                                    <TableHead className="w-[15%]">Remark</TableHead>
                                    <TableHead className="w-[3%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Scan or select an Issue to load items
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    returnItems.map((item, idx) => {
                                        const maxReturnable = item.issuedQty - item.previouslyReturnedQty;

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
                                                        {item.issuedQty} <span className="text-xs font-normal text-muted-foreground">{item.uom}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        {item.previouslyReturnedQty} <span className="text-xs">{item.uom}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Input
                                                            type="number"
                                                            className="h-9 w-full font-bold text-green-600 bg-green-50/50 border-green-200 focus-visible:ring-green-500"
                                                            value={item.returnedQty}
                                                            onChange={(e) => updateReturnQty(idx, e.target.value)}
                                                            max={maxReturnable}
                                                        />
                                                        <span className="text-[10px] text-muted-foreground text-right block px-1">
                                                            Max: {maxReturnable} {item.uom}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Select
                                                        value={item.qualityStatus}
                                                        onValueChange={(val) => updateQualityStatus(idx, val)}
                                                    >
                                                        <SelectTrigger className="h-9 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {QUALITY_STATUS.map(q => (
                                                                <SelectItem key={q.value} value={q.value}>
                                                                    {q.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Select
                                                        value={item.returnReason}
                                                        onValueChange={(val) => updateReturnReason(idx, val)}
                                                    >
                                                        <SelectTrigger className="h-9 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {RETURN_REASONS.map(reason => (
                                                                <SelectItem key={reason} value={reason}>
                                                                    {reason}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <Input
                                                        className="h-9 text-xs"
                                                        placeholder="Notes..."
                                                        value={item.remark || ""}
                                                        onChange={(e) => updateRemark(idx, e.target.value)}
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
                        disabled={returnItems.length === 0 || !selectedIssue}
                        variant="gradient-blue"
                        className="border-0 shadow-sm"
                    >
                        Confirm Return
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
