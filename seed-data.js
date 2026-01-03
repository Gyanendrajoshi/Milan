/**
 * Seed Script for Testing
 * Run this in browser console to populate localStorage with sample data
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Refresh the page
 */

// Helper function to generate sample data
const seedLocalStorage = () => {
    console.log("🌱 Starting to seed localStorage...");

    // 1. Clients
    const clients = [
        {
            id: "CLI1735625000001",
            clientName: "ABC Corporation",
            contactPerson: "Rajesh Kumar",
            mobile: "9876543210",
            email: "rajesh@abc.com",
            address: "123 Business Park, Mumbai",
            gstNo: "27AABCU9603R1ZM",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "CLI1735625000002",
            clientName: "XYZ Industries",
            contactPerson: "Priya Sharma",
            mobile: "9876543211",
            email: "priya@xyz.com",
            address: "456 Industrial Area, Delhi",
            gstNo: "07AABCX1234A1Z5",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_CLIENTS", JSON.stringify(clients));
    console.log("✅ Clients seeded:", clients.length);

    // 2. Suppliers
    const suppliers = [
        {
            id: "SUP1735625000001",
            supplierName: "Paper Suppliers Ltd",
            contactPerson: "Amit Patel",
            mobile: "9876543212",
            email: "amit@papersuppliers.com",
            address: "789 Supply Street, Ahmedabad",
            gstNo: "24AABCS1234B1Z6",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_SUPPLIERS", JSON.stringify(suppliers));
    console.log("✅ Suppliers seeded:", suppliers.length);

    // 3. Categories
    const categories = [
        {
            id: "CAT1735625000001",
            categoryName: "Flexible Packaging",
            categoryCode: "CAT001",
            processIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "CAT1735625000002",
            categoryName: "Labels",
            categoryCode: "CAT002",
            processIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    localStorage.setItem("MILAN_CATEGORIES", JSON.stringify(categories));
    console.log("✅ Categories seeded:", categories.length);

    // 4. Processes
    const processes = [
        {
            id: "PROC1735625000001",
            code: "PM00001",
            name: "Printing",
            chargeType: "rate_per_kg",
            isUnitConversion: false,
            rate: 500
        },
        {
            id: "PROC1735625000002",
            code: "PM00002",
            name: "Laminating",
            chargeType: "rate_per_kg",
            isUnitConversion: true,
            rate: 1200
        },
        {
            id: "PROC1735625000003",
            code: "PM00003",
            name: "Slitting",
            chargeType: "rate_per_hour",
            isUnitConversion: false,
            rate: 800
        }
    ];
    localStorage.setItem("MILAN_PROCESSES", JSON.stringify(processes));
    console.log("✅ Processes seeded:", processes.length);

    // 5. HSN Codes
    const hsnCodes = [
        {
            id: "HSN1735625000001",
            name: "Plastic Film",
            hsnCode: "39201",
            gstPercentage: 18,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "HSN1735625000002",
            name: "Paper Products",
            hsnCode: "48191",
            gstPercentage: 12,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_HSN", JSON.stringify(hsnCodes));
    console.log("✅ HSN Codes seeded:", hsnCodes.length);

    // 6. Rolls
    const rolls = [
        {
            id: "ROLL1735625000001",
            itemType: "Film",
            itemCode: "ROLL001",
            itemName: "BOPP Film 20 Micron",
            rollWidthMM: 400,
            thicknessMicron: 20,
            faceGSM: 18,
            totalGSM: 18,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 150,
            hsnCode: "39201",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "ROLL1735625000002",
            itemType: "Paper",
            itemCode: "ROLL002",
            itemName: "Kraft Paper 80 GSM",
            rollWidthMM: 500,
            totalGSM: 80,
            purchaseUnit: "Kg",
            stockUnit: "Kg",
            purchaseRate: 45,
            hsnCode: "48191",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_ROLLS", JSON.stringify(rolls));
    console.log("✅ Rolls seeded:", rolls.length);

    // 7. Tools
    const tools = [
        {
            id: "TOOL1735625000001",
            itemCode: "PC001",
            toolPrefix: "PRINTING CYLINDER",
            toolPrefixCode: "PC",
            toolNo: "001",
            toolName: "Printing Cylinder 8 Color",
            noOfTeeth: 120,
            circumferenceMM: 500,
            circumferenceInch: 19.69,
            purchaseUnit: "Nos",
            purchaseRate: 50000,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_TOOLS", JSON.stringify(tools));
    console.log("✅ Tools seeded:", tools.length);

    // 8. Materials
    const materials = [
        {
            id: "MAT1735625000001",
            itemCode: "MAT001",
            itemName: "Printing Ink - Cyan",
            category: "Ink",
            unit: "Kg",
            hsnCode: "32151100",
            gstPercent: 18,
            purchaseRate: 450,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    localStorage.setItem("MILAN_MATERIALS", JSON.stringify(materials));
    console.log("✅ Materials seeded:", materials.length);

    console.log("🎉 All data seeded successfully!");
    console.log("📊 Summary:");
    console.log("  - Clients: " + clients.length);
    console.log("  - Suppliers: " + suppliers.length);
    console.log("  - Categories: " + categories.length);
    console.log("  - Processes: " + processes.length);
    console.log("  - HSN Codes: " + hsnCodes.length);
    console.log("  - Rolls: " + rolls.length);
    console.log("  - Tools: " + tools.length);
    console.log("  - Materials: " + materials.length);
    console.log("🔄 Please refresh the page to see the data!");
};

// Run the seed function
seedLocalStorage();
