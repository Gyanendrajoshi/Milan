"use client";

import { useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { SlittingJob } from "@/types/jumbo-slitting";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";

interface SlittingQRPrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slittingJob: SlittingJob;
}

export function SlittingQRPrintDialog({
    open,
    onOpenChange,
    slittingJob
}: SlittingQRPrintDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 bg-theme-gradient-r text-white rounded-t-lg">
                    <DialogTitle className="text-xl font-bold text-white">
                        QR Codes - {slittingJob.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div ref={printRef} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {slittingJob.outputRolls.map((roll, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 flex flex-col items-center space-y-3 bg-white dark:bg-slate-900"
                                >
                                    {/* QR Code */}
                                    <div className="bg-white p-2 rounded">
                                        <QRCodeCanvas
                                            value={roll.qrCodeData || JSON.stringify({ batch: roll.batchNo })}
                                            size={180}
                                            level="H"
                                        />
                                    </div>

                                    {/* Roll Details */}
                                    <div className="text-center space-y-1 w-full">
                                        <div className="font-mono font-bold text-sm">
                                            {roll.batchNo}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                            <div><span className="font-semibold">Width:</span> {roll.outputWidth}mm</div>
                                            <div><span className="font-semibold">GSM:</span> {roll.outputGSM}</div>
                                            <div><span className="font-semibold">Weight:</span> {roll.outputKg.toFixed(2)}kg</div>
                                            <div><span className="font-semibold">RM:</span> {roll.outputRM.toFixed(2)}m</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground pt-1 border-t">
                                            Part {index + 1} of {slittingJob.outputRolls.length}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/20 dark:bg-muted/10 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrint}
                        className="bg-theme-gradient-r border-0 shadow-sm text-white"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Print QR Codes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
