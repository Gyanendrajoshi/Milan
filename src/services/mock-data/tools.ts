import { ToolMaster } from "@/types/tool-master";

export let mockTools: ToolMaster[] = [
    {
        id: "1",
        itemCode: "PC12345", // Prefix + Random 5 digit
        toolPrefix: "PRINTING CYLINDER",
        toolPrefixCode: "PC",
        toolNo: "PC12345", // Typically ToolNo and ItemCode are synced for tools
        toolName: "8 Color Printing Cylinder",
        location: "Warehouse A",
        toolRefCode: "PC-REF-001",
        manufacturer: "Zecher GmbH",
        noOfTeeth: 0,
        circumferenceMM: 628.32,
        circumferenceInch: 24.74,
        hsnCode: "8442",
        purchaseUnit: "NOS",
        purchaseRate: 85000,
        toolDescription: "High precision printing cylinder for 8-color flexo printing",
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-10"),
    },
    {
        id: "2",
        itemCode: "FD67890", // FD + Random 5 digit
        toolPrefix: "FLEXO DIE",
        toolPrefixCode: "D",
        toolNo: "FD67890", // Synced
        toolName: "Rotary Die Cutting Tool",
        location: "Production Floor",
        toolRefCode: "D-REF-042",
        manufacturer: "Harper Corporation",
        noOfTeeth: 32,
        circumferenceMM: 500,
        circumferenceInch: 19.69,
        hsnCode: "8443",
        purchaseUnit: "NOS",
        purchaseRate: 45000,
        toolDescription: "Rotary die for precise cutting applications",
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
    },
];
