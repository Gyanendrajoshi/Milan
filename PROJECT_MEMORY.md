# PROJECT MEMORY FILE

## 1. Project Overview
- **Project Name**: Milan
- **Purpose**: Comprehensive Production and Inventory Management System for the Packaging/Printing Industry.
- **Business Domain**: Manufacturing / Packaging (Labels, Films, Pouches).
- **End Users**: Admin, Production Managers, Machine Operators, Store Keepers.
- **Core Problem Solved**: Streamlining the flow from Estimation -> Job Card -> Material Issue -> Production -> Dispatch, replacing manual/excel-based tracking.

## 2. Technology Stack
### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Shadcn UI (Radix Primitives)
- **CSS Method**: Tailwind CSS v4 (with CSS Variables for theming)
- **Font Family**: Arial, Helvetica, sans-serif (System Fonts)
- **Base Font Size**: 14px (Standard text-sm) / 11px (High density tables)
- **Grid System**: Tailwind Grid (Grid Cols)

### Backend
- **Framework**: Next.js API Routes (Serverless) / Client-side Logic
- **Architecture**: Monolithic Frontend with Service Layer Pattern
- **Auth Method**: Simulated / LocalStorage (Currently)

### Database
- **DB Type**: LocalStorage (Persisted via custom Service Layer: `storage.ts`, `production-storage.ts`) / Simulating Relational Schema
- **Naming Convention**: CamelCase (JS/TS), Kebab-Case (URLs)

## 3. UI / UX DESIGN RULES (STRICT)
- **Layout Pattern**: Sidebar (Left Fixed) + Header (Top Full Width Gradient) + Content Area (scrollable).
- **Grid**: Responsive (Card View < 768px, Grid View > 768px).
- **Spacing Rule**: `p-4` (Standard Padding), `gap-4` (Standard Gap). Form layouts use `space-y-4`.
- **Border Radius**: `rounded-md` (0.5rem) for Inputs/Buttons, `rounded-none` for Outer Page Cards.
- **Shadow Style**: `shadow-sm` (Cards), `shadow-none` (Outer Containers).
- **Button Styles**:
  - Primary: `bg-primary text-white`
  - Secondary: `bg-white text-blue-600 border-0 shadow-lg` (Header Actions)
  - Icon Buttons: `h-8 w-8` (Small), `h-9 w-9` (Standard)
- **Form Field Size**: `h-9` (Standard), `h-7`/`h-8` (Dense/Table Inputs).
- **Table Style**:
  - Header: `bg-tertiary/20`, `text-[11px]`, `font-bold`, `tracking-wider`.
  - Content: `text-[11px]`, `font-medium`, `border-b border-border`.
  - Row Hover: `hover:bg-muted/50`.
- **Colors**:
  - Primary: Blue (HSL 221, 83%, 53%)
  - Background: Slate-50/50 (App Background), White (Cards)
  - Header Gradient: `bg-theme-gradient-r` (Cyan to Blue)

⚠️ **Any new page MUST follow these rules exactly.**
- **Page Structure**: `div.container` -> `Card (rounded-none, full height)` -> `CardHeader (Gradient)` -> `CardContent (p-0)`.

## 4. Pages / Modules Status
| Page Name | Purpose | Status | Notes |
|---------|--------|-------|------|
| **Dashboard** | KPI Overview & Quick Actions | Done | Uses Recharts for visualization |
| **Client Master** | Manage Client Database | Done | CRUD Operations |
| **Material Master** | Raw Material Definitions | Done | Attributes, Categories |
| **Process Master** | Define Production Processes | Done | Rate definitions |
| **Estimation** | Cost Calculation & Quotations | Audited & Fixed | Complex Formulas, Multi-content logic, **CRITICAL RISKS IDENTIFIED** |
| **Inventory (GRN)** | Good Receipt Note | Done | Stock In |
| **Inventory (Issue)** | Material Issue to Production | Done | Stock Out (FIFO logic pending) |
| **Inventory (Return)** | Material Return from Production | Done | QR-based, Partial returns, Stock reversal |
| **Inventory (Stock)** | Live Stock View | Done | Filtering & History |
| **Production Entry** | Daily Logs & Tracking | Refined | "Identical" UI achieved |
| **Production List** | Job Progress Overview | Refined | Standardized Layout |

## 5. Business Logic Summary
- **Stock calculation rules**: GRN adds to stock; Issue deducts from stock. Batch persistence is key.
- **Estimation formulas** (Core Calculation Engine: `src/lib/calculators/estimation-calculator.ts`):
  - **Ups Calculation**: `Ups = (Roll Width MM / Job Width MM) * (Roll Circumference MM / Job Length MM)` (Floor value)
  - **Length Required**: `Length = (Order Qty / Ups) * Job Length MM` (in MM)
  - **Paper Weight**: `Weight = (Length MM * Roll Width MM * Roll GSM) / 1550000` (in Kg)
  - **Material Cost**: `Material Cost = Weight * Roll Rate Per Kg`
  - **Process Cost**: Varies by Rate Type:
    - `Rate/Impression`: `Cost = (Order Qty / 1000) * Rate * Colors`
    - `Rate/Sq.Inch/Color`: `Cost = ((Job Width * Job Length) / 645.16) * (Order Qty / 1000) * Rate * Colors` ✅ **FIXED** (Added missing `orderQty` multiplier)
    - `Rate/Sq.Inch`: `Cost = ((Job Width * Job Length) / 645.16) * (Order Qty / 1000) * Rate` ✅ **FIXED**
    - `Rate/Sq.CM`: `Cost = ((Job Width * Job Length) / 100) * (Order Qty / 1000) * Rate` ✅ **FIXED**
    - `Rate/Kg`: `Cost = Weight * Rate`
    - `Rate/Running Meter`: `Cost = (Length MM / 1000) * Rate`
    - `Flat Rate`: `Cost = Rate`
  - **Total Cost**: `Total = Material Cost + Sum(Process Costs)`
  
- **🚨 CRITICAL PRODUCTION RISKS IDENTIFIED** (See `estimation_audit.md` & `complete_system_analysis.md`):
  - **Missing Master Data Gaps (HIGH RISK)**: Calculations proceed silently with zero values (e.g., `rollGSM = 0` → `Material Cost = 0`) without warnings, potentially causing financial loss.
  - **Frontend-Only Logic (HIGH RISK)**: All calculations occur client-side only, posing data integrity risk as values could be manipulated before submission.
  - **Concurrency/Race Conditions (MEDIUM RISK)**: `setTimeout(50)` debounce for `recalculateAll` is brittle and can lead to out-of-order calculations with rapid user input.
  - **No Audit Trail (MEDIUM RISK)**: No versioning or change tracking for estimations, making it impossible to trace who changed what and when.
  
- **Validation rules**:
  - Cannot issue more than available batch stock.
  - Production Qty cannot exceed Job Order Qty (Soft limit).
  - ⚠️ **MISSING**: No validation for zero/negative critical values (Roll GSM, Width, Rate) in estimation calculator.
  
- **Date logic**: `date-fns` used for formatting (dd MMM yyyy).

## 6. Common Components
- **Header**: `CardHeader` with `bg-theme-gradient-r`. Contains Title & Action Buttons.
- **Sidebar**: `AppSidebar` (Left navigation).
- **DataGrid**: `DataTable` (TanStack Table wrapper) - Features: Sorting, Filtering, Export, View Modes.
- **Modal**: `Dialog` (Shadcn) - Used for Forms (Add/Edit).
- **Form Controls**: `Input`, `Select`, `CreatableCombobox`, `DatePicker`.

## 7. API Contracts (Summary)
- **Local Services** (`src/services/`):
  - `storage.ts`: Core Wrapper for Estimations, Masters.
  - `production-storage.ts`: Handles Production Logs.
  - `issue-storage.ts`: Handles Material Issues.
  - `return-storage.ts`: Handles Material Returns with stock reversal.
  - `inventory-service.ts`: Stock calculations.
  
- **Estimation-Specific Services**:
  - `src/lib/calculators/estimation-calculator.ts`: Pure utility class for all estimation calculations (Requirements, Process Costs, Total Cost).
  - `src/services/storage/tool-storage.ts`: CRUD for Tool Master data. ✅ **FIXED** (Now returns `DEFAULT_TOOLS` if localStorage is empty).
  - `src/services/storage/roll-storage.ts`: CRUD for Roll Master data. ✅ **FIXED** (Now returns `DEFAULT_ROLLS` if localStorage is empty).
  - `src/services/storage/process-storage.ts`: CRUD for Process Master data. ✅ **FIXED** (Now returns `DEFAULT_PROCESSES` if localStorage is empty).
  - `src/services/api/tool-service.ts`: API-like wrapper for tool operations.
  - `src/services/api/roll-service.ts`: API-like wrapper for roll operations.
  - `src/services/api/process-service.ts`: API-like wrapper for process operations.
  - `src/services/api/category-service.ts`: API-like wrapper for category operations.

## 8. Known Constraints / Decisions
- **No Real Backend**: App runs entirely in browser (LocalStorage). Data clears if cache cleared.
- **Performance**: High volume of logs may slow down LocalStorage; pagination unimplemented in storage layer (client-side only).
- **Scope**: Single-user focus currently (No RBAC).

## 9. Change Log
- **2026-01-03** – **📦 MATERIAL RETURN MODULE** – Implemented complete QR-based Material Return module with exact UI consistency. Features: QR scanning for Issue selection, partial return tracking, quality status, return reasons, automatic stock reversal via `grnStorage.restoreStock()`, FY-based ID generation (MR00001/25-26), full traceability to original Issue and GRN items. Created `material-return.ts`, `return-storage.ts`, `return-columns.tsx`, `return-dialog.tsx`, `return/page.tsx`. Added navigation link to sidebar.
- **2026-01-03** – **🔍 ESTIMATION LOGIC COMPREHENSIVE AUDIT** – Performed full ERP-grade audit of estimation calculation logic from production/finance perspective. Created detailed audit reports (`estimation_audit.md`, `complete_system_analysis.md`) identifying CRITICAL production risks.
- **2026-01-03** – **🐛 ESTIMATION CALCULATOR BUG FIXES** – Fixed missing `orderQty` multiplier in area-based rate calculations (`Rate/Sq.Inch/Color`, `Rate/Sq.Inch`, `Rate/Sq.CM`) in `src/lib/calculators/estimation-calculator.ts`. These bugs caused incorrect total cost calculations for area-based pricing.
- **2026-01-03** – **✅ EMPTY DIALOG FIX** – Resolved empty Tool, Roll, and Process selection dialogs by adding default mock data (`DEFAULT_TOOLS`, `DEFAULT_ROLLS`, `DEFAULT_PROCESSES`) to storage services (`tool-storage.ts`, `roll-storage.ts`, `process-storage.ts`). Dialogs now display data even with empty localStorage.
- **2026-01-03** – **🔧 CATEGORY AUTO-PROCESS SELECTION** – Implemented `useEffect` in `EstimationForm` to load master data (clients, categories, processes) on mount, enabling automatic population of `processCosts` when a category is selected.
- **2026-01-03** – **📊 DEBUG COUNTERS** – Added item count displays to dialog titles for Tool, Roll, and Process selection dialogs to aid in debugging data loading issues.
- **2026-01-03** – **⚠️ CRITICAL RISKS DOCUMENTED**:
  - **Missing Master Data Gaps (HIGH)**: Zero-value calculations proceed silently without warnings (e.g., `rollGSM = 0` → `Material Cost = 0`).
  - **Frontend-Only Logic (HIGH)**: All calculations are client-side only, creating data integrity and manipulation risks.
  - **Race Conditions (MEDIUM)**: Brittle `setTimeout(50)` debounce in `recalculateAll` can cause out-of-order calculations.
  - **No Audit Trail (MEDIUM)**: No versioning or change tracking for estimations.
- **2026-01-01** – **UI Standardization** – Refactored Production Entry & List pages to strictly match Master/Inventory Layouts (Gradient Headers, Full Height Cards).
- **2026-01-01** – **Production Unit** – Added Unit (Kg, Sq.Mtr) to Production Logs.
- **2026-01-01** – **Operators** – Added Dynamic Operator creation.

## 10. Pending Implementation (High Priority)
### Phase 1 - Immediate Safeguards (Estimation Module)
- [ ] **Add Validation Layer**: Inject zero-value checks for critical fields (Roll GSM, Width, Rate) in `EstimationCalculator.calculateRequirements()`.
- [ ] **UI Warning Feedback**: Display prominent red alert banners in `EstimationForm` when critical zero-value conditions are detected.
- [ ] **Backend Parity**: Refactor `EstimationCalculator` into shared library or duplicate logic server-side for validation.
- [ ] **Debounce Fix**: Replace `setTimeout(50)` with `useDebouncedCallback` from `use-debounce` library to prevent race conditions.

### Phase 2 - ERP Compliance (Estimation Module)
- [ ] **Audit Trail**: Implement versioning and change tracking for all estimations (who, what, when).
- [ ] **Approval Workflow**: Add multi-level approval process for estimations before conversion to Job Cards.
- [ ] **Price Locking**: Lock material/process rates at estimation time to prevent retroactive cost changes.
- [ ] **Margin Analysis**: Add profitability analysis and margin warnings for low-margin jobs.

### Phase 3 - System-Wide Enhancements
- [ ] **FIFO Logic**: Implement proper FIFO (First-In-First-Out) for material issue tracking.
- [ ] **Pagination**: Add server-side pagination for all list views to handle large datasets.
- [ ] **RBAC**: Implement Role-Based Access Control for multi-user scenarios.
- [ ] **Real Backend**: Migrate from localStorage to proper database (PostgreSQL/MySQL).
