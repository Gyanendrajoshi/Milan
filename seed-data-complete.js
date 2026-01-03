/**
 * Complete Seed Data Script for Milan ERP
 * 
 * This script populates localStorage with realistic sample data for all master modules.
 * Run this in browser console to quickly set up test data.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Refresh the page
 * 
 * To clear all data: localStorage.clear(); location.reload();
 */

const seedAllData = () => {
    console.log("🌱 Starting complete data seeding...\n");

    // ============================================
    // 1. CLIENTS
    // ============================================
    const clients = [
        {
            id: "CLI1735625001",
            clientName: "ABC Packaging Pvt Ltd",
            contactPerson: "Rajesh Kumar",
            mobile: "9876543210",
            email: "rajesh@abcpackaging.com",
            address: "Plot 123, GIDC Estate, Vatva, Ahmedabad - 382445, Gujarat",
            gstNo: "24AABCA1234B1Z5",
            panNo: "AABCA1234B",
            state: "Gujarat",
            pincode: "382445",
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "CLI1735625002",
            clientName: "XYZ Foods Industries",
            contactPerson: "Priya Sharma",
            mobile: "9876543211",
            email: "priya@xyzfoods.com",
            address: "456 Industrial Area, Phase 2, Noida - 201301, Uttar Pradesh",
            gstNo: "09AABCX5678C1Z6",
            panNo: "AABCX5678C",
            state: "Uttar Pradesh",
            pincode: "201301",
            createdAt: new Date("2024-02-10"),
            updatedAt: new Date("2024-02-10")
        },
        {
            id: "CLI1735625003",
            clientName: "PQR Pharmaceuticals Ltd",
            contactPerson: "Amit Patel",
            mobile: "9876543212",
            email: "amit@pqrpharma.com",
            address: "789 Pharma Park, Andheri East, Mumbai - 400059, Maharashtra",
            gstNo: "27AABCP9012D1Z7",
            panNo: "AABCP9012D",
            state: "Maharashtra",
            pincode: "400059",
            createdAt: new Date("2024-03-05"),
            updatedAt: new Date("2024-03-05")
        }
    ];
    localStorage.setItem("MILAN_CLIENTS", JSON.stringify(clients));
    console.log("✅ Clients seeded:", clients.length);

    // ============================================
    // 2. SUPPLIERS
    // ============================================
    const suppliers = [
        {
            id: "SUP1735625001",
            supplierName: "Jindal Poly Films Ltd",
            contactPerson: "Suresh Jindal",
            mobile: "9876543213",
            email: "suresh@jindalpolyfilms.com",
            address: "Plot 45, Industrial Estate, Nasik - 422010, Maharashtra",
            gstNo: "27AABCJ3456E1Z8",
            panNo: "AABCJ3456E",
            state: "Maharashtra",
            pincode: "422010",
            createdAt: new Date("2024-01-20"),
            updatedAt: new Date("2024-01-20")
        },
        {
            id: "SUP1735625002",
            supplierName: "Supreme Inks & Chemicals",
            contactPerson: "Ramesh Gupta",
            mobile: "9876543214",
            email: "ramesh@supremeinks.com",
            address: "567 Chemical Zone, Vapi - 396195, Gujarat",
            gstNo: "24AABCS6789F1Z9",
            panNo: "AABCS6789F",
            state: "Gujarat",
            pincode: "396195",
            createdAt: new Date("2024-02-15"),
            updatedAt: new Date("2024-02-15")
        },
        {
            id: "SUP1735625003",
            supplierName: "Adhesive Solutions India",
            contactPerson: "Neha Verma",
            mobile: "9876543215",
            email: "neha@adhesivesolutions.com",
            address: "890 Industrial Area, Faridabad - 121003, Haryana",
            gstNo: "06AABCA2345G1Z0",
            panNo: "AABCA2345G",
            state: "Haryana",
            pincode: "121003",
            createdAt: new Date("2024-03-01"),
            updatedAt: new Date("2024-03-01")
        }
    ];
    localStorage.setItem("MILAN_SUPPLIERS", JSON.stringify(suppliers));
    console.log("✅ Suppliers seeded:", suppliers.length);

    // ============================================
    // 3. HSN CODES
    // ============================================
    const hsnCodes = [
        {
            id: "HSN1735625001",
            name: "Plastic Film - BOPP",
            hsnCode: "39201",
            gstPercentage: 18,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10")
        },
        {
            id: "HSN1735625002",
            name: "Paper Products",
            hsnCode: "48191",
            gstPercentage: 12,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10")
        },
        {
            id: "HSN1735625003",
            name: "Printing Ink",
            hsnCode: "32151100",
            gstPercentage: 18,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10")
        },
        {
            id: "HSN1735625004",
            name: "Adhesives",
            hsnCode: "35069900",
            gstPercentage: 18,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10")
        },
        {
            id: "HSN1735625005",
            name: "Aluminum Foil",
            hsnCode: "76071900",
            gstPercentage: 18,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-10")
        }
    ];
    localStorage.setItem("MILAN_HSN", JSON.stringify(hsnCodes));
    console.log("✅ HSN Codes seeded:", hsnCodes.length);

    // ============================================
    // 4. PROCESSES
    // ============================================
    const processes = [
        {
            id: "PROC1735625001",
            code: "PM00001",
            name: "Printing - Flexo",
            chargeType: "rate_per_kg",
            isUnitConversion: false,
            rate: 45
        },
        {
            id: "PROC1735625002",
            code: "PM00002",
            name: "Lamination - Solvent Based",
            chargeType: "rate_per_kg",
            isUnitConversion: true,
            rate: 35
        },
        {
            id: "PROC1735625003",
            code: "PM00003",
            name: "Lamination - Solventless",
            chargeType: "rate_per_kg",
            isUnitConversion: true,
            rate: 40
        },
        {
            id: "PROC1735625004",
            code: "PM00004",
            name: "Slitting",
            chargeType: "rate_per_hour",
            isUnitConversion: false,
            rate: 800
        },
        {
            id: "PROC1735625005",
            code: "PM00005",
            name: "Pouching - 3 Side Seal",
            chargeType: "rate_per_unit",
            isUnitConversion: false,
            rate: 0.35
        },
        {
            id: "PROC1735625006",
            code: "PM00006",
            name: "Pouching - Center Seal",
            chargeType: "rate_per_unit",
            isUnitConversion: false,
            rate: 0.30
        },
        {
            id: "PROC1735625007",
            code: "PM00007",
            name: "Die Cutting",
            chargeType: "rate_per_kg",
            isUnitConversion: false,
            rate: 25
        }
    ];
    localStorage.setItem("MILAN_PROCESSES", JSON.stringify(processes));
    console.log("✅ Processes seeded:", processes.length);

    // ============================================
    // 5. CATEGORIES
    // ============================================
    const categories = [
        {
            id: "CAT1735625001",
            categoryName: "Flexible Packaging",
            categoryCode: "CAT001",
            description: "Flexible packaging materials for food and pharma",
            processIds: ["PROC1735625001", "PROC1735625002", "PROC1735625004"],
            createdAt: new Date("2024-01-12").toISOString(),
            updatedAt: new Date("2024-01-12").toISOString()
        },
        {
            id: "CAT1735625002",
            categoryName: "Labels & Stickers",
            categoryCode: "CAT002",
            description: "Self-adhesive labels and stickers",
            processIds: ["PROC1735625001", "PROC1735625007"],
            createdAt: new Date("2024-01-12").toISOString(),
            updatedAt: new Date("2024-01-12").toISOString()
        },
        {
            id: "CAT1735625003",
            categoryName: "Pouches",
            categoryCode: "CAT003",
            description: "Stand-up pouches and flat pouches",
            processIds: ["PROC1735625001", "PROC1735625003", "PROC1735625005", "PROC1735625006"],
            createdAt: new Date("2024-01-12").toISOString(),
            updatedAt: new Date("2024-01-12").toISOString()
        }
    ];
    localStorage.setItem("MILAN_CATEGORIES", JSON.stringify(categories));
    console.log("✅ Categories seeded:", categories.length);

    // ============================================
    // 6. ROLLS (Film & Paper)
    // ============================================
    const rolls = [
        {
            id: "ROLL1735625001",
            itemType: "Film",
            itemCode: "RF96600",  // Film = RF + 5 digits
            itemName: "BOPP Film 20 Micron",
            supplierItemCode: "BOPP-20",
            mill: "Jindal Poly Films",
            quality: "Premium Grade",
            rollWidthMM: 400,
            thicknessMicron: 20,
            density: 0.91,
            faceGSM: 18.2,
            totalGSM: 18.2,
            shelfLifeDays: 365,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 145,
            hsnCode: "39201",
            location: "Warehouse A - Rack 1",
            supplierName: "Jindal Poly Films Ltd",
            createdAt: new Date("2024-01-25"),
            updatedAt: new Date("2024-01-25")
        },
        {
            id: "ROLL1735625002",
            itemType: "Film",
            itemCode: "RF96601",  // Film = RF + 5 digits
            itemName: "BOPP Film 25 Micron",
            supplierItemCode: "BOPP-25",
            mill: "Jindal Poly Films",
            quality: "Premium Grade",
            rollWidthMM: 500,
            thicknessMicron: 25,
            density: 0.91,
            faceGSM: 22.75,
            totalGSM: 22.75,
            shelfLifeDays: 365,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 148,
            hsnCode: "39201",
            location: "Warehouse A - Rack 1",
            supplierName: "Jindal Poly Films Ltd",
            createdAt: new Date("2024-01-25"),
            updatedAt: new Date("2024-01-25")
        },
        {
            id: "ROLL1735625003",
            itemType: "Film",
            itemCode: "RF96602",  // Film = RF + 5 digits
            itemName: "Polyester Film 12 Micron",
            supplierItemCode: "PET-12",
            mill: "Uflex Ltd",
            quality: "High Clarity",
            rollWidthMM: 450,
            thicknessMicron: 12,
            density: 1.40,
            faceGSM: 16.8,
            totalGSM: 16.8,
            shelfLifeDays: 730,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 185,
            hsnCode: "39201",
            location: "Warehouse A - Rack 2",
            supplierName: "Jindal Poly Films Ltd",
            createdAt: new Date("2024-02-01"),
            updatedAt: new Date("2024-02-01")
        },
        {
            id: "ROLL1735625004",
            itemType: "Paper",
            itemCode: "RP00001",  // Paper = RP + 5 digits
            itemName: "Kraft Paper 80 GSM",
            supplierItemCode: "KP-80",
            mill: "JK Paper Mills",
            quality: "Brown Kraft",
            rollWidthMM: 500,
            totalGSM: 80,
            shelfLifeDays: 180,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 42,
            hsnCode: "48191",
            location: "Warehouse B - Rack 1",
            supplierName: "Jindal Poly Films Ltd",
            createdAt: new Date("2024-02-05"),
            updatedAt: new Date("2024-02-05")
        },
        {
            id: "ROLL1735625005",
            itemType: "Film",
            itemCode: "RF96603",  // Film = RF + 5 digits
            itemName: "Aluminum Foil 9 Micron",
            supplierItemCode: "ALU-9",
            mill: "Hindalco",
            quality: "Food Grade",
            rollWidthMM: 400,
            thicknessMicron: 9,
            density: 2.70,
            faceGSM: 24.3,
            totalGSM: 24.3,
            shelfLifeDays: 730,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 425,
            hsnCode: "76071900",
            location: "Warehouse A - Rack 3",
            supplierName: "Jindal Poly Films Ltd",
            createdAt: new Date("2024-02-10"),
            updatedAt: new Date("2024-02-10")
        }
    ];
    localStorage.setItem("MILAN_ROLLS", JSON.stringify(rolls));
    console.log("✅ Rolls seeded:", rolls.length);

    // ============================================
    // 7. TOOLS (Cylinders, Dies, Plates)
    // ============================================
    const tools = [
        {
            id: "TOOL1735625001",
            itemCode: "PC12345",  // Printing Cylinder = PC + 5 digits
            toolPrefix: "PRINTING CYLINDER",
            toolPrefixCode: "PC",
            toolNo: "001",
            toolName: "Printing Cylinder 8 Color",
            location: "Tool Room A",
            cabinet: "C1",
            shelf: "S2",
            bin: "B3",
            toolType: "Rotogravure",
            machineName: "Flexo Press 1",
            cylinderType: "Engraved",
            make: "Bobst",
            printType: "Flexographic",
            category: "Printing",
            supplierName: "Supreme Inks & Chemicals",
            purchaseDate: new Date("2023-06-15"),
            status: "Active",
            drawingNo: "DRG-PC-001",
            revNo: "R1",
            remark: "8 color printing cylinder for flexible packaging",
            usageCount: 45,
            size: "500mm x 400mm",
            width: "500",
            height: "400",
            unit: "mm",
            jobCode: "JOB2024001",
            jobName: "ABC Packaging - Snack Pouch",
            manufacturer: "Bobst India",
            noOfTeeth: 120,
            circumferenceMM: 500,
            circumferenceInch: 19.69,
            hsnCode: "84439900",
            purchaseUnit: "Nos",
            purchaseRate: 85000,
            createdAt: new Date("2023-06-15"),
            updatedAt: new Date("2024-01-20")
        },
        {
            id: "TOOL1735625002",
            itemCode: "AC12346",  // Anilox Cylinder = AC + 5 digits
            toolPrefix: "ANILOX CYLINDER",
            toolPrefixCode: "AC",
            toolNo: "001",
            toolName: "Anilox Cylinder 200 LPI",
            location: "Tool Room A",
            cabinet: "C1",
            shelf: "S3",
            bin: "B1",
            toolType: "Ceramic",
            machineName: "Flexo Press 1",
            make: "Pamarco",
            category: "Printing",
            supplierName: "Supreme Inks & Chemicals",
            purchaseDate: new Date("2023-07-20"),
            status: "Active",
            remark: "200 LPI anilox for fine printing",
            usageCount: 120,
            circumferenceMM: 400,
            circumferenceInch: 15.75,
            lpi: "200",
            bcm: "3.5",
            hsnCode: "84439900",
            purchaseUnit: "Nos",
            purchaseRate: 45000,
            createdAt: new Date("2023-07-20"),
            updatedAt: new Date("2024-01-20")
        },
        {
            id: "TOOL1735625003",
            itemCode: "D12347",  // Die = D + 5 digits
            toolPrefix: "FLEXO DIE",
            toolPrefixCode: "D",
            toolNo: "001",
            toolName: "Die Cutting Tool - Pouch",
            location: "Tool Room B",
            cabinet: "C2",
            shelf: "S1",
            bin: "B2",
            toolType: "Rotary Die",
            machineName: "Die Cutting Machine 1",
            make: "RotoMetrics",
            category: "Die Cutting",
            supplierName: "Adhesive Solutions India",
            purchaseDate: new Date("2023-08-10"),
            status: "Active",
            drawingNo: "DRG-D-001",
            revNo: "R2",
            remark: "3 side seal pouch die",
            usageCount: 80,
            jobSize: "200mm x 300mm",
            acrossUps: 2,
            aroundUps: 3,
            acrossGap: 5,
            aroundGap: 5,
            circumferenceMM: 600,
            circumferenceInch: 23.62,
            hsnCode: "84439900",
            purchaseUnit: "Nos",
            purchaseRate: 35000,
            createdAt: new Date("2023-08-10"),
            updatedAt: new Date("2024-01-20")
        },
        {
            id: "TOOL1735625004",
            itemCode: "PL12348",  // Plates = PL + 5 digits
            toolPrefix: "PLATES",
            toolPrefixCode: "PL",
            toolNo: "001",
            toolName: "Flexo Printing Plate Set",
            location: "Tool Room A",
            cabinet: "C1",
            shelf: "S1",
            bin: "B1",
            toolType: "Photopolymer",
            machineName: "Flexo Press 2",
            make: "Flint Group",
            category: "Printing",
            supplierName: "Supreme Inks & Chemicals",
            purchaseDate: new Date("2024-01-05"),
            status: "Active",
            remark: "4 color plate set for label printing",
            usageCount: 15,
            colorDetails: "CMYK - 4 Colors",
            plates: "4",
            thickness: "1.7",
            unit: "mm",
            jobCode: "JOB2024005",
            jobName: "XYZ Foods - Label",
            hsnCode: "84439900",
            purchaseUnit: "Set",
            purchaseRate: 12000,
            createdAt: new Date("2024-01-05"),
            updatedAt: new Date("2024-01-20")
        }
    ];
    localStorage.setItem("MILAN_TOOLS", JSON.stringify(tools));
    console.log("✅ Tools seeded:", tools.length);

    // ============================================
    // 8. MATERIALS (Inks, Adhesives, etc.)
    // ============================================
    const materials = [
        {
            id: "MAT1735625001",
            itemCode: "M00001",  // Material = M + 5 digits
            itemName: "Printing Ink - Cyan",
            category: "Ink",
            description: "Solvent based cyan ink for flexo printing",
            unit: "Kg",
            hsnCode: "32151100",
            gstPercent: 18,
            purchaseRate: 450,
            supplierName: "Supreme Inks & Chemicals",
            location: "Chemical Store - Rack A1",
            minStockLevel: 50,
            maxStockLevel: 200,
            reorderLevel: 75,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "MAT1735625002",
            itemCode: "M00002",  // Material = M + 5 digits
            itemName: "Printing Ink - Magenta",
            category: "Ink",
            description: "Solvent based magenta ink for flexo printing",
            unit: "Kg",
            hsnCode: "32151100",
            gstPercent: 18,
            purchaseRate: 455,
            supplierName: "Supreme Inks & Chemicals",
            location: "Chemical Store - Rack A1",
            minStockLevel: 50,
            maxStockLevel: 200,
            reorderLevel: 75,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "MAT1735625003",
            itemCode: "M00003",  // Material = M + 5 digits
            itemName: "Printing Ink - Yellow",
            category: "Ink",
            description: "Solvent based yellow ink for flexo printing",
            unit: "Kg",
            hsnCode: "32151100",
            gstPercent: 18,
            purchaseRate: 445,
            supplierName: "Supreme Inks & Chemicals",
            location: "Chemical Store - Rack A1",
            minStockLevel: 50,
            maxStockLevel: 200,
            reorderLevel: 75,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "MAT1735625004",
            itemCode: "M00004",  // Material = M + 5 digits
            itemName: "Printing Ink - Black",
            category: "Ink",
            description: "Solvent based black ink for flexo printing",
            unit: "Kg",
            hsnCode: "32151100",
            gstPercent: 18,
            purchaseRate: 440,
            supplierName: "Supreme Inks & Chemicals",
            location: "Chemical Store - Rack A1",
            minStockLevel: 50,
            maxStockLevel: 200,
            reorderLevel: 75,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "MAT1735625005",
            itemCode: "M00005",  // Material = M + 5 digits
            itemName: "Lamination Adhesive - 2 Part",
            category: "Adhesive",
            description: "Two component polyurethane adhesive for lamination",
            unit: "Kg",
            hsnCode: "35069900",
            gstPercent: 18,
            purchaseRate: 285,
            supplierName: "Adhesive Solutions India",
            location: "Chemical Store - Rack B1",
            minStockLevel: 100,
            maxStockLevel: 500,
            reorderLevel: 150,
            createdAt: new Date("2024-01-18"),
            updatedAt: new Date("2024-01-18")
        },
        {
            id: "MAT1735625006",
            itemCode: "M00006",  // Material = M + 5 digits
            itemName: "Solvent - Ethyl Acetate",
            category: "Solvent",
            description: "Ethyl acetate solvent for ink dilution",
            unit: "Ltr",
            hsnCode: "29153100",
            gstPercent: 18,
            purchaseRate: 95,
            supplierName: "Supreme Inks & Chemicals",
            location: "Chemical Store - Rack C1",
            minStockLevel: 200,
            maxStockLevel: 1000,
            reorderLevel: 300,
            createdAt: new Date("2024-01-20"),
            updatedAt: new Date("2024-01-20")
        },
        {
            id: "MAT1735625007",
            itemCode: "M00007",  // Material = M + 5 digits
            itemName: "Primer - Corona Treatment",
            category: "Coating",
            description: "Surface treatment primer for better adhesion",
            unit: "Kg",
            hsnCode: "32099090",
            gstPercent: 18,
            purchaseRate: 320,
            supplierName: "Adhesive Solutions India",
            location: "Chemical Store - Rack B2",
            minStockLevel: 25,
            maxStockLevel: 100,
            reorderLevel: 40,
            createdAt: new Date("2024-01-22"),
            updatedAt: new Date("2024-01-22")
        }
    ];
    localStorage.setItem("MILAN_MATERIALS", JSON.stringify(materials));
    console.log("✅ Materials seeded:", materials.length);

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n🎉 All data seeded successfully!\n");
    console.log("📊 Summary:");
    console.log("  ├─ Clients: " + clients.length);
    console.log("  ├─ Suppliers: " + suppliers.length);
    console.log("  ├─ HSN Codes: " + hsnCodes.length);
    console.log("  ├─ Processes: " + processes.length);
    console.log("  ├─ Categories: " + categories.length);
    console.log("  ├─ Rolls: " + rolls.length);
    console.log("  ├─ Tools: " + tools.length);
    console.log("  └─ Materials: " + materials.length);
    console.log("\n🔄 Please refresh the page to see the data!");
    console.log("\n💡 Tip: To clear all data, run: localStorage.clear(); location.reload();");
};

// Run the seed function
seedAllData();
