# Milan Print Management System (PMS)

## 📌 Project Overview
Milan PMS is a comprehensive web-based Enterprise Resource Planning (ERP) application designed specifically for the Printing and Packaging industry. It manages the entire lifecycle of a printing job, from Estimation and Costing to Inventory Management, Production Tracking, and Final Dispatch.

## 🛠 Tech Stack
-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Library**: Shadcn UI (Radix Primitives)
-   **State Management**: LocalStorage (Prototype) / Service-based Architecture
-   **Form Handling**: React Hook Form + Zod Validation
-   **Icons**: Lucide React
-   **Tables**: TanStack Table (React Table v8)
-   **Notifications**: Sonner (Toasts)

## 🎨 UI/UX Design System & Patterns
To maintain consistency across upcoming modules, adhere to the following design system:

### 1. Theme & Colors
-   **Primary Gradient**: `bg-theme-gradient-r` (Blue to Purple linear gradient). Used for Header Bars, Primary Buttons (`Action Buttons`), and Active States.
-   **Backgrounds**: Clean white (`bg-background`) or subtle slate (`bg-slate-50/50`) for page backgrounds.
-   **Text**: `text-foreground` (Dark), `text-muted-foreground` (Gray for labels/secondary info).

### 2. Layout Structure
-   **Sidebar Layout**: Left fixed sidebar `MainSidebar` with collapsible functionality.
-   **Page Header**: Top strip with Breadcrumbs and Page Title.
-   **Card Pattern**:
    -   Content is usually wrapped in `Card`, `CardHeader` (Gradient), and `CardContent`.
    -   **List Views**: Use `DataTable` component with `columns.tsx` definitions.
    -   **Forms**: Use `Dialog` (Modals) or dedicated pages (`/create`) for complex forms.

### 3. Component Usage
-   **Buttons**:
    -   **Primary**: `bg-theme-gradient-r text-white shadow-md hover:opacity-90`
    -   **Efficient/Small**: `size="sm"` or `h-8` for table actions.
    -   **Destructive**: `variant="destructive"` or `hover:text-red-600` for deletions.
-   **Inputs**: Standard Shadcn `Input`, `Select`, `Checkbox`.
-   **Feedback**: Use `toast.success("Message")` or `toast.error("Message")` for all async actions.
-   **Loading States**: Use `Loader2` (animate-spin) for async operations.

### 4. Data Handling Pattern
-   **Service Layer**: All data operations (CRUD) must go through `src/services/*.ts`.
-   **Validation**: Zod schemas in `src/lib/validations/*.ts` are mandatory for all forms.
-   **Storage**: Currently using `localStorage` simulated via `storage` services. Ensure `useEffect` is used for client-side fetching to avoid hydration errors.

---

## 🚀 Core Features & Modules

### 1. Masters (Configuration)
-   **Roll Master**: Manage Paper/Film Rolls (Size, GSM, Material).
-   **Hsn Master**: Tax codes and GST rates.
-   **Client & Supplier**: Contact databases with validations.
-   **Material Master**: Raw materials (Inks, Chemicals, Boxes) with Units.
-   **Tool Master**: Dies, Cylinders, Plates management.

### 2. Commercial / Pre-Press
-   **Estimation (Costing Sheet)**:
    -   Complex calculator for Job Costing.
    -   Inputs: Paper, Film, Cylinder, Operations (Printing, Lamination, Slitting, etc.).
    -   Outputs: Per Unit Cost, Profit Margins, Total Quote.
-   **Job Card**: converted from approved Estimations. Acts as the "Production Order".

### 3. Inventory Management (Store)
-   **Purchase Order (PO)**: Request materials from suppliers.
-   **GRN (Goods Receipt Note)**: Inward material, generating Barcodes/Batches.
-   **Stock Register**: Live view of available materials (Raw & Finished).
-   **Material Issue**:
    -   Issue materials to specific Job Cards or Departments.
    -   Supports **QR Code Scanning** (Batch-wise FIFO).
    -   Validates Stock availability before issue.

### 4. Production (Work In Progress) - *Upcoming*
-   **Goal**: Track the lifecycle of a Job Card through various machine operations.
-   **Features**:
    -   Daily Production Entry (DPE).
    -   Machine & Operator mapping.
    -   Wastage Recording.
    -   Status Tracking (Pending -> In Production -> Completed).

### 5. Dispatch & Returns - *Upcoming*
-   **Dispatch**: Create Challans/Invoices for finished goods.
-   **Returns**:
    -   **RGP (Returnable Gate Pass)**: Sending cylinders/dies for repair.
    -   **Material Return**: Returning rejected raw material to supplier.

---

## 📂 Project Structure
```
src/
├── app/                  # Next.js App Router Pages
│   ├── dashboard/        # Main Dashboard
│   ├── inventory/        # GRN, Stock, Issue, PO Pages
│   ├── masters/          # Configuration Masters
│   └── ...
├── components/           # React Components
│   ├── form/             # Reusable Form Wrappers
│   ├── inventory/        # Inventory specific (Dialogs, Lists)
│   ├── layout/           # Sidebar, Header
│   └── ui/               # Shadcn UI Primitives
├── contexts/             # Global State (Search, Theme)
├── hooks/                # Custom Hooks (useDebounce, useBacchaSearch)
├── lib/
│   ├── utils.ts          # Styles utility (cn)
│   └── validations/      # Zod Schemas
├── services/             # API/Storage Layer (Business Logic)
│   ├── storage/          # Master Storage
│   ├── grn-storage.ts    # Inventory Logic
│   └── ...
└── types/                # TypeScript Interfaces
```

## 📝 Developer Notes
-   **Hydration**: Always wrap Client Components specifically those using `localStorage` or `window` in a `useEffect` mounted check if they affect initial render.
-   **Strict Mode**: React Strict Mode is ON. Ensure side-effects in `useEffect` are idempotent.
-   **Radix UI**: Ensure unique IDs for accessibility to prevent SSR mismatch errors.
