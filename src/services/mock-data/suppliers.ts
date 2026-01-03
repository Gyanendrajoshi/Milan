import { Supplier } from "@/types/client-supplier";

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    supplierName: "DEF Suppliers Ltd",
    address: "789 Supply Road, Pune, Maharashtra 411001",
    mobileNumber: "9876543220",
    email: "sales@defsuppliers.com",
    gstNumber: "27CCCCC2222C3Z7",
    excessQuantityTolerance: 10,
    state: "Maharashtra",
    country: "India",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    supplierName: "GHI Materials Co",
    address: "321 Materials Avenue, Bangalore, Karnataka 560001",
    mobileNumber: "9876543221",
    email: "contact@ghimaterials.com",
    gstNumber: "29DDDDD3333D4Z8",
    excessQuantityTolerance: 5,
    state: "Karnataka",
    country: "India",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    supplierName: "MK Enterprises (Local)",
    address: "123 Industrial Area, Indore, Madhya Pradesh 452001",
    mobileNumber: "9876543222",
    email: "info@mkenterprises.com",
    gstNumber: "23ABCDE1234F1Z5",
    excessQuantityTolerance: 5,
    state: "Madhya Pradesh",
    country: "India",
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2024-12-20"),
  }
];
