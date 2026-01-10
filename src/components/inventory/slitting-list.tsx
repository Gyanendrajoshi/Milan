"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { SlittingJob } from "@/types/jumbo-slitting";
import { slittingStorage } from "@/services/storage/slitting-storage";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SlittingListProps {
    refreshTrigger?: number; // Prop to force refresh list
}

export function SlittingList({ refreshTrigger = 0 }: SlittingListProps) {
    const [jobs, setJobs] = useState<SlittingJob[]>([]);

    const loadJobs = () => {
        const data = slittingStorage.getAll();
        setJobs(data);
    };

    useEffect(() => {
        loadJobs();
    }, [refreshTrigger]);

    const handleDelete = (id: string) => {
        try {
            slittingStorage.delete(id);
            toast.success("Slitting job deleted successfully");
            loadJobs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete slitting job");
        }
    };

    const handlePrint = (job: SlittingJob) => {
        toast.info(`Printing Job: ${job.id} (Not implemented)`);
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    Transaction History
                    <Badge variant="secondary" className="ml-auto font-mono text-xs">
                        {jobs.length} Records
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-xs font-bold">Date</TableHead>
                                <TableHead className="text-xs font-bold">Job No</TableHead>
                                <TableHead className="text-xs font-bold">Input Roll</TableHead>
                                <TableHead className="text-center text-xs font-bold">Output Count</TableHead>
                                <TableHead className="text-right text-xs font-bold">Total Output (Kg)</TableHead>
                                <TableHead className="text-right text-xs font-bold">Wastage (Kg)</TableHead>
                                <TableHead className="text-xs font-bold">Status</TableHead>
                                <TableHead className="w-[100px] text-right text-xs font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">
                                        No slitting records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} className="group">
                                        <TableCell className="text-xs font-medium">
                                            {format(new Date(job.slittingDate), "dd-MMM-yyyy")}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-blue-600 font-bold">
                                            {job.id}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{job.inputRoll.itemName}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {job.inputRoll.batchNo} ({job.inputRoll.inputWidth}mm)
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-mono">
                                            {job.outputRolls.length}
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-mono font-bold">
                                            {job.outputRolls.reduce((sum, r) => sum + r.outputKg, 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-mono text-amber-600">
                                            {job.wastageKg.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant={job.status === "Completed" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    onClick={() => handlePrint(job)}
                                                    title="Print Label"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Slitting Job?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete job <span className="font-mono font-bold">{job.id}</span> and reverse all stock updates.
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(job.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
