"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GRN, GRNItem } from "@/types/grn-master";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

interface BarcodePrintModalProps {
    open: boolean;
    onClose: () => void;
    grnData: GRN | null;
}

export function BarcodePrintModal({ open, onClose, grnData }: BarcodePrintModalProps) {
    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    if (!grnData) return null;

    // Expand items based on "No. Of Rolls"
    // If an item has 10 rolls, we need 10 stickers.
    // Logic: 
    // - Weight: If 1000kg Total / 10 Rolls = 100kg each.
    // - Batch: BATCH-001 (Same) or sequential? Usually sequential suffixes for unique roll ID?
    // - For now, we print 10 copies of the sticker, or generate unique IDs if we had them.
    // - Mock Stock Service didn't actually return unique IDs yet.
    // - We will generate "Item 1 of 10", "Item 2 of 10" on sticker.

    // Generate one QR code per GRN item (not per roll)
    // Each item gets its own unique QR with full quantity details
    const stickers: any[] = [];
    grnData.items.forEach((item, itemIndex) => {
        stickers.push({
            ...item,
            stickerIndex: itemIndex + 1,
            totalCount: grnData.items.length,
            weight: item.receivedKg || 0,
            rm: item.receivedRM || 0,
            uniqueId: item.batchNo // Use batch number as unique ID
        });
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Print Barcodes</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end p-2 bg-slate-100 rounded">
                        <Button onClick={() => handlePrint && handlePrint()} className="gap-2">
                            <Printer className="w-4 h-4" /> Print Stickers
                        </Button>
                    </div>

                    <div className="border p-4 bg-gray-50 overflow-auto h-[500px]">
                        <div ref={printRef} className="space-y-4 p-4">
                            {/* CSS for Print - One QR per page */}
                            <style type="text/css" media="print">
                                {`
                                    @page { 
                                        size: A4 portrait; 
                                        margin: 20mm; 
                                    }
                                    .qr-sticker { 
                                        page-break-after: always;
                                        page-break-inside: avoid;
                                    }
                                    .qr-sticker:last-child {
                                        page-break-after: auto;
                                    }
                                `}
                            </style>

                            {stickers.map((sticker, idx) => (
                                <div key={idx} className="qr-sticker border-2 border-gray-400 p-4 flex gap-4 bg-white w-full max-w-md mx-auto">
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight mb-2">{sticker.itemName}</h3>
                                            <p className="text-sm font-mono text-gray-600">{sticker.itemCode}</p>
                                        </div>
                                        <div className="text-sm space-y-1 mt-4">
                                            <p><strong>Batch:</strong> {sticker.batchNo}</p>
                                            <p><strong>Unique ID:</strong> <span className="font-mono text-xs">{sticker.uniqueId}</span></p>
                                            <p className="grid grid-cols-2 gap-2">
                                                <span><strong>Weight:</strong> {sticker.weight.toFixed(2)} KG</span>
                                                {sticker.receivedRM && <span><strong>Length:</strong> {sticker.rm.toFixed(2)} M</span>}
                                            </p>
                                            <p><strong>GRN Date:</strong> {format(new Date(grnData.grnDate), "dd-MMM-yyyy")}</p>
                                            <p className="text-xs text-gray-500 mt-2">Item {sticker.stickerIndex} of {sticker.totalCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <QRCodeSVG
                                            value={JSON.stringify({
                                                id: sticker.uniqueId,
                                                batch: sticker.batchNo,
                                                itemCode: sticker.itemCode,
                                                grnDate: grnData.grnDate
                                            })}
                                            size={120}
                                        />
                                        <span className="text-[10px] font-mono text-center break-all max-w-[120px]">{sticker.uniqueId}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
