# Milan Print Management System (PMS)

## 📌 Project Overview
Milan PMS is a comprehensive web-based Enterprise Resource Planning (ERP) application designed specifically for the Printing and Packaging industry. It manages the entire lifecycle of a printing job, from Estimation and Costing to Inventory Management, Production Tracking, and Final Dispatch.

## ✨ Recent Updates (January 2026)

### 🎯 Process Cost Manual Override System (Root Cause Fix)
- **Problem Solved**: Manual edits to process costs were being overridden by formula recalculation
- **Solution**: Implemented tracking system with `isManualQuantity` and `isManualRate` flags
- **User Experience**: Visual indicators (🔵 blue = auto, 🟠 orange + dot = manual) show field status
- **Result**: Manual values persist even when material/quantity changes

### ⚠️ Roll Data Validation
- Automatic warnings for suspicious roll master data (width < 100mm, GSM < 20gsm)
- Prevents calculation errors from incorrect data entry

### 🔧 Dialog Re-selection Fix
- Implemented "Dialog Key Pattern" to ensure proper state reset
- Selection dialogs now work correctly on multiple opens

### 💰 Financial Panel Improvements
- Setup charges removed from all calculations
- Clear calculation hierarchy: Material + Processes + Additional → Total → Unit Cost
- Final Price is user-controlled (not auto-filled)

### 🌙 Theme & Build Fixes
- Forced light theme by default (disabled OS dark mode detection)
- Fixed Vercel build issues (React 19 compatibility)
- Removed duplicate imports and added proper Suspense boundaries

---

## 🛠 Tech Stack
-   **Framework**: Next.js 16 (App Router with Turbopack)
-   **React**: React 19.2.1
-   **Language**: TypeScript 5 (Strict Mode)
-   **Styling**: Tailwind CSS v4
-   **UI Library**: Shadcn UI (Radix Primitives)
-   **State Management**: LocalStorage (Prototype) / Service-based Architecture
-   **Form Handling**: React Hook Form + Zod Validation
-   **Icons**: Lucide React
-   **Tables**: TanStack Table (React Table v8)
-   **Notifications**: Sonner (Toasts)
-   **Build Tool**: Turbopack (Next.js 16 default)

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

## 🎯 Estimation Module - Advanced Features

### Manual Override System for Process Costs
The estimation module includes a sophisticated **manual override tracking system** that allows users to manually edit process cost formulas and rates while preserving auto-calculation capabilities.

**Key Features:**
- **Dual Mode Operation**: Fields can be auto-calculated (formula-based) or manually overridden
- **Visual Indicators**:
  - 🔵 **Blue border** = Auto-calculated from formula
  - 🟠 **Orange border + dot** = Manually edited by user
- **Persistent Overrides**: Manual values are preserved even when material/quantity changes
- **Independent Tracking**: Quantity (FORMULA) and Rate can be overridden independently

**Implementation Details:**
```typescript
// Type System (src/types/estimation.ts)
processCostSchema = z.object({
    processId: z.string(),
    processName: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number(),
    isManualQuantity: z.boolean().default(false), // Tracks manual quantity edits
    isManualRate: z.boolean().default(false),     // Tracks manual rate edits
});

// Calculator Logic (src/lib/calculators/estimation-calculator.ts)
calculateProcessCost: (proc, totals) => {
    let finalQuantity = proc.quantity;
    if (!proc.isManualQuantity) {
        // Auto-calculate from formula (Per KG, Per RM, etc.)
        finalQuantity = calculateFromFormula(proc.rateType, totals);
    }
    // Otherwise use user's manual value
    const amount = finalQuantity * finalRate; // No setup charges
    return { quantity: finalQuantity, rate: finalRate, amount };
}
```

**Use Cases:**
- **Negotiated Pricing**: Override auto-calculated rate with negotiated client rate
- **Volume Discounts**: Adjust quantity/rate for bulk orders
- **Rush Charges**: Increase rate for urgent jobs
- **Production Optimization**: Manually set optimized quantities based on shop floor experience

### Roll Data Validation
Automatic validation warns users about suspicious roll master data:
- Roll Width < 100mm → Suggests possible data entry error (e.g., 12mm instead of 1200mm)
- Roll GSM < 20gsm → Flags unusually low values that cause near-zero material costs

### Dialog State Management
**Dialog Key Pattern** ensures proper state reset:
- Each dialog has a key that increments on open (`dialogKey++`)
- Forces complete component re-mount with fresh state
- Prevents stale data and selection issues

### Financial Calculations
- **Setup Charges**: Completely removed (Amount = Quantity × Rate only)
- **Final Price**: User-controlled input (not auto-filled)
- **Total Order Value**: Auto-calculates as Final Price × Order Qty
- **Unit Cost**: Includes GST in calculation for accurate profitability analysis

---

## 📚 Backend Documentation

Milan PMS is designed with a **clear separation between frontend and backend**. The backend follows a **multi-tenant SaaS architecture** with row-level data isolation.

### Backend Architecture Documents

For complete backend implementation details, refer to these comprehensive guides:

1. **[BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md)** (Primary Reference)
   - Complete architecture overview
   - Multi-tenancy strategy (Row-Level with TenantId)
   - Full database schema with all tables
   - BaseRepository pattern for automatic TenantId filtering
   - TenantResolutionMiddleware for tenant identification
   - Security and authentication (JWT)
   - Performance optimization strategies
   - Migration plan (localStorage → API)
   - **Critical DO NOT DO rules** (schema-per-tenant, database-per-tenant)

2. **[BACKEND_CODE_EXAMPLES.md](BACKEND_CODE_EXAMPLES.md)** (Code Reference) ⭐ **v2.0 - Now with Inventory Transactions**
   - Complete Client module implementation (all layers)
   - Complete Slitting module with business logic
   - **Inventory Transaction Integration** (GRN, Issue, Slitting examples) ⭐ **CRITICAL**
   - Database connection factory
   - JWT token service
   - Error handling middleware
   - Program.cs configuration
   - Frontend API integration with adapter pattern

3. **[BACKEND_INVENTORY_LEDGER.md](BACKEND_INVENTORY_LEDGER.md)** ⭐ **NEW - Inventory Transaction System**
   - Complete database schema (InventoryTransactions, InventoryLedger, FIFOQueue)
   - InventoryTransactionService implementation
   - FIFO cost calculation logic
   - Stock valuation and reporting
   - Integration with all inventory modules
   - **Required for GST compliance and audit trail**

4. **[API_REFERENCE.md](API_REFERENCE.md)** (API Documentation)
   - All REST API endpoints with examples
   - Request/response formats
   - Authentication flows
   - Error codes and handling
   - Pagination and filtering
   - Rate limiting
   - cURL and Postman examples

### Technology Stack (Backend)

-   **Framework**: ASP.NET Core 8.0 Web API
-   **Data Access**: ADO.NET (Direct SQL for performance)
-   **Database**: MS SQL Server 2019+
-   **Authentication**: JWT Bearer Tokens
-   **Multi-Tenancy**: Row-Level (TenantId column in all business tables)
-   **API Documentation**: Swagger/OpenAPI

### Key Architecture Decisions

✅ **Row-Level Multi-Tenancy**
- Single database `Milan_ERP`, single schema `dbo`
- `TenantId` column in all business tables
- Automatic filtering via BaseRepository pattern
- Scalable to 1000+ tenants

❌ **Rejected Approaches**
- Schema-per-tenant (creates migration hell)
- Database-per-tenant (infrastructure nightmare)

### Frontend ↔ Backend Integration

**Zero Breaking Changes Strategy**:
- Adapter pattern in storage services
- Feature flag: `NEXT_PUBLIC_USE_BACKEND=true/false`
- localStorage fallback for offline development
- Gradual module-by-module migration

**Example**:
```typescript
// src/services/storage/client-storage.ts
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

export const clientStorage = {
    getAll: async () => {
        if (USE_BACKEND) {
            return await apiClient.get('clients'); // API call
        } else {
            return JSON.parse(localStorage.getItem('MILAN_CLIENTS') || '[]'); // Existing code
        }
    }
};
```

---

## 📝 Developer Notes
-   **Hydration**: Always wrap Client Components specifically those using `localStorage` or `window` in a `useEffect` mounted check if they affect initial render.
-   **Strict Mode**: React Strict Mode is ON. Ensure side-effects in `useEffect` are idempotent.
-   **Radix UI**: Ensure unique IDs for accessibility to prevent SSR mismatch errors.
-   **Manual Override Pattern**: When implementing editable auto-calculated fields, use the manual override pattern with `isManual` flags to preserve user edits during recalculation.
