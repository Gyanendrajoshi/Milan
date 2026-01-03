import { HSNMaster } from "@/types/hsn-master";

export const mockHSN: HSNMaster[] = [
  {
    id: "1",
    name: "Printed Cartons",
    hsnCode: "4819",
    gstPercentage: 18,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "BOPP Films",
    hsnCode: "3920",
    gstPercentage: 18,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    name: "Printing Plates",
    hsnCode: "8442",
    gstPercentage: 18,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
];
