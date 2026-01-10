"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Scissors, Printer, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { slittingStorage } from "@/services/storage/slitting-storage";
import { slittingService } from "@/services/api/slitting-service";
import { rollStorage } from "@/services/storage/roll-storage";
import { slittingJobFormSchema, SlittingJobFormValues, SlittingInputRoll, CuttingPlan } from "@/types/jumbo-slitting";
import { RollMaster } from "@/types/roll-master";
import { RollMasterSelectionDialog } from "@/components/dialogs/roll-master-selection-dialog";
import { BatchSelectionDialog } from "@/components/dialogs/batch-selection-dialog";
import { GRNItem } from "@/types/grn-master";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SlittingDialogProps {
    onSlittingComplete: () => void;
}

export function SlittingDialog({ onSlittingComplete }: SlittingDialogProps) {
    const [open, setOpen] = useState(false);

    // Dialog States
    const [rollMasterDialogOpen, setRollMasterDialogOpen] = useState(false); // For Mother Roll
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);         // For Mother Roll

    // Data States
    const [availableRollMasters, setAvailableRollMasters] = useState<(RollMaster & { totalStock: number; uom: string })[]>([]);
    const [selectedRollMaster, setSelectedRollMaster] = useState<RollMaster | null>(null);
    const [selectedInputRoll, setSelectedInputRoll] = useState<SlittingInputRoll | null>(null);
    const [voucherNo, setVoucherNo] = useState("AUTO-GEN");

    // Temporary State for Child Roll Adding (Ad-Hoc)
    const [tempWidth, setTempWidth] = useState<number>(0);
    const [tempQty, setTempQty] = useState<number>(1);

    const form = useForm<SlittingJobFormValues>({
        resolver: zodResolver(slittingJobFormSchema),
        defaultValues: {
            slittingDate: new Date().toISOString(),
            inputRoll: {} as any,
            cuttingPlans: [],
            wastageKg: 0,
            wastageRM: 0,
            wastageSqMtr: 0,
            status: 'Completed',
            operatorName: '',
            machineNo: '',
            remarks: '',
            wastageRemarks: ''
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "cuttingPlans",
    });

    // Generate a pseudo-voucher number on open
    useEffect(() => {
        if (open) {
            loadAvailableRollMasters();
            form.reset({
                slittingDate: new Date().toISOString(),
                cuttingPlans: [],
                wastageKg: 0,
                status: 'Completed',
                operatorName: '',
                machineNo: '',
                remarks: '',
            });
            setSelectedRollMaster(null);
            setSelectedInputRoll(null);
            setTempWidth(0);
            setTempQty(1);
            setVoucherNo(`JRS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
        }
    }, [open]);

    const loadAvailableRollMasters = () => {
        const allRolls = rollStorage.getAll();
        const rollsWithStock = allRolls
            .map(roll => {
                const stockInfo = slittingService.getInventoryStockByRollMaster(roll.id);
                return {
                    ...roll,
                    totalStock: stockInfo.totalStock,
                    uom: stockInfo.uom
                };
            })
        setAvailableRollMasters(rollsWithStock.filter(r => r.totalStock > 0));
    };

    const handleRollMasterSelect = (rollMaster: RollMaster & { totalStock: number; uom: string }) => {
        setSelectedRollMaster(rollMaster);
        setSelectedInputRoll(null);
        form.setValue("cuttingPlans", []);
        toast.success(`Selected type: ${rollMaster.itemName || rollMaster.itemCode}`);
    };

    const handleBatchSelect = (grnItem: GRNItem & { grnId: string; rollMasterId: string }) => {
        const inputRoll = slittingService.convertGRNItemToInputRoll({
            ...grnItem,
            rollMasterId: selectedRollMaster?.id || ""
        });

        // Default process length to full roll
        inputRoll.inputProcessRM = inputRoll.inputRM;

        setSelectedInputRoll(inputRoll);
        form.setValue("inputRoll", inputRoll);
        form.setValue("cuttingPlans", []);

        // Reset wastage
        form.setValue("wastageKg", 0);
        form.setValue("wastageRM", 0);
        form.setValue("wastageSqMtr", 0);
    };

    const handleAddChildToPlan = () => {
        if (!selectedInputRoll) {
            toast.error("Please select input roll first");
            return;
        }
        if (tempWidth <= 0) {
            toast.error("Width must be greater than 0");
            return;
        }
        if (tempQty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        const newPlan: CuttingPlan = {
            id: `plan-${Date.now()}`,
            width: tempWidth, // Manual Entry
            quantity: tempQty,
            totalWidth: tempWidth,
            totalRM: 0,
            totalKg: 0,
            // childRollMasterId is now OPTIONAL, system will auto-find/create on save
            childItemName: `Cut Size ${tempWidth}mm`
        };

        const totals = slittingService.calculateCuttingPlanTotals(newPlan, selectedInputRoll);
        append({ ...newPlan, ...totals });

        // Reset temp Selection
        setTempWidth(0);
        setTempQty(1);
    };


    // Auto-calculate wastage and totals when Plans change
    const cuttingPlans = form.watch("cuttingPlans");
    const processRM = form.watch("inputRoll.inputProcessRM");

    useEffect(() => {
        if (selectedInputRoll && cuttingPlans.length > 0) {

            // Recalculate Plans if processRM changed
            const updatedPlans = cuttingPlans.map(plan => {
                return slittingService.calculateCuttingPlanTotals(plan, selectedInputRoll);
            });
            // Note: We can't easily update field array inplace inside effect without loop.

            // Ensure selectedInputRoll matches form state for calculations
            const currentInput = { ...selectedInputRoll, inputProcessRM: processRM || selectedInputRoll.inputRM };

            const outputRolls = slittingService.expandCuttingPlansToOutputRolls(
                cuttingPlans,
                currentInput
            );

            const wastage = slittingService.calculateWastage(
                currentInput,
                outputRolls
            );

            form.setValue("wastageKg", wastage.wastageKg);
            form.setValue("wastageRM", wastage.wastageRM);
            form.setValue("wastageSqMtr", wastage.wastageSqMtr);
        }
    }, [cuttingPlans, processRM, selectedInputRoll]);


    const handleWastageKgChange = (kg: number) => {
        if (!selectedInputRoll) return;
        const { wastageRM, wastageSqMtr } = slittingService.calculateWastageFromKg(kg, selectedInputRoll);
        form.setValue("wastageRM", wastageRM);
        form.setValue("wastageSqMtr", wastageSqMtr);
    };

    const onSubmit = async (data: SlittingJobFormValues) => {
        try {
            if (!selectedRollMaster || !selectedInputRoll) {
                toast.error("Please select a roll for slitting");
                return;
            }

            // Ensure Input Roll has latest Process RM
            const finalInputRoll = {
                ...selectedInputRoll,
                inputProcessRM: data.inputRoll.inputProcessRM // from form
            };

            const validation = slittingService.validateCuttingPlans(
                finalInputRoll.inputWidth,
                data.cuttingPlans
            );

            if (!validation.isValid) {
                toast.error(validation.message);
                return;
            }
            if (validation.warningMessage) {
                toast.warning(validation.warningMessage);
            }

            // Create Output Rolls
            const outputRolls = slittingService.expandCuttingPlansToOutputRolls(
                data.cuttingPlans,
                finalInputRoll
            );

            // Link to selected Child Masters (Auto Find/Create)
            let rollIndex = 0;
            const outputRollsWithMasters = data.cuttingPlans.flatMap(plan => {
                // Determine Master for this Plan
                // If plan used a specific ID (legacy/manual), use it. Else Auto-Find.
                let masterId = plan.childRollMasterId;
                let masterName = plan.childItemName;

                if (!masterId || masterId.startsWith("plan-")) { // If no real ID
                    const master = slittingService.findOrCreateChildRollMaster(plan.width, finalInputRoll);
                    masterId = master.id;
                    masterName = master.itemName;
                }

                const rollsForPlan = [];
                for (let i = 0; i < plan.quantity; i++) {
                    const baseRoll = outputRolls[rollIndex];
                    if (!baseRoll) break;

                    rollsForPlan.push({
                        ...baseRoll,
                        rollMasterId: masterId,
                        itemName: masterName || baseRoll.itemName,
                        qrCodeData: slittingService.generateQRCodeData(
                            baseRoll.batchNo,
                            "",
                            baseRoll
                        )
                    });
                    rollIndex++;
                }
                return rollsForPlan;
            });

            const jobData = {
                ...data,
                inputRoll: finalInputRoll, // Use Updated Input
                outputRolls: outputRollsWithMasters,
                status: 'Completed' as const,
                wastageKg: data.wastageKg || 0,
            };

            slittingStorage.save(jobData);
            toast.success(`Saved Successfully! Voucher No: ${voucherNo}`);
            setOpen(false);
            onSlittingComplete();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save slitting data");
        }
    };

    // Summary Calcs
    const totalOutputQtyMtr = cuttingPlans.reduce((sum, p) => sum + p.totalRM, 0); // This is linear Mtr sum
    const totalOutputRolls = cuttingPlans.reduce((sum, p) => sum + p.quantity, 0);
    const totalUsedWidth = cuttingPlans.reduce((sum, p) => sum + p.totalWidth, 0);

    return (
        <>
            {/* Mother Roll Selection Dialog */}
            <RollMasterSelectionDialog
                open={rollMasterDialogOpen}
                onOpenChange={setRollMasterDialogOpen}
                availableRolls={availableRollMasters}
                onSelect={handleRollMasterSelect}
            />

            <BatchSelectionDialog
                open={batchDialogOpen}
                onOpenChange={setBatchDialogOpen}
                rollMasterId={selectedRollMaster?.id || ""}
                rollMasterName={selectedRollMaster?.itemName}
                onSelect={(item) => handleBatchSelect(item)}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" className="bg-theme-gradient-r border-0 shadow-lg font-bold text-white">
                        <Scissors className="mr-2 h-4 w-4" /> New Slitting
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-6 py-3 bg-theme-gradient-r text-white rounded-t-lg shrink-0">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <span>Jumbo Roll Slitting</span>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-normal">
                                {voucherNo}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden bg-muted/10">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">

                            {/* SECTION 1: TOP DETAILS */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border shadow-sm">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Voucher No</Label>
                                    <Input value={voucherNo} disabled className="h-8 bg-muted font-mono text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Voucher Date</Label>
                                    <Input
                                        value={format(new Date(), "dd-MMM-yyyy")}
                                        disabled
                                        className="h-8 bg-muted text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Voucher Type</Label>
                                    <Input value="Jumbo Roll Slitting" disabled className="h-8 bg-muted text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <div className="h-8 flex items-center px-3 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                        NEW ENTRY
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: INPUT ROLL DETAILS */}
                            <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold text-sm text-blue-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Input Roll Details (Mother Roll)
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={selectedInputRoll ? "outline" : "default"}
                                            onClick={() => setRollMasterDialogOpen(true)}
                                            className="h-7 text-xs"
                                        >
                                            1. Select Type
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={selectedInputRoll ? "secondary" : "outline"}
                                            onClick={() => setBatchDialogOpen(true)}
                                            disabled={!selectedRollMaster}
                                            className="h-7 text-xs"
                                        >
                                            2. Select Batch
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-3">
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Item Name</Label>
                                        <Input value={selectedInputRoll?.itemName || ""} disabled className="h-8 bg-muted/50 text-xs font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Item Code</Label>
                                        <Input value={selectedInputRoll?.itemCode || ""} disabled className="h-8 bg-muted/50 text-xs font-mono" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Batch No</Label>
                                        <Input value={selectedInputRoll?.batchNo || ""} disabled className="h-8 bg-muted/50 text-xs font-mono text-blue-600 font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Stock (Mtr)</Label>
                                        <Input value={selectedInputRoll?.inputRM?.toFixed(2) || "0.00"} disabled className="h-8 bg-muted/50 text-xs font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Stock (Kg)</Label>
                                        <Input value={selectedInputRoll?.inputKg?.toFixed(2) || "0.00"} disabled className="h-8 bg-muted/50 text-xs font-bold" />
                                    </div>

                                    {/* Row 2 */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Width (mm)</Label>
                                        <Input value={selectedInputRoll?.inputWidth || ""} disabled className="h-8 bg-muted/50 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">GSM</Label>
                                        <Input value={selectedInputRoll?.inputGSM || ""} disabled className="h-8 bg-muted/50 text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2.5: PROCESS CONSUMPTION (Visible Early) */}
                            {selectedInputRoll && (
                                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 shadow-sm space-y-2">
                                    <h3 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                                        <Scissors className="h-3.5 w-3.5" /> Process Details
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 max-w-xs">
                                            <Label className="text-xs font-bold text-blue-800">Process/Run Length (Mtr)</Label>
                                            <p className="text-[10px] text-muted-foreground mb-1">How much length to unwind?</p>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={form.watch("inputRoll.inputProcessRM") || selectedInputRoll?.inputRM || 0}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        if (!selectedInputRoll) return;

                                                        const updated = { ...selectedInputRoll, inputProcessRM: val };
                                                        form.setValue("inputRoll", updated);

                                                        // Recalculate existing rows
                                                        const currentPlans = form.getValues("cuttingPlans");
                                                        currentPlans.forEach((plan, idx) => {
                                                            const totals = slittingService.calculateCuttingPlanTotals(plan, updated);
                                                            form.setValue(`cuttingPlans.${idx}`, { ...plan, ...totals });
                                                        });
                                                    }}
                                                    className="h-9 font-bold border-blue-300 text-black shadow-sm"
                                                />
                                                <span className="text-xs font-medium">mtr</span>
                                            </div>
                                        </div>
                                        {/* Dynamic Feedback on Stock Remaining */}
                                        <div className="flex-1 border-l pl-4 py-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Remaining Stock After</Label>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-bold text-amber-700">
                                                    {(selectedInputRoll.inputRM - (form.watch("inputRoll.inputProcessRM") || selectedInputRoll.inputRM)).toFixed(2)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">mtr</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 4: OUTPUT GRID with ADD ROW ROW */}
                            <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold text-sm text-blue-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Output Details (Child Rolls)
                                    </h3>
                                </div>

                                {/* ADD ROW UI - OPTIMIZED: Manual Entry */}
                                <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded border mb-2">
                                    <div className="flex-1 min-w-[300px] space-y-1">
                                        <Label className="text-xs font-bold text-muted-foreground">Output Roll Specification</Label>
                                        <div className="flex items-center gap-2 h-8">
                                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium flex-1">
                                                Auto-Matched to Master on Save
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <Label className="text-xs font-bold text-muted-foreground">Width (mm)</Label>
                                        <Input
                                            type="number"
                                            value={tempWidth || ""}
                                            onChange={(e) => setTempWidth(parseInt(e.target.value) || 0)}
                                            className="h-8 text-xs font-bold text-center"
                                            placeholder="Enter Width"
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs font-bold text-muted-foreground">Qty (Nos)</Label>
                                        <Input
                                            type="number"
                                            value={tempQty}
                                            onChange={(e) => setTempQty(parseInt(e.target.value) || 0)}
                                            className="h-8 text-xs font-bold text-center"
                                            min={1}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddChildToPlan}
                                        disabled={!tempWidth || tempQty <= 0 || !selectedInputRoll}
                                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Plus className="mr-1 h-3 w-3" /> Add
                                    </Button>
                                </div>

                                <div className="rounded border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="h-8">
                                                <TableHead className="h-8 text-xs font-bold w-[50px] text-center">#</TableHead>
                                                <TableHead className="h-8 text-xs font-bold">Child Item Name</TableHead>
                                                <TableHead className="h-8 text-xs font-bold text-right">Width (mm)</TableHead>
                                                <TableHead className="h-8 text-xs font-bold text-right">Qty (Nos)</TableHead>
                                                <TableHead className="h-8 text-xs font-bold text-right">Total Width</TableHead>
                                                <TableHead className="h-8 text-xs font-bold w-[40px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fields.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                                        No output rolls added. Use the selection above to add Child Rolls.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                fields.map((field, index) => {
                                                    const plan = form.watch(`cuttingPlans.${index}`);
                                                    return (
                                                        <TableRow key={field.id} className="h-9">
                                                            <TableCell className="py-1 text-center text-xs font-medium">{index + 1}</TableCell>
                                                            <TableCell className="py-1 text-xs">
                                                                {plan.childItemName || "Custom Size"}
                                                            </TableCell>
                                                            <TableCell className="py-1 text-right text-xs font-mono">{plan.width}</TableCell>
                                                            <TableCell className="py-1 text-right text-xs font-mono font-bold">{plan.quantity}</TableCell>
                                                            <TableCell className="py-1 text-right text-xs font-mono">{plan.totalWidth} mm</TableCell>
                                                            <TableCell className="py-1 text-center">
                                                                <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Visual Width Validation */}
                                {selectedInputRoll && fields.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs border rounded p-2 bg-muted/20">
                                        <span className="font-semibold text-muted-foreground">Width Utilization:</span>
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                            {/* Used Width */}
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${Math.min((totalUsedWidth / selectedInputRoll.inputWidth) * 100, 100)}%` }}
                                            />
                                            {/* Unused Strip (Wastage) */}
                                            <div
                                                className="h-full bg-amber-400"
                                                style={{ width: `${Math.max(0, 100 - ((totalUsedWidth / selectedInputRoll.inputWidth) * 100))}%` }}
                                            />
                                        </div>
                                        <span className="font-bold font-mono text-green-700">
                                            {totalUsedWidth} mm Used
                                        </span>
                                        <span className="text-xs text-amber-600 font-semibold">
                                            ({(selectedInputRoll.inputWidth - totalUsedWidth).toFixed(0)} mm Waste)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* SECTION 5: SUMMARY & WASTAGE & REMARKS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-3">
                                    <h3 className="font-semibold text-sm text-blue-700 flex items-center gap-2 border-b pb-2">
                                        Job Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Machine Name</Label>
                                            <Input {...form.register("machineNo")} placeholder="Select Machine" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Operator Name</Label>
                                            <Input {...form.register("operatorName")} placeholder="Select Operator" className="h-8 text-xs" />
                                        </div>
                                        <div className="pt-2">
                                            <Label className="text-xs">Remarks</Label>
                                            <Textarea
                                                {...form.register("remarks")}
                                                placeholder="Enter transaction remarks..."
                                                className="min-h-[60px] text-xs resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border shadow-sm space-y-4">
                                    <h3 className="font-semibold text-sm text-blue-700 flex items-center gap-2 border-b pb-2">
                                        Total Consumption & Wastage
                                    </h3>

                                    {/* Simple Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="block text-muted-foreground">Input Kg Used</span>
                                            <span className="font-bold text-sm">
                                                {((form.watch("inputRoll.inputProcessRM") || 0) * (selectedInputRoll?.inputWidth || 0) * (selectedInputRoll?.inputGSM || 0) / 1000 / 1000).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <span className="block text-muted-foreground">Total Output Kg</span>
                                            <span className="font-bold text-sm text-green-600">
                                                {(cuttingPlans.reduce((acc, p) => acc + p.totalKg, 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Wastage */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex items-center gap-4">
                                            <Label className="text-xs w-24">Wastage (Kg)</Label>
                                            <Input
                                                type="number"
                                                className="h-8 w-32 text-right text-xs font-bold text-amber-700 bg-amber-50 border-amber-200"
                                                {...form.register("wastageKg", { valueAsNumber: true })}
                                                readOnly // Auto-calculated mostly
                                            />
                                        </div>
                                        <div className="flex justify-end gap-4 text-xs font-mono text-muted-foreground">
                                            <span>Includes {((selectedInputRoll?.inputWidth || 0) - totalUsedWidth).toFixed(0)}mm strip</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="shrink-0 p-4 bg-white border-t flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                                Total Output Rolls: <strong className="text-foreground">{totalOutputRolls}</strong> |
                                Output Qty: <strong className="text-foreground">{totalOutputQtyMtr.toFixed(2)} mtr (Linear)</strong>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
