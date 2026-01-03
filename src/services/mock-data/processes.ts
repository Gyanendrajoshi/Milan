import { ProcessMaster } from "@/types/process-master";

export const mockProcesses: ProcessMaster[] = [
    { id: "1", code: "PM00001", name: "Printing", chargeType: "rate_per_plate", isUnitConversion: false, rate: 500 },
    { id: "2", code: "PM00002", name: "Laminating", chargeType: "rate_per_hour", isUnitConversion: true, rate: 1200 },
    { id: "3", code: "PM00003", name: "Slitting", chargeType: "rate_per_hour", isUnitConversion: false, rate: 800 },
    { id: "4", code: "PM00004", name: "Pouching", chargeType: "rate_per_unit", isUnitConversion: false, rate: 0.5 },
];
