export type ToolPrefixType =
    | "PLATES"
    | "PRINTING CYLINDER"
    | "ANILOX CYLINDER"
    | "EMBOSSING CYLINDER"
    | "FLEXO DIE"
    | "MAGNETIC CYLINDER";

export const toolPrefixMap: Record<ToolPrefixType, string> = {
    "PLATES": "PL",
    "PRINTING CYLINDER": "PC",
    "ANILOX CYLINDER": "AC",
    "EMBOSSING CYLINDER": "EC",
    "FLEXO DIE": "D",
    "MAGNETIC CYLINDER": "MC",
};

export interface ToolMaster {
    id: string;
    itemCode: string; // Unified Item Code (e.g. PC001)
    toolPrefix: ToolPrefixType;
    toolPrefixCode: string; // Auto-generated from toolPrefix
    toolNo: string;
    toolName: string;
    location?: string;
    cabinet?: string;
    shelf?: string;
    bin?: string;
    toolType?: string;
    machineName?: string;
    cylinderType?: string;
    make?: string;
    printType?: string;
    category?: string;
    supplierName?: string;
    purchaseDate?: Date;
    status?: string;
    drawingNo?: string;
    revNo?: string;
    remark?: string;
    usageCount?: number;
    size?: string;
    width?: string;
    height?: string;
    thickness?: string;
    unit?: string;
    jobCode?: string;
    jobName?: string;
    toolRefCode?: string;
    manufacturer?: string;
    noOfTeeth?: number;
    circumferenceMM?: number;
    circumferenceInch?: number;
    hsnCode?: string;
    purchaseUnit?: string;
    purchaseRate?: number;

    toolDescription?: string;

    // PLATES
    colorDetails?: string;
    plates?: string;

    // ANILOX CYLINDER
    lpi?: string;
    bcm?: string;

    // FLEXO DIE
    jobSize?: string;
    acrossUps?: number;
    aroundUps?: number;
    acrossGap?: number;
    aroundGap?: number;
    createdAt: Date;
    updatedAt: Date;
}


export type ToolMasterFormData = Omit<ToolMaster, "id" | "createdAt" | "updatedAt" | "toolPrefixCode">;
