import { Client } from "@/types/client-supplier";

export const mockClients: Client[] = [
  {
    id: "1",
    clientName: "ABC Corporation",
    address: "123 Business Street, Mumbai, Maharashtra 400001",
    mobileNumber: "9876543210",
    email: "contact@abccorp.com",
    gstNumber: "27AAAAA0000A1Z5",
    state: "Maharashtra",
    country: "India",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    clientName: "XYZ Industries",
    address: "456 Industrial Area, Delhi 110001",
    mobileNumber: "9876543211",
    email: "info@xyzind.com",
    gstNumber: "07BBBBB1111B2Z6",
    state: "Delhi",
    country: "India",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
];
