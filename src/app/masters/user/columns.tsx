"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserMaster } from "@/types/user-master";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserColumnsProps {
    onEdit: (user: UserMaster) => void;
    onDelete: (user: UserMaster) => void;
}

export const getColumns = ({ onEdit, onDelete }: UserColumnsProps): ColumnDef<UserMaster>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs ring-1 ring-blue-200">
                        {row.original.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-sm text-slate-700">{row.original.name}</span>
                    <span className="text-xs text-slate-500">@{row.original.userName}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="text-sm font-medium text-slate-600">
                {row.original.email}
            </div>
        )
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                row.original.role === 'Admin'
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
            )}>
                {row.original.role}
            </span>
        )
    },
    {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => (
            <div className="text-sm text-slate-600">
                {row.original.department}
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", row.original.status === 'Active' ? 'bg-green-500' : 'bg-red-500')} />
                <span className="text-sm font-medium text-slate-600">{row.original.status}</span>
            </div>
        )
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
