"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { MaterialConsumptionDialog } from "@/components/production/material-consumption-dialog";

import { storage } from "@/services/storage";
import { productionStorage } from "@/services/production-storage";
import { ProductionEntry, ProductionLog } from "@/types/production";
import { getOperators, addOperator, Operator } from "@/services/operator-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Plus, Trash2, Box, Eye, Clock, Loader2, PlusCircle, History as HistoryIcon, X } from "lucide-react";
import { toast } from "sonner";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";

// Machines List (Hardcoded for now, ideally from Master)
const MACHINES = [
    "Rotogravure 8 Color",
    "Flexo 4 Color",
    "Offset 6 Color",
    "Slitting Machine 1",
    "Slitting Machine 2",
    "Cutting Machine",
    "Pouching Machine",
    "Inspection Machine"
];

// Helper to calculate total produced for a specific process/content
const getProcessStats = (logs: ProductionLog[], processId: string, contentId?: number) => {
    const relevantLogs = logs.filter(l =>
        l.processId === processId &&
        l.contentId === contentId
    );
    return {
        produced: relevantLogs.reduce((sum, l) => sum + (l.qtyProduced || 0), 0),
        wastage: relevantLogs.reduce((sum, l) => sum + (l.wastageQty || 0), 0),
        count: relevantLogs.length,
        logs: relevantLogs,
    };
};

export default function ProductionEntryPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string; // This is the JobID (e.g. JC123)

    const [isLoading, setIsLoading] = useState(true);
    const [job, setJob] = useState<any>(null);
    const [productionEntry, setProductionEntry] = useState<ProductionEntry | null>(null);
    const [selectedContentId, setSelectedContentId] = useState<string | number>("main");
    const [isConsumptionOpen, setIsConsumptionOpen] = useState(false);



    // Master Data
    const [operators, setOperators] = useState<Operator[]>([]);

    // Row States - Map of ProcessID -> Input Values
    const [rowStates, setRowStates] = useState<Record<string, {
        machine?: string;
        operator?: string;
        qty: string; // Keep as string for input
        wastage: string;
        unit: string; // Defaults to Kg
        remarks: string;
        startTime: string;
        endTime: string;
        status: string;
    }>>({});

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = () => {
        setIsLoading(true);
        // 1. Load Job (Estimation)
        const allJobs = storage.getEstimations();
        const foundJob = allJobs.find(j => j.id === id);

        if (!foundJob) {
            toast.error("Job not found");
            router.push("/production");
            return;
        }

        setJob(foundJob);

        // 2. Load Production Entry
        let entry = productionStorage.getById(foundJob.id);
        if (!entry) {
            // Init if not exists
            entry = productionStorage.initForJob(foundJob);
        }
        setProductionEntry(entry);

        // 3. Load Operators
        setOperators(getOperators());

        // 4. Set Default Content
        if ((foundJob as any).contents && (foundJob as any).contents.length > 0) {
            setSelectedContentId((foundJob as any).contents[0].id);
        }

        setIsLoading(false);
    };

    const handleAddOperator = (name: string) => {
        const newOp = addOperator(name);
        setOperators([...operators, newOp]);
        return newOp.id; // Return ID if needed
    };

    // --- Derived Data ---
    const currentContent = useMemo(() => {
        if (!job) return null;
        if (selectedContentId === "main") return job; // Fallback for single content
        return (job as any).contents?.find((c: any) => c.id === selectedContentId) || job;
    }, [job, selectedContentId]);

    const activeProcesses = useMemo(() => {
        if (!currentContent) return [];
        return currentContent.processCosts || [];
    }, [currentContent]);

    // Required Logic
    const totalUps = currentContent?.totalUps || 1;
    const requiredSheets = Math.ceil((job?.quantity || 0) / totalUps);
    // Add wastage to required? The user image says "Required Sheets: 40,140 (incl. 100 wastage)"
    // Typically OrderQty is final pieces. 
    // If order is 10000, and 2 ups, we need 5000 sheets.
    // Plus wastage... let's roughly assume provided OrderQty is pieces.

    // --- Actions ---

    const handleInputChange = (processId: string, field: string, value: any) => {
        setRowStates(prev => ({
            ...prev,
            [processId]: {
                ...(prev[processId] || { qty: "", wastage: "", unit: "Kg", remarks: "", startTime: "", endTime: "", status: "Completed" }),
                [field]: value
            }
        }));
    };

    const handleAddLog = (processId: string, processName: string) => {
        const state = rowStates[processId];
        if (!state) return;

        if (!state.qty || parseFloat(state.qty) <= 0) {
            toast.error("Please enter a valid Quantity");
            return;
        }
        if (!state.machine) {
            toast.error("Please select a Machine");
            return;
        }
        if (!state.operator) {
            toast.error("Please select an Operator");
            return;
        }

        // Validations
        const qty = parseFloat(state.qty);
        const wastage = parseFloat(state.wastage || "0");

        if (qty < 0 || wastage < 0) {
            toast.error("Quantity cannot be negative");
            return;
        }

        const newLog: ProductionLog = {
            id: `LOG-${Date.now()}`,
            date: new Date().toISOString(),
            contentId: selectedContentId === "main" ? undefined : (selectedContentId as number),
            processId: processId,
            operationName: processName,
            machineName: state.machine,
            operatorName: state.operator, // Should resolve name? Using value for now (which is name in Combobox usually)
            qtyProduced: parseFloat(state.qty),
            wastageQty: parseFloat(state.wastage || "0"),
            unit: state.unit || "Kg", // Save Unit
            remarks: state.remarks,
            startTime: state.startTime ? new Date().toISOString().split('T')[0] + ' ' + state.startTime : undefined, // simplified
            endTime: state.endTime ? new Date().toISOString().split('T')[0] + ' ' + state.endTime : undefined,
            status: state.status as any || 'Completed'
        };

        if (productionEntry) {
            const updatedEntry = productionStorage.addLog(productionEntry.jobId, newLog);
            if (updatedEntry) {
                setProductionEntry(updatedEntry); // Local Update

                // Check Over-production Warning
                if (updatedEntry.totalProduced > (job.quantity || 0)) {
                    toast.warning(`Note: Total Produced (${updatedEntry.totalProduced}) exceeds Order Qty (${job.quantity})`);
                }

                toast.success("Production Log Added");

                // Reset Form (Keep Machine/Operator for speed?)           
                setRowStates(prev => ({
                    ...prev,
                    [processId]: { ...prev[processId], qty: "", wastage: "", remarks: "" }
                }));
            }
        }
    };

    const handleDeleteLog = (logId: string) => {
        if (productionEntry) {
            const updatedEntry = productionStorage.deleteLog(productionEntry.jobId, logId);
            if (updatedEntry) {
                setProductionEntry(updatedEntry);
                toast.success("Log entry deleted successfully.");
            } else {
                toast.error("Failed to delete log entry.");
            }
        }
    };

    const handleLogUpdate = (logId: string, field: keyof ProductionLog, value: any) => {
        if (!productionEntry) return;

        // Optimistic UI Update (optional, but safer to let storage handle it and propagate back)
        // We will call storage and set state
        const updatedEntry = productionStorage.updateLog(productionEntry.jobId, logId, { [field]: value });
        if (updatedEntry) {
            setProductionEntry(updatedEntry);
            // toast.success("Log updated"); // Too noisy for every field
        }
    };



    if (isLoading || !job) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none shrink-0">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="space-y-0.5">
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                Production Entry
                                <Badge variant="secondary" className="bg-white/20 text-white border-0 font-mono text-xs px-1.5 py-0.5 pointer-events-none">
                                    {job.jobCardNo}
                                </Badge>
                            </CardTitle>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={productionEntry?.status === 'Completed' ? "bg-green-500/20 text-green-100 border-green-500/50" : "bg-white/10 text-white border-white/20"}>
                                {productionEntry?.status || "Pending"}
                            </Badge>
                            <div className="hidden sm:block text-xs text-blue-100/80">
                                {job.jobName}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto p-0 bg-slate-50/50 flex flex-col">
                    {/* Info Section - Styled like a Toolbar/Filter area */}
                    <div className="bg-white p-4 border-b border-border shrink-0">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Box className="h-5 w-5 text-blue-600" />
                                <span className="font-bold text-sm">Production Operations</span>
                            </div>

                            <div className="flex items-center gap-6 text-xs">
                                <div className="bg-blue-50/50 px-3 py-1.5 rounded border border-blue-100/50">
                                    <span className="text-blue-600 font-semibold">Order Quantity:</span>
                                    <span className="ml-2 font-bold text-blue-800">{Number(job.quantity).toLocaleString()}</span>
                                </div>
                                <div className="text-muted-foreground">
                                    <span>Required Sheets: </span>
                                    <span className="font-medium text-foreground">{requiredSheets.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="w-full md:w-64">
                                {job.contents && job.contents.length > 0 ? (
                                    <Select
                                        value={String(selectedContentId)}
                                        onValueChange={(v) => setSelectedContentId(v === "main" ? "main" : Number(v))}
                                    >
                                        <SelectTrigger className="bg-background border-input h-8 text-xs">
                                            <SelectValue placeholder="Select Content" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {job.contents.map((c: any) => (
                                                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                                                    {c.contentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="text-xs text-muted-foreground italic text-right px-2">Single Content Job</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Operations Table - Styled to match DataTable exactly */}
                    <div className="flex-1 overflow-auto p-4">
                        <div className="rounded-md border border-border bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-xs">
                                <thead className="bg-tertiary/20 border-b border-border">
                                    <tr>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-48">Operation</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-40">Machine</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-40">Operator</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-20">Qty</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-20">Wastage</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-24">Unit</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground min-w-[100px]">Remarks</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-36">Start Time</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-36">End Time</th>
                                        <th className="p-2 text-left font-bold text-[11px] tracking-wider text-foreground w-24">Status</th>
                                        <th className="p-2 text-center font-bold text-[11px] tracking-wider text-foreground w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {activeProcesses.map((proc: any, idx: number) => {
                                        const stats = getProcessStats(productionEntry?.logs || [], proc.processId, selectedContentId === "main" ? undefined : Number(selectedContentId));
                                        const rowState = rowStates[proc.processId] || {};
                                        const executedLogs = productionEntry?.logs.filter(l => l.processId === proc.processId && (selectedContentId === "main" ? l.contentId === undefined : l.contentId === Number(selectedContentId))) || [];

                                        // Sort logs by date desc? Or asc? "niche next aa jaye" implies append (ASC) or stack?
                                        // "add kr kr niche next aa jaye" -> add one, it comes below. So likely latest at bottom? Or latest below the input? 
                                        // Visualizing: Input is ROW 1. Logs below. 
                                        // If I add 1, it appears. Add 2, it appears below 1. 
                                        // Let's sort by Date Added (Implicit logic is push, so order is preserved). 

                                        return (
                                            <Fragment key={proc.processId + idx}>
                                                {/* INPUT ROW */}
                                                <tr className="group border-b border-border hover:bg-muted/50 transition-colors bg-blue-50/10">
                                                    <td className="p-2 align-top text-[11px] font-medium text-foreground">
                                                        <div className="font-bold">{proc.processName}</div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">Req: {Math.ceil(proc.quantity).toLocaleString()}</div>

                                                        {stats.produced > 0 && (
                                                            <div className="mt-1 text-[10px] font-bold text-green-600 bg-green-50/50 px-1 rounded inline-flex items-center gap-1 border border-green-100">
                                                                <HistoryIcon className="h-2.5 w-2.5" />
                                                                {stats.produced.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Select value={rowState.machine} onValueChange={(v) => handleInputChange(proc.processId, "machine", v)}>
                                                            <SelectTrigger className="h-7 text-[11px] border-input">
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {MACHINES.map(m => <SelectItem key={m} value={m} className="text-[11px]">{m}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <CreatableCombobox
                                                            options={operators.map(op => ({ label: op.name, value: op.name }))}
                                                            value={rowState.operator}
                                                            onSelect={(v) => handleInputChange(proc.processId, "operator", v)}
                                                            onCreate={(v) => {
                                                                handleAddOperator(v);
                                                                handleInputChange(proc.processId, "operator", v);
                                                            }}
                                                            placeholder="Operator"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="h-7 text-[11px] font-mono px-2 border-blue-200 focus:border-blue-400"
                                                            value={rowState.qty || ""}
                                                            onChange={(e) => handleInputChange(proc.processId, "qty", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="h-7 text-[11px] font-mono px-2"
                                                            value={rowState.wastage || ""}
                                                            onChange={(e) => handleInputChange(proc.processId, "wastage", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Select value={rowState.unit || "Kg"} onValueChange={(v) => handleInputChange(proc.processId, "unit", v)}>
                                                            <SelectTrigger className="h-7 text-[11px] w-20 bg-background">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Kg" className="text-[11px]">Kg</SelectItem>
                                                                <SelectItem value="Sq. Mtr" className="text-[11px]">Sq. Mtr</SelectItem>
                                                                <SelectItem value="Run. Mtr" className="text-[11px]">Run. Mtr</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Input
                                                            placeholder="Rem."
                                                            className="h-7 text-[11px]"
                                                            value={rowState.remarks || ""}
                                                            onChange={(e) => handleInputChange(proc.processId, "remarks", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Input
                                                            type="datetime-local"
                                                            className="h-7 text-[10px] w-full px-1 font-mono"
                                                            value={rowState.startTime || ""}
                                                            onChange={(e) => handleInputChange(proc.processId, "startTime", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Input
                                                            type="datetime-local"
                                                            className="h-7 text-[10px] w-full px-1 font-mono"
                                                            value={rowState.endTime || ""}
                                                            onChange={(e) => handleInputChange(proc.processId, "endTime", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <Select value={rowState.status || "Completed"} onValueChange={(v) => handleInputChange(proc.processId, "status", v)}>
                                                            <SelectTrigger className="h-7 text-[10px] w-24 bg-amber-50 text-amber-600 border-amber-200">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Running" className="text-[11px]">Running</SelectItem>
                                                                <SelectItem value="Completed" className="text-[11px]">Completed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-2 align-top text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-slate-600"
                                                                onClick={() => handleInputChange(proc.processId, "qty", "")}
                                                                title="Clear Inputs"
                                                            >
                                                                <X className="h-4 w-4 opacity-50" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                                                                onClick={() => handleAddLog(proc.processId, proc.processName)}
                                                                title="Add Log"
                                                            >
                                                                <PlusCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* INLINE LOGS */}
                                                {executedLogs.map((log) => (
                                                    <tr key={log.id} className="bg-slate-50/40 border-b border-border/50 hover:bg-slate-100/50">
                                                        {/* ... Log Columns ... */}
                                                        {/* Re-implementing compact row to be safe */}
                                                        <td className="p-2 pl-4 text-[10px] italic border-l-4 border-l-blue-100 flex flex-col justify-center">
                                                            <span className="opacity-70">Log: {new Date(log.date).toLocaleDateString()}</span>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Select value={log.machineName} onValueChange={(v) => handleLogUpdate(log.id, "machineName", v)}>
                                                                <SelectTrigger className="h-6 text-[10px] border-slate-200 bg-transparent">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {MACHINES.map(m => <SelectItem key={m} value={m} className="text-[10px]">{m}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <CreatableCombobox
                                                                options={operators.map(op => ({ label: op.name, value: op.name }))}
                                                                value={log.operatorName}
                                                                onSelect={(v) => handleLogUpdate(log.id, "operatorName", v)}
                                                                onCreate={(v) => {
                                                                    handleAddOperator(v);
                                                                    handleLogUpdate(log.id, "operatorName", v);
                                                                }}
                                                                placeholder="Op"
                                                                className="h-6 text-[10px] border-slate-200 bg-transparent"
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Input
                                                                type="number"
                                                                className="h-6 text-[10px] font-mono px-1 border-slate-200 bg-transparent text-slate-700 font-bold"
                                                                defaultValue={log.qtyProduced}
                                                                onBlur={(e) => handleLogUpdate(log.id, "qtyProduced", parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Input
                                                                type="number"
                                                                className="h-6 text-[10px] font-mono px-1 border-slate-200 bg-transparent text-red-500"
                                                                defaultValue={log.wastageQty}
                                                                onBlur={(e) => handleLogUpdate(log.id, "wastageQty", parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Select value={log.unit} onValueChange={(v) => handleLogUpdate(log.id, "unit", v)}>
                                                                <SelectTrigger className="h-6 text-[10px] w-20 border-slate-200 bg-transparent">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Kg" className="text-[10px]">Kg</SelectItem>
                                                                    <SelectItem value="Sq. Mtr" className="text-[10px]">Sq. Mtr</SelectItem>
                                                                    <SelectItem value="Run. Mtr" className="text-[10px]">Run. Mtr</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Input
                                                                className="h-6 text-[10px] border-slate-200 bg-transparent"
                                                                defaultValue={log.remarks}
                                                                onBlur={(e) => handleLogUpdate(log.id, "remarks", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Input
                                                                type="datetime-local"
                                                                className="h-7 text-[10px] w-full px-1 border-slate-200 bg-transparent font-mono"
                                                                value={log.startTime ? log.startTime.replace(" ", "T") : ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace("T", " ");
                                                                    handleLogUpdate(log.id, "startTime", val);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Input
                                                                type="datetime-local"
                                                                className="h-7 text-[10px] w-full px-1 border-slate-200 bg-transparent font-mono"
                                                                value={log.endTime ? log.endTime.replace(" ", "T") : ""}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace("T", " ");
                                                                    handleLogUpdate(log.id, "endTime", val);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <Select value={log.status} onValueChange={(v: any) => handleLogUpdate(log.id, "status", v)}>
                                                                <SelectTrigger className="h-6 text-[10px] w-24 border-slate-200 bg-transparent">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Running" className="text-[10px]">Running</SelectItem>
                                                                    <SelectItem value="Completed" className="text-[10px]">Completed</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="p-2 text-center align-top">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-300 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => {
                                                                    if (confirm("Delete this log?")) handleDeleteLog(log.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </Fragment>
                                        );
                                    })}

                                    {activeProcesses.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="p-8 text-center text-muted-foreground text-xs">
                                                No processes defined for this content. Please check Estimation.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-slate-100 sticky bottom-6">
                        <div className="text-sm text-muted-foreground">
                            Status: <span className="font-semibold text-slate-700">{productionEntry?.status}</span> |
                            DispQty: 0 | Dispatches: 0
                        </div>
                        <div className="flex gap-3">
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
                                onClick={() => setIsConsumptionOpen(true)}
                            >
                                <Box className="mr-2 h-4 w-4" />
                                Material Consumption
                            </Button>
                            <Button
                                variant="gradient-blue"
                                className="shadow-lg shadow-blue-200"
                                onClick={() => {
                                    toast.success("All Changes Saved");
                                    router.push("/production");
                                }}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <MaterialConsumptionDialog
                isOpen={isConsumptionOpen}
                onClose={() => setIsConsumptionOpen(false)}
                jobCardNo={job.jobCardNo}
                jobId={job.id}
                clientName={job.client}
                contentName={selectedContentId !== "main" && job.contents ? job.contents.find((c: any) => c.id === Number(selectedContentId))?.contentName : undefined}
            />


        </div >
    );
}
