import { z } from "zod";

// --- Validations ---
export const userMasterSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    contactNo: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    reTypePassword: z.string().optional().or(z.literal("")),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    status: z.enum(["Active", "Inactive"]).default("Active"),
    // Permissions: Map of ModuleName -> Permission Object
    permissions: z.record(z.string(), z.object({
        canView: z.boolean().default(false),
        canSave: z.boolean().default(false),
        canEdit: z.boolean().default(false),
        canDelete: z.boolean().default(false),
        canExport: z.boolean().default(false),
        canPrint: z.boolean().default(false),
    })).optional().default({}),
}).refine((data) => {
    // Only validate password matching if password is provided
    if (data.password && data.password.length > 0) {
        return data.password === data.reTypePassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["reTypePassword"],
});

export type UserMasterFormValues = z.infer<typeof userMasterSchema>;

export interface Permission {
    canView: boolean;
    canSave: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canPrint: boolean;
}

export interface UserMaster extends Omit<UserMasterFormValues, "password" | "reTypePassword"> {
    id: string;
    // We don't store plain text passwords in the main object for list views, 
    // but the API/Storage would handle it securely (mock implementation for now)
}

// System Modules for Permissions
export const SYSTEM_MODULES = [
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

export const DEFAULT_PERMISSIONS: Permission = {
    canView: false,
    canSave: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canPrint: false
};
