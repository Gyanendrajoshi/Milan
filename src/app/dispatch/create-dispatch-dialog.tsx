"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DispatchJobRow } from "./columns";
import { dispatchStorage, DispatchEntry } from "@/services/dispatch-storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Truck, Pencil, Package, Trash2, X } from "lucide-react";
import { PackagingDetailsDialog } from "./packaging-details-dialog";

interface CreateDispatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedJobs: DispatchJobRow[];
    onSuccess: () => void;
}

interface PackagingItem {
    jobId: string;
    jobCardNo: string;
    clientName: string;
    jobName: string;
    dispatchQty: number;
    numBoxes: number;
    bundlesPerBox: number;
    qtyPerBundle: number;
    weightPerBox: number;
    date: string;
}

export function CreateDispatchDialog({ open, onOpenChange, selectedJobs, onSuccess }: CreateDispatchDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Sub Dialog State
    const [packagingOpen, setPackagingOpen] = useState(false);
    const [activePackagingJob, setActivePackagingJob] = useState<DispatchJobRow | null>(null);

    // Header Details
    const [challanNo, setChallanNo] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");

    // Line Items State
    const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({});
    const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);

    // Initialize Form on Open
    useEffect(() => {
        if (open) {
            setChallanNo(dispatchStorage.generateChallanNo());
            setDate(format(new Date(), "yyyy-MM-dd"));

            const initialQtys: Record<string, number> = {};
            selectedJobs.forEach(job => {
                initialQtys[job.id] = job.pendingQty;
            });
            setDispatchQuantities(initialQtys);

            setPackagingItems([]); // Reset List
        }
    }, [open, selectedJobs]);

    const handleQtyChange = (jobId: string, val: string, max: number) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
            setDispatchQuantities(prev => ({ ...prev, [jobId]: 0 }));
            return;
        }
        setDispatchQuantities(prev => ({ ...prev, [jobId]: num }));
    };

    const handlePackagingSave = (jobId: string, totalQty: number, packData: any) => {
        // 1. Update Top Table Qty
        setDispatchQuantities(prev => ({ ...prev, [jobId]: totalQty }));

        // 2. Add/Update Packaging List Item
        const job = selectedJobs.find(j => j.id === jobId);
        if (!job) return;

        const newItem: PackagingItem = {
            jobId: job.id,
            jobCardNo: job.jobCardNo,
            clientName: job.clientName,
            jobName: job.jobName,
            dispatchQty: totalQty,
            numBoxes: packData.numBoxes,
            bundlesPerBox: packData.bundlesPerBox,
            qtyPerBundle: packData.qtyPerBundle,
            weightPerBox: packData.weightPerBox,
            date: format(new Date(), "d/M/yyyy") // Current Date
        };

        setPackagingItems(prev => {
            const existingIdx = prev.findIndex(p => p.jobId === jobId);
            if (existingIdx > -1) {
                const newArr = [...prev];
                newArr[existingIdx] = newItem;
                return newArr;
            }
            return [...prev, newItem];
        });

        toast.success(`Packaging Added for ${job.jobCardNo}`);
    };

    const removePackagingItem = (jobId: string) => {
        setPackagingItems(prev => prev.filter(p => p.jobId !== jobId));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const items = selectedJobs.map(job => ({
                jobId: job.id,
                jobCardNo: job.jobCardNo,
                jobName: job.jobName,
                clientName: job.clientName,
                orderQty: job.orderQty,
                dispatchQty: dispatchQuantities[job.id] || 0
            })).filter(i => i.dispatchQty > 0);

            if (items.length === 0) {
                toast.error("No quantities entered for dispatch");
                setIsLoading(false);
                return;
            }

            const entry: DispatchEntry = {
                id: challanNo,
                challanNo,
                date,
                vehicleNo,
                driverName,
                items,
                status: "Dispatched",
                createdAt: Date.now()
            };

            dispatchStorage.saveDispatch(entry);
            toast.success("Dispatch Created Successfully", {
                description: `Challan ${challanNo} generated with ${items.length} items.`
            });

            onSuccess();
            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save dispatch");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] md:max-w-7xl p-0 overflow-hidden bg-white block select-none">
                <DialogHeader className="p-0 border-b-0">
                    <div className="bg-theme-gradient-r px-6 py-4 flex justify-between items-center shadow-md shrink-0">
                        <DialogTitle className="text-xl font-bold flex items-center gap-3 text-white">
                            <div className="bg-white/20 p-2 rounded-lg text-white backdrop-blur-sm">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="leading-tight">Delivery Challan</span>
                                <span className="text-[10px] font-medium text-blue-100 uppercase tracking-widest opacity-90">
                                    Create delivery challan for {selectedJobs.length} Job Card(s)
                                </span>
                            </div>
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8 overflow-y-auto max-h-[75vh] min-h-[400px]">

                    {/* Section 1: Job Card Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-bold pb-2 border-b-2 border-slate-100">
                            <div className="bg-blue-50 p-1.5 rounded text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <span className="text-base tracking-tight">Job Card Details</span>
                        </div>

                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden max-h-[300px] overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="h-10 hover:bg-transparent border-b border-slate-100">
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-4">Job Card</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Name</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Total Qty</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Pending</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider w-[160px] text-right">Dispatch Qty</TableHead>
                                        <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center w-[120px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedJobs.map(job => (
                                        <TableRow key={job.id} className="h-14 hover:bg-slate-50 border-slate-100">
                                            <TableCell className="font-semibold text-sm text-blue-700 pl-4">{job.jobCardNo}</TableCell>
                                            <TableCell className="text-xs font-semibold text-slate-700">{job.clientName}</TableCell>
                                            <TableCell className="text-xs text-slate-600 font-medium">{job.jobName}</TableCell>
                                            <TableCell className="text-right text-sm font-bold text-slate-700">
                                                {job.orderQty?.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-bold text-orange-600">
                                                {job.pendingQty?.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Input
                                                        type="number"
                                                        value={dispatchQuantities[job.id] ?? ''}
                                                        onChange={(e) => handleQtyChange(job.id, e.target.value, job.pendingQty)}
                                                        className="h-9 w-36 text-right font-bold text-blue-700 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all rounded-md"
                                                        placeholder="Qty"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-md shadow-sm"
                                                    onClick={() => {
                                                        setActivePackagingJob(job);
                                                        setPackagingOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Section 2: Packaging List */}
                    {packagingItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-800 font-bold pb-2 border-b-2 border-slate-100">
                                <div className="bg-blue-50 p-1.5 rounded text-blue-600">
                                    <Package className="h-4.5 w-4.5" />
                                </div>
                                <span className="text-base tracking-tight">Packaging List ({packagingItems.length})</span>
                            </div>

                            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="h-10 hover:bg-transparent border-b border-slate-100">
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-4">Job Card</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Name</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center bg-slate-100/50">Dispatch Qty</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Boxes</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Bundles</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Pcs/Bundle</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Weight</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packagingItems.map(item => (
                                            <TableRow key={item.jobId} className="h-12 hover:bg-slate-50 border-slate-100">
                                                <TableCell className="font-medium text-xs text-slate-700 pl-4">{item.jobCardNo}</TableCell>
                                                <TableCell className="text-xs text-slate-600">{item.clientName}</TableCell>
                                                <TableCell className="text-xs text-slate-600">{item.jobName}</TableCell>
                                                <TableCell className="text-center text-sm font-bold text-blue-700 bg-slate-50">{item.dispatchQty.toLocaleString()}</TableCell>
                                                <TableCell className="text-center text-xs text-slate-700 font-medium">{item.numBoxes}</TableCell>
                                                <TableCell className="text-center text-xs text-slate-700 font-medium">{item.bundlesPerBox}</TableCell>
                                                <TableCell className="text-right text-xs text-slate-700">{item.qtyPerBundle}</TableCell>
                                                <TableCell className="text-right text-xs text-slate-700">{item.weightPerBox} kg</TableCell>
                                                <TableCell className="text-xs text-slate-500">{item.date}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-blue-600 hover:bg-blue-50 rounded-full"
                                                            onClick={() => {
                                                                const job = selectedJobs.find(j => j.id === item.jobId);
                                                                if (job) {
                                                                    setActivePackagingJob(job);
                                                                    setPackagingOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-red-600 hover:bg-red-50 rounded-full"
                                                            onClick={() => removePackagingItem(item.jobId)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Transport Information */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-800 font-bold pb-2 border-b-2 border-slate-100">
                            <div className="bg-blue-50 p-1.5 rounded text-blue-600">
                                <Truck className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-base tracking-tight">Transport Information</span>
                        </div>

                        <div className="bg-white border rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Challan / Invoice No</Label>
                                <Input
                                    value={challanNo}
                                    onChange={e => setChallanNo(e.target.value)}
                                    className="h-10 font-mono text-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Enter No."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vehicle Number</Label>
                                <Input
                                    value={vehicleNo}
                                    onChange={e => setVehicleNo(e.target.value)}
                                    placeholder="MH-01-AB-1234"
                                    className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target / Driver Name</Label>
                                <Input
                                    value={driverName}
                                    onChange={e => setDriverName(e.target.value)}
                                    placeholder="Driver Name"
                                    className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t flex items-center justify-end gap-3 z-10 relative">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-8 border-slate-300 text-slate-600 font-bold hover:bg-slate-100 uppercase tracking-wide text-xs">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} variant="gradient-blue" className="h-10 px-8 uppercase tracking-wide text-xs">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Generate Challan
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Packaging Sub-Dialog */}
            <PackagingDetailsDialog
                open={packagingOpen}
                onOpenChange={setPackagingOpen}
                job={activePackagingJob}
                onSave={handlePackagingSave}
            />
        </Dialog>
    );
}
