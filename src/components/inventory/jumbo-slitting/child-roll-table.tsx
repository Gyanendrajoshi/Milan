"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StockItem } from "@/types/stock-master";
import { RollMaster } from "@/types/roll-master";
import { rollStorage } from "@/services/storage/roll-storage";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export interface ChildRollEntry {
    masterId: string;
    qtyMtr: number; // Process/Output Length
    qtyKg: number;  // Total Weight
    qtyRolls: number;
    // Helper for display
    width: number;
    itemName: string;
    itemCode: string;
}

interface ChildRollTableProps {
    motherRoll: StockItem;
    entries: ChildRollEntry[];
    onEntriesChange: (entries: ChildRollEntry[]) => void;
}

export function ChildRollTable({ motherRoll, entries, onEntriesChange }: ChildRollTableProps) {
    const [compatibleMasters, setCompatibleMasters] = useState<RollMaster[]>([]);

    useEffect(() => {
        if (motherRoll) {
            const allMasters = rollStorage.getAll();
            // Filter Logic:
            // 1. Must be smaller width
            // 2. Ideally should match 'Category' or 'Type' but StockItem has 'Category=Roll' vs RollMaster has 'ItemType=Film|Paper'
            // We'll rely on Width mostly as requested.

            const filtered = allMasters.filter(m =>
                (m.rollWidthMM < (motherRoll.widthMM || 0))
            );
            setCompatibleMasters(filtered);
        }
    }, [motherRoll]);

    const handleToggle = (master: RollMaster, checked: boolean) => {
        if (checked) {
            if (!entries.find(e => e.masterId === master.id)) {
                onEntriesChange([...entries, {
                    masterId: master.id,
                    qtyMtr: 0,
                    qtyKg: 0,
                    qtyRolls: 0,
                    width: master.rollWidthMM,
                    itemName: master.itemName,
                    itemCode: master.itemCode
                }]);
            }
        } else {
            onEntriesChange(entries.filter(e => e.masterId !== master.id));
        }
    };

    const handleUpdate = (masterId: string, field: keyof ChildRollEntry, value: number) => {
        onEntriesChange(entries.map(e =>
            e.masterId === masterId ? { ...e, [field]: value } : e
        ));
    };

    const isSelected = (id: string) => entries.some(e => e.masterId === id);
    const getEntry = (id: string) => entries.find(e => e.masterId === id) || { qtyMtr: 0, qtyKg: 0, qtyRolls: 0 };

    return (
        <div className="rounded-md border bg-white">
            <div className="px-3 py-2 border-b bg-muted/40">
                <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Child Roll Configuration</h3>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableHead className="w-[40px] text-center h-8"></TableHead>
                        <TableHead className="h-8 text-xs font-semibold text-muted-foreground">Specification</TableHead>
                        <TableHead className="text-right w-[80px] h-8 text-xs font-semibold text-muted-foreground">Width</TableHead>
                        <TableHead className="w-[100px] text-right h-8 text-xs font-semibold text-muted-foreground">Qty (Mtr)</TableHead>
                        <TableHead className="w-[100px] text-right h-8 text-xs font-semibold text-muted-foreground">Qty (Kg)</TableHead>
                        <TableHead className="w-[80px] text-right h-8 text-xs font-semibold text-muted-foreground">Rolls</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {compatibleMasters.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                                No compatible child rolls found (Width &lt; {motherRoll.widthMM}mm).
                            </TableCell>
                        </TableRow>
                    ) : (
                        compatibleMasters.map(master => {
                            const selected = isSelected(master.id);
                            const entry = getEntry(master.id);
                            return (
                                <TableRow key={master.id} className={`h-9 hover:bg-muted/50 ${selected ? "bg-muted/30" : ""}`}>
                                    <TableCell className="text-center py-1">
                                        <Checkbox
                                            className="h-4 w-4"
                                            checked={selected}
                                            onCheckedChange={(c) => handleToggle(master, c as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <div className="flex flex-col justify-center">
                                            <span className={`text-xs font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>{master.itemName}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{master.itemCode}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs py-1">
                                        {master.rollWidthMM}<span className="text-[10px] text-muted-foreground ml-0.5">mm</span>
                                    </TableCell>
                                    <TableCell className="py-1 px-2">
                                        <Input
                                            type="number"
                                            disabled={!selected}
                                            value={entry.qtyMtr || ""}
                                            onChange={(e) => handleUpdate(master.id, 'qtyMtr', parseFloat(e.target.value) || 0)}
                                            className="h-7 text-right font-mono text-xs bg-background"
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell className="py-1 px-2">
                                        <Input
                                            type="number"
                                            disabled={!selected}
                                            value={entry.qtyKg || ""}
                                            onChange={(e) => handleUpdate(master.id, 'qtyKg', parseFloat(e.target.value) || 0)}
                                            className="h-7 text-right font-mono text-xs bg-background"
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell className="py-1 px-2">
                                        <Input
                                            type="number"
                                            disabled={!selected}
                                            value={entry.qtyRolls || ""}
                                            onChange={(e) => handleUpdate(master.id, 'qtyRolls', parseFloat(e.target.value) || 0)}
                                            className="h-7 text-right font-mono text-xs bg-background"
                                            placeholder="0"
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
