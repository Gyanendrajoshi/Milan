"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserMaster, UserMasterFormValues, userMasterSchema, SYSTEM_MODULES, DEFAULT_PERMISSIONS, Permission } from "@/types/user-master";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Shield, Mail, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UserMasterFormProps {
    initialData?: UserMaster;
    onSuccess: (data: UserMasterFormValues) => void;
    onCancel: () => void;
}

export function UserMasterForm({ initialData, onSuccess, onCancel }: UserMasterFormProps) {
    const [authView, setAuthView] = useState<"module" | "production">("module");

    // We maintain strict compatibility with the previous authorization pattern
    // The previous code had a 'localPermissions' state. We can simply map it to the form's Permission field.

    const form = useForm<UserMasterFormValues>({
        resolver: zodResolver(userMasterSchema) as any,
        defaultValues: {
            name: "",
            userName: "",
            email: "",
            contactNo: "",
            password: "",
            reTypePassword: "",
            role: "Operator",
            department: "",
            status: "Active",
            permissions: {},
        } as any, // Cast to avoid strict partial checks on complex nested defaults
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                password: "", // Don't allow editing password directly here unless intention is explicit
                reTypePassword: "",
            });
        }
    }, [initialData, form]);

    const onSubmit: SubmitHandler<UserMasterFormValues> = (values) => {
        onSuccess(values);
    };

    const handlePermissionChange = (subModule: string, field: keyof Permission, checked: boolean) => {
        // Use granular update to prevent overwriting other keys
        const currentModulePerms = form.getValues(`permissions.${subModule}`) as Permission | undefined;
        const modulePerms = currentModulePerms || { ...DEFAULT_PERMISSIONS };

        form.setValue(`permissions.${subModule}` as any, {
            ...modulePerms,
            [field]: checked
        }, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-2 border-b">
                        <TabsList className="bg-transparent p-0 gap-6 w-full justify-start h-auto overflow-x-auto flex-nowrap shrink-0">
                            <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2 shrink-0">
                                <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div> User Profile
                            </TabsTrigger>
                            <TabsTrigger value="other" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2 shrink-0">
                                <FileText className="h-3 w-3" /> Other Details
                            </TabsTrigger>
                            <TabsTrigger value="auth" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2 shrink-0">
                                <Shield className="h-3 w-3" /> Authorization
                            </TabsTrigger>
                            <TabsTrigger value="email" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-2 pb-3 pt-2 text-slate-500 gap-2 shrink-0">
                                <Mail className="h-3 w-3" /> Emails
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                        <TabsContent value="profile" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-500">Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input placeholder="Enter full name" className="bg-white" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="userName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-500">Username <span className="text-red-500">*</span></FormLabel>
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

                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-500">Role <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="Operator">Operator</SelectItem>
                                                <SelectItem value="Viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-500">Department <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Production">Production</SelectItem>
                                                <SelectItem value="Quality">Quality</SelectItem>
                                                <SelectItem value="Dispatch">Dispatch</SelectItem>
                                                <SelectItem value="IT">IT</SelectItem>
                                                <SelectItem value="Management">Management</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-slate-500">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-5 mt-2">
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-500">Password {initialData ? "" : <span className="text-red-500">*</span>}</FormLabel>
                                            <FormControl><Input placeholder={initialData ? "Leave blank to keep current" : "Enter password"} type="password" className="bg-white" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="reTypePassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-slate-500">Re Type Password {initialData ? "" : <span className="text-red-500">*</span>}</FormLabel>
                                            <FormControl><Input placeholder="Re-enter password" type="password" className="bg-white" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="auth" className="mt-0 space-y-4 outline-none h-full flex flex-col">
                            <div className="flex items-center justify-between bg-primary/10 rounded-lg p-1 border border-primary/20">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => setAuthView("module")}
                                    className={cn(
                                        "flex-1",
                                        authView === "module" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 hover:text-primary"
                                    )}
                                >
                                    Module Authentication
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => setAuthView("production")}
                                    className={cn(
                                        "flex-1",
                                        authView === "production" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 hover:text-primary"
                                    )}
                                >
                                    Production Unit Authorization
                                </Button>
                            </div>

                            <div className="border rounded-lg bg-white overflow-hidden flex-1 shadow-sm">
                                {authView === "module" ? (
                                    <>
                                        {/* Mobile scroll wrapper for complex permissions table */}
                                        <div className="overflow-x-auto w-full">
                                            <div className="min-w-[600px]">
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
                                                    {SYSTEM_MODULES.flatMap(mod => mod.subModules.map(sub => {
                                                        // Watch permissions for re-renders
                                                        const perms = form.watch(`permissions.${sub}`) || DEFAULT_PERMISSIONS;

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
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                        Production Unit Authorization Content
                                    </div>
                                )}
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

                <DialogFooter className="px-6 py-4 border-t bg-slate-50/50 mt-auto">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Save User
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
