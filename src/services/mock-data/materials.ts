import { Material } from "@/types/material-master";

export const mockMaterials: Material[] = [
    {
        id: "1",
        itemCode: "M00001",
        itemName: "Cyan Ink",
        shelfLifeDays: 180,
        itemGroup: "Printing Inks",
        purchaseUnit: "KG",
        purchaseRate: 450,
        hsnCode: "3215",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        itemCode: "M00002",
        itemName: "Adhesive Glue",
        shelfLifeDays: 365,
        itemGroup: "Adhesives",
        purchaseUnit: "KG",
        purchaseRate: 320,
        hsnCode: "3506",
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-16"),
    },
    {
        id: "3",
        itemCode: "M00003",
        itemName: "Lamination Film",
        shelfLifeDays: 730,
        itemGroup: "Packaging Materials",
        purchaseUnit: "SQ MTR",
        purchaseRate: 85,
        hsnCode: "3920",
        createdAt: new Date("2024-01-17"),
        updatedAt: new Date("2024-01-17"),
    },
    // Added Mock Items mapping to POs
    {
        id: "m-flm001",
        itemCode: "RF12345", // Matched with Roll 1
        itemName: "BOPP Gloss Film 12mic",
        shelfLifeDays: 365,
        itemGroup: "Roll",
        purchaseUnit: "Kg",
        purchaseRate: 180,
        hsnCode: "3920",
        gsm: 12,
        widthMm: 600,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    },
    {
        id: "m-flm002",
        itemCode: "RF67890", // Matched with Roll 2
        itemName: "Met Pet Silver 12mic 800mm",
        shelfLifeDays: 365,
        itemGroup: "Roll",
        purchaseUnit: "Kg",
        purchaseRate: 200,
        hsnCode: "3920",
        gsm: 20,
        widthMm: 800,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    },
    {
        id: "m-flm003",
        itemCode: "RF54321", // Matched with Roll 3
        itemName: "Met Pet Gold 12mic 525mm",
        shelfLifeDays: 365,
        itemGroup: "Roll",
        purchaseUnit: "Kg",
        purchaseRate: 210,
        hsnCode: "3920",
        gsm: 20,
        widthMm: 525,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
    }
];
