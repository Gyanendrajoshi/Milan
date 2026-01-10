"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { stockStorage } from "@/services/storage/stock-storage";
import { StockItem } from "@/types/stock-master";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MotherRollDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (roll: StockItem) => void;
}

export function MotherRollDialog({ open, onOpenChange, onSelect }: MotherRollDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [rolls, setRolls] = useState<StockItem[]>([]);

    useEffect(() => {
        if (open) {
            // Load fresh stock data every time dialog opens
            const allStock = stockStorage.getAll();
            // Filter: Must be a Roll, and have stock > 0
            const validRolls = allStock.filter(item =>
                item.category === 'Roll' &&
                (item.quantity || 0) > 0 &&
                item.status !== 'Consumed'
            );
            setRolls(validRolls);
        }
    }, [open]);

    const filteredRolls = rolls.filter(roll =>
        roll.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roll.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roll.batchNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Mother Roll (Stock)</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, code or batch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">Item Code</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead className="text-right">GSM</TableHead>
                                <TableHead className="text-center">Unit</TableHead>
                                <TableHead className="text-right">Stock (Mtr)</TableHead>
                                <TableHead className="text-right">Stock (Kg)</TableHead>
                                <TableHead className="w-[120px]">Auto Batch</TableHead>
                                <TableHead>Batch No</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRolls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No available rolls found in stock.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRolls.map((roll) => (
                                    <TableRow key={roll.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs font-medium">
                                            {roll.itemCode}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{roll.itemName}</span>
                                                <span className="text-xs text-muted-foreground">Width: {roll.widthMM}mm</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{roll.gsm || "-"}</TableCell>
                                        <TableCell className="text-center text-xs">{roll.uom}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-blue-600">
                                            {roll.runningMtr?.toLocaleString() || "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {roll.quantity?.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {roll.id}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">{roll.batchNo || "N/A"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    onSelect(roll);
                                                    onOpenChange(false);
                                                }}
                                            >
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
