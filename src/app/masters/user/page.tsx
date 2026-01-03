"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MoreHorizontal, Shield, Mail, Pencil, Trash, FileText, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

// --- VALIDATION SCHEMA ---
const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    contactNo: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    reTypePassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
    // Only validate password matching if password is provided (e.g. creating new user or changing password)
    if (data.password && data.password.length > 0) {
        return data.password === data.reTypePassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["reTypePassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

// --- TYPES ---
interface Permission {
    canView: boolean;
    canSave: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canPrint: boolean;
}

interface User extends UserFormValues {
    id: string;
    role: string;
    department: string;
    status: "Active" | "Inactive";
    permissions: Record<string, Permission>; // Keyed by subModule name
}

// Module List for Authorization
const MODULES = [
    {
        name: "Dashboard",
        subModules: ["Dashboard View"]
    },
    {
        name: "Estimation",
        subModules: ["Estimation Calculator", "Quote Panel", "Costing Sheet"]
    },
    {
        name: "Inventory",
        subModules: ["Purchase Order", "Goods Receipt Note (GRN)", "Stock View"]
    },
    {
        name: "Masters",
        subModules: [
            "Client/Supplier Master",
            "HSN Master",
            "Material Master",
            "Roll Master",
            "Tool Master",
            "Category Master",
            "Process Master",
            "User Master"
        ]
    },
    {
        name: "Production",
        subModules: ["Job Card", "Daily Production Report", "Dispatch"]
    },
];

const DEFAULT_PERMISSIONS: Permission = {
    canView: false,
    canSave: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canPrint: false
};

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
    {
        id: "1",
        name: "Rahul Mishra",
        userName: "rahul.m",
        email: "rahul@milan.com",
        contactNo: "9876543210",
        role: "Admin",
        department: "IT",
        status: "Active",
        permissions: {}
    },
    {
        id: "2",
        name: "Suresh Kumar",
        userName: "suresh.k",
        email: "suresh@milan.com",
        contactNo: "9876543211",
        role: "Manager",
        department: "Production",
        status: "Active",
        permissions: {}
    },
];

export default function UserMasterPage() {
    const [data, setData] = useState<User[]>(INITIAL_USERS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // -- Auth State Local to Dialog --
    // We manage this separately from React Hook Form for simpler matrix logic
    const [localPermissions, setLocalPermissions] = useState<Record<string, Permission>>({});

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            userName: "",
            email: "",
            contactNo: "",
            password: "",
            reTypePassword: "",
        },
    });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (isDialogOpen) {
            if (editingId) {
                const user = data.find(u => u.id === editingId);
                if (user) {
                    form.reset({
                        name: user.name,
                        userName: user.userName,
                        email: user.email,
                        contactNo: user.contactNo || "",
                        password: "", // Don't show existing password
                        reTypePassword: "",
                    });
                    setLocalPermissions(user.permissions || {});
                }
            } else {
                form.reset({
                    name: "",
                    userName: "",
                    email: "",
                    contactNo: "",
                    password: "",
                    reTypePassword: "",
                });
                setLocalPermissions({});
            }
        }
    }, [isDialogOpen, editingId, data, form]);

    const handlePermissionChange = (subModule: string, field: keyof Permission, checked: boolean) => {
        setLocalPermissions(prev => {
            const current = prev[subModule] || { ...DEFAULT_PERMISSIONS };
            return {
                ...prev,
                [subModule]: { ...current, [field]: checked }
            };
        });
    };

    const onSubmit = (values: UserFormValues) => {
        if (editingId) {
            // Update
            setData(prev => prev.map(u => u.id === editingId ? {
                ...u,
                ...values,
                permissions: localPermissions
            } : u));
            toast.success("User updated successfully");
        } else {
            // Create
            const newUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                ...values,
                role: "User", // Default
                department: "General", // Default
                status: "Active",
                permissions: localPermissions
            };
            setData(prev => [...prev, newUser]);
            toast.success("User created successfully");
        }
        setIsDialogOpen(false);
    };

    // -- Columns --
    const columns: ColumnDef<User>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                            {row.original.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-slate-700">{row.original.name}</span>
                        <span className="text-xs text-slate-500">{row.original.userName}</span>
                    </div>
                </div>
            )
        },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {row.original.role}
                </span>
            )
        },
        { accessorKey: "department", header: "Department" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", row.original.status === 'Active' ? 'bg-green-500' : 'bg-red-500')} />
                    <span className="text-sm">{row.original.status}</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingId(row.original.id); setIsDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setData(prev => prev.filter(u => u.id !== row.original.id));
                            toast.success("User deleted");
                        }}>
                            <Trash className="mr-2 h-4 w-4 text-red-500" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], []);

    return (
        <div className="container mx-auto h-full flex flex-col p-0">
            <Card className="flex-1 flex flex-col border-0 shadow-none overflow-hidden rounded-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-theme-gradient-r px-4 py-2 rounded-none">
                    <CardTitle className="text-xl font-bold text-white">User Master</CardTitle>
                    <Button onClick={() => { setEditingId(null); setIsDialogOpen(true); }} className="bg-white text-blue-600 hover:bg-white/90 shadow-lg px-4 border-0 font-bold">
                        <Plus className="h-4 w-4 mr-2" /> Add User
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <DataTable
                        columns={columns}
                        data={data}
                        placeholder="Search users..."
                        searchKey="name"
                    />
                </CardContent>
            </Card>

            {/* User Creation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden h-[80vh] flex flex-col">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                            <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
                                <DialogTitle>{editingId ? "Edit User" : "User Creation"}</DialogTitle>
                                <DialogDescription>Manage user details and system authorization.</DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                                <div className="px-6 pt-2 border-b">
                                    <TabsList className="bg-transparent p-0 gap-6 w-full justify-start h-auto">
                                        <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2">
                                            <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div> User Profile
                                        </TabsTrigger>
                                        <TabsTrigger value="other" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2">
                                            <FileText className="h-3 w-3" /> Other Details
                                        </TabsTrigger>
                                        <TabsTrigger value="auth" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2">
                                            <Shield className="h-3 w-3" /> Authorization
                                        </TabsTrigger>
                                        <TabsTrigger value="email" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2">
                                            <Mail className="h-3 w-3" /> Emails
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                    {/* TAB: User Profile */}
                                    <TabsContent value="profile" className="mt-0 space-y-6 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter full name" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="userName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">User Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Enter username" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">Email <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="user@example.com" type="email" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="contactNo" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">Contact No.</FormLabel>
                                                    <FormControl><Input placeholder="Enter contact number" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="password" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">Password <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder={editingId ? "Leave blank to keep current" : "Enter password"} type="password" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="reTypePassword" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-slate-500">Re Type Password <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input placeholder="Re-enter password" type="password" className="bg-white" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </TabsContent>

                                    {/* TAB: Authorization */}
                                    <TabsContent value="auth" className="mt-0 space-y-4 outline-none h-full flex flex-col">
                                        <div className="flex items-center justify-between bg-primary/10 rounded-lg p-1 border border-primary/20">
                                            <Button variant="ghost" size="sm" type="button" className="flex-1 bg-primary text-primary-foreground shadow-sm">Module Authentication</Button>
                                            <Button variant="ghost" size="sm" type="button" className="flex-1 text-slate-600 hover:text-primary">Production Unit Authorization</Button>
                                        </div>

                                        <div className="border rounded-lg bg-white overflow-hidden flex-1 shadow-sm">
                                            <div className="bg-slate-100/50 border-b px-4 py-2 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                                <div className="col-span-3">Module</div>
                                                <div className="col-span-3">Sub-Module</div>
                                                <div className="col-span-6 grid grid-cols-6 gap-2 text-center">
                                                    <span>View</span>
                                                    <span>Save</span>
                                                    <span>Edit</span>
                                                    <span>Delete</span>
                                                    <span>Export</span>
                                                    <span>Print</span>
                                                </div>
                                            </div>

                                            <div className="divide-y max-h-[400px] overflow-y-auto">
                                                {MODULES.flatMap(mod => mod.subModules.map(sub => {
                                                    const perms = localPermissions[sub] || DEFAULT_PERMISSIONS;
                                                    return (
                                                        <div key={sub} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors">
                                                            <div className="col-span-3 text-xs font-medium text-slate-700">{mod.name}</div>
                                                            <div className="col-span-3 text-xs text-slate-500">{sub}</div>
                                                            <div className="col-span-6 grid grid-cols-6 gap-2 place-items-center">
                                                                {(['canView', 'canSave', 'canEdit', 'canDelete', 'canExport', 'canPrint'] as const).map(key => (
                                                                    <Checkbox
                                                                        key={key}
                                                                        checked={perms[key]}
                                                                        onCheckedChange={(checked) => handlePermissionChange(sub, key, checked as boolean)}
                                                                        className="h-4 w-4 border-slate-300"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                }))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="other" className="mt-0 flex items-center justify-center h-40 text-slate-400 text-sm">
                                        Placeholder for Other Details
                                    </TabsContent>
                                    <TabsContent value="email" className="mt-0 flex items-center justify-center h-40 text-slate-400 text-sm">
                                        Placeholder for Emails
                                    </TabsContent>
                                </div>
                            </Tabs>

                            <DialogFooter className="px-6 py-4 border-t bg-slate-50/50">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-9">Cancel</Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white h-9 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Save User
                                    </div>
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
