# BACKEND IMPLEMENTATION GUIDE
## Milan Print Management System (PMS) - ASP.NET Web API Backend

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
3. [Database Schema](#database-schema)
4. [Backend Technology Stack](#backend-technology-stack)
5. [Project Structure](#project-structure)
6. [Core Implementation Patterns](#core-implementation-patterns)
7. [API Endpoints](#api-endpoints)
8. [Frontend Integration Strategy](#frontend-integration-strategy)
9. [Security & Authentication](#security--authentication)
10. [Performance Optimization](#performance-optimization)
11. [Migration Plan](#migration-plan)
12. [DO NOT DO - Critical Rules](#do-not-do---critical-rules)

---

## 1. ARCHITECTURE OVERVIEW

### System Type
- **SaaS ERP System** - Single deployment for ALL tenants
- **Row-Level Multi-Tenancy** - One database, one schema, TenantId in all business tables
- **Zero Per-Tenant Migration** - One schema change applies to all tenants
- **API-First Design** - Backend NOT driven by UI, domain-driven business logic

### Technology Decisions

| Component | Technology | Reason |
|-----------|-----------|--------|
| Backend Framework | ASP.NET Core 8.0 Web API | Performance, Enterprise-grade, Cross-platform |
| Data Access | ADO.NET (Direct SQL) | Full control, Performance, No ORM overhead |
| Database | MS SQL Server 2019+ | ACID compliance, Enterprise features, JSON support |
| Authentication | JWT Tokens | Stateless, Scalable, Industry standard |
| Multi-Tenancy | Row-Level (TenantId column) | Scalable, Cost-effective, Simple migrations |
| API Documentation | Swagger/OpenAPI | Auto-generated, Interactive testing |

---

## 2. MULTI-TENANCY STRATEGY

### ✅ CORRECT APPROACH: Row-Level Multi-Tenancy

**Implementation:**
- **Single Database**: `Milan_ERP`
- **Single Schema**: `dbo` (default schema)
- **TenantId Column**: Present in ALL business tables
- **Automatic Filtering**: BaseRepository pattern enforces TenantId in all queries
- **Tenant Resolution**: Middleware extracts tenant from JWT/Header/Subdomain

**Why This Approach?**
1. **Scalability**: 1000+ tenants in single database (proven by Salesforce, Zoho, NetSuite)
2. **Cost-Effective**: One server, one database license, one backup
3. **Zero Migration Overhead**: ALTER TABLE runs once for all tenants
4. **Performance**: Composite indexes (TenantId + Primary Key) ensure fast queries
5. **Simplicity**: Single codebase, single deployment, single connection string

### ❌ REJECTED APPROACHES

**Schema-Per-Tenant (NEVER USE)**
```sql
-- ❌ WRONG - DO NOT IMPLEMENT
CREATE SCHEMA Tenant_ABC;
CREATE SCHEMA Tenant_XYZ;
-- This creates migration hell!
```

**Why Rejected?**
- 100 tenants = 100 schema updates per migration
- Complex connection string management
- Unpredictable performance with many schemas
- Not suitable for SaaS ERP systems

**Database-Per-Tenant (NEVER USE)**
```csharp
// ❌ WRONG - DO NOT IMPLEMENT
var connectionString = $"Server=...;Database=Milan_Tenant_{tenantCode}";
// This creates infrastructure nightmare!
```

**Why Rejected?**
- 100 tenants = 100 databases = 100× maintenance cost
- Expensive licensing and infrastructure
- Impossible to manage at scale
- Cross-tenant reporting becomes nightmare

---

## 3. DATABASE SCHEMA

### Database Name
```sql
CREATE DATABASE Milan_ERP;
GO
USE Milan_ERP;
GO
```

### Master Tables (NO TenantId - Shared Across System)

#### Tenants Table
```sql
CREATE TABLE [dbo].[Tenants] (
    TenantId INT IDENTITY(1,1) PRIMARY KEY,
    TenantCode NVARCHAR(50) UNIQUE NOT NULL,
    CompanyName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200),
    Phone NVARCHAR(50),
    Address NVARCHAR(500),

    -- Subscription
    SubscriptionStatus NVARCHAR(20) NOT NULL DEFAULT 'Active', -- Active, Suspended, Expired
    SubscriptionPlan NVARCHAR(50),
    SubscriptionStartDate DATETIME,
    SubscriptionEndDate DATETIME,

    -- Metadata
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,

    INDEX IX_TenantCode (TenantCode),
    INDEX IX_SubscriptionStatus (SubscriptionStatus)
);
```

#### Users Table
```sql
CREATE TABLE [dbo].[Users] (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    Email NVARCHAR(200) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200),
    Role NVARCHAR(50), -- Admin, Manager, Operator, Viewer

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME,

    UNIQUE (TenantId, Email),
    INDEX IX_TenantId_Email (TenantId, Email),
    INDEX IX_Email (Email)
);
```

### Business Tables (ALL Have TenantId)

#### Clients Table
```sql
CREATE TABLE [dbo].[Clients] (
    ClientId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    ClientCode NVARCHAR(50) NOT NULL,
    ClientName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(200),
    Email NVARCHAR(200),
    Phone NVARCHAR(50),
    GST NVARCHAR(50),
    PAN NVARCHAR(50),

    BillingAddress NVARCHAR(500),
    ShippingAddress NVARCHAR(500),

    PaymentTerms NVARCHAR(200),
    CreditLimit DECIMAL(18,2),

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, ClientCode),
    INDEX IX_TenantId_ClientCode (TenantId, ClientCode),
    INDEX IX_TenantId_IsActive (TenantId, IsActive)
);
```

#### Suppliers Table
```sql
CREATE TABLE [dbo].[Suppliers] (
    SupplierId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    SupplierCode NVARCHAR(50) NOT NULL,
    SupplierName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(200),
    Email NVARCHAR(200),
    Phone NVARCHAR(50),
    GST NVARCHAR(50),
    PAN NVARCHAR(50),

    Address NVARCHAR(500),
    PaymentTerms NVARCHAR(200),

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, SupplierCode),
    INDEX IX_TenantId_SupplierCode (TenantId, SupplierCode),
    INDEX IX_TenantId_IsActive (TenantId, IsActive)
);
```

#### RollMaster Table
```sql
CREATE TABLE [dbo].[RollMaster] (
    RollId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,
    ItemType NVARCHAR(50) NOT NULL, -- Film, Paper

    -- Supplier
    SupplierId INT FOREIGN KEY REFERENCES [dbo].[Suppliers](SupplierId),
    SupplierItemCode NVARCHAR(50),
    Mill NVARCHAR(200),
    Quality NVARCHAR(100),

    -- Specifications
    RollWidthMM INT NOT NULL,
    ThicknessMicron DECIMAL(10,2),
    Density DECIMAL(10,4),

    -- GSM Details
    FaceGSM DECIMAL(10,2),
    ReleaseGSM DECIMAL(10,2),
    AdhesiveGSM DECIMAL(10,2),
    TotalGSM DECIMAL(10,2) NOT NULL,

    -- Business
    ShelfLifeDays INT,
    PurchaseUnit NVARCHAR(20),
    StockUnit NVARCHAR(20),
    PurchaseRate DECIMAL(18,2),
    HSNCode NVARCHAR(20),
    Location NVARCHAR(100),

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, ItemCode),
    INDEX IX_TenantId_ItemCode (TenantId, ItemCode),
    INDEX IX_TenantId_IsActive (TenantId, IsActive),
    INDEX IX_TenantId_Width_GSM (TenantId, RollWidthMM, TotalGSM)
);
```

#### PurchaseOrders Table
```sql
CREATE TABLE [dbo].[PurchaseOrders] (
    POId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    PONumber NVARCHAR(50) NOT NULL,
    PODate DATETIME NOT NULL,
    SupplierId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Suppliers](SupplierId),

    ExpectedDeliveryDate DATETIME,
    PaymentTerms NVARCHAR(200),

    Subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0,

    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected
    Remarks NVARCHAR(500),

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, PONumber),
    INDEX IX_TenantId_PONumber (TenantId, PONumber),
    INDEX IX_TenantId_Status (TenantId, Status),
    INDEX IX_TenantId_PODate (TenantId, PODate DESC)
);
```

#### POItems Table
```sql
CREATE TABLE [dbo].[POItems] (
    POItemId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    POId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PurchaseOrders](POId) ON DELETE CASCADE,
    RollId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[RollMaster](RollId),

    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,

    OrderedQty DECIMAL(18,2) NOT NULL,
    UOM NVARCHAR(20) NOT NULL,
    Rate DECIMAL(18,2) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    INDEX IX_TenantId_POId (TenantId, POId),
    INDEX IX_TenantId_RollId (TenantId, RollId)
);
```

#### GRN Table
```sql
CREATE TABLE [dbo].[GRN] (
    GRNId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    GRNNumber NVARCHAR(50) NOT NULL,
    GRNDate DATETIME NOT NULL,

    SupplierId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Suppliers](SupplierId),
    SupplierChallanNo NVARCHAR(50),
    ChallanDate DATETIME,
    VehicleNo NVARCHAR(50),

    QCReferenceNo NVARCHAR(50),
    ReceivedBy NVARCHAR(100),
    Remarks NVARCHAR(500),

    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Submitted

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, GRNNumber),
    INDEX IX_TenantId_GRNNumber (TenantId, GRNNumber),
    INDEX IX_TenantId_GRNDate (TenantId, GRNDate DESC)
);
```

#### GRNItems Table
```sql
CREATE TABLE [dbo].[GRNItems] (
    GRNItemId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    GRNId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[GRN](GRNId) ON DELETE CASCADE,
    POId INT FOREIGN KEY REFERENCES [dbo].[PurchaseOrders](POId),
    POItemId INT,

    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,

    -- PO Details
    OrderedQty DECIMAL(18,2) NOT NULL,
    UOM NVARCHAR(20) NOT NULL,

    -- Received Details
    ReceivedQty DECIMAL(18,2) NOT NULL,
    ReceivedRM DECIMAL(18,2),
    ReceivedSqMtr DECIMAL(18,2),
    ReceivedKg DECIMAL(18,2),

    -- Roll Specifics
    RollWidth INT,
    RollGSM DECIMAL(10,2),
    NoOfRolls INT,

    -- Batch
    BatchNo NVARCHAR(100) NOT NULL,
    SupplierBatchNo NVARCHAR(100),
    ExpiryDate DATETIME,

    -- QC
    RejectedQty DECIMAL(18,2),
    AcceptedQty DECIMAL(18,2),
    Remarks NVARCHAR(500),

    -- Stock Tracking
    RemainingQty DECIMAL(18,2),
    Status NVARCHAR(20) DEFAULT 'Available', -- Available, Issued, Consumed, Partially Issued

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    INDEX IX_TenantId_GRNId (TenantId, GRNId),
    INDEX IX_TenantId_BatchNo (TenantId, BatchNo),
    INDEX IX_TenantId_Status (TenantId, Status)
);
```

#### Stock Table
```sql
CREATE TABLE [dbo].[Stock] (
    StockId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    -- Linkages
    GRNId INT FOREIGN KEY REFERENCES [dbo].[GRN](GRNId),
    POId INT FOREIGN KEY REFERENCES [dbo].[PurchaseOrders](POId),

    -- Item Data
    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,
    Category NVARCHAR(50) NOT NULL, -- Roll, Material, Ink, Consumable

    -- Quantities
    Quantity DECIMAL(18,2) NOT NULL,
    UOM NVARCHAR(20) NOT NULL,

    -- Roll Specifics
    RunningMtr DECIMAL(18,2),
    SqMtr DECIMAL(18,2),
    WeightKg DECIMAL(18,2),
    WidthMM INT,
    GSM DECIMAL(10,2),

    -- Batch
    BatchNo NVARCHAR(100) NOT NULL,
    Location NVARCHAR(100),
    Status NVARCHAR(20) NOT NULL DEFAULT 'In-Stock', -- In-Stock, Reserved, Consumed, Expired

    ReceivedDate DATETIME NOT NULL,
    ExpiryDate DATETIME,

    -- QR Code
    QRCodeData NVARCHAR(MAX),

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    INDEX IX_TenantId_ItemCode (TenantId, ItemCode),
    INDEX IX_TenantId_BatchNo (TenantId, BatchNo),
    INDEX IX_TenantId_Status (TenantId, Status),
    INDEX IX_TenantId_Category (TenantId, Category)
);
```

#### SlittingJobs Table
```sql
CREATE TABLE [dbo].[SlittingJobs] (
    SlittingJobId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    SlittingJobNumber NVARCHAR(50) NOT NULL,
    SlittingDate DATETIME NOT NULL,

    -- Input Roll
    InputGRNItemId INT,
    InputStockId INT,
    InputItemCode NVARCHAR(50) NOT NULL,
    InputItemName NVARCHAR(200) NOT NULL,
    InputBatchNo NVARCHAR(100) NOT NULL,
    InputWidth INT NOT NULL,
    InputGSM DECIMAL(10,2) NOT NULL,
    InputRM DECIMAL(18,2) NOT NULL,
    InputSqMtr DECIMAL(18,2) NOT NULL,
    InputKg DECIMAL(18,2) NOT NULL,

    -- Wastage
    WastageKg DECIMAL(18,2) NOT NULL DEFAULT 0,
    WastageRM DECIMAL(18,2),
    WastageSqMtr DECIMAL(18,2),
    WastageRemarks NVARCHAR(500),

    -- Metadata
    OperatorName NVARCHAR(100),
    MachineNo NVARCHAR(50),
    Remarks NVARCHAR(500),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Completed', -- Completed, Draft

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, SlittingJobNumber),
    INDEX IX_TenantId_JobNumber (TenantId, SlittingJobNumber),
    INDEX IX_TenantId_Date (TenantId, SlittingDate DESC)
);
```

#### SlittingOutputRolls Table
```sql
CREATE TABLE [dbo].[SlittingOutputRolls] (
    OutputRollId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    SlittingJobId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[SlittingJobs](SlittingJobId) ON DELETE CASCADE,
    RollMasterId INT FOREIGN KEY REFERENCES [dbo].[RollMaster](RollId),

    OutputWidth INT NOT NULL,
    OutputGSM DECIMAL(10,2) NOT NULL,
    OutputRM DECIMAL(18,2) NOT NULL,
    OutputSqMtr DECIMAL(18,2) NOT NULL,
    OutputKg DECIMAL(18,2) NOT NULL,

    BatchNo NVARCHAR(100) NOT NULL,
    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,

    QRCodeData NVARCHAR(MAX),
    Remarks NVARCHAR(500),

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    INDEX IX_TenantId_JobId (TenantId, SlittingJobId),
    INDEX IX_TenantId_BatchNo (TenantId, BatchNo)
);
```

#### Estimations Table
```sql
CREATE TABLE [dbo].[Estimations] (
    EstimationId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

    EstimationNumber NVARCHAR(50) NOT NULL,
    EstimationDate DATETIME NOT NULL,

    ClientId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Clients](ClientId),
    CategoryId INT,

    -- Job Specifications
    JobName NVARCHAR(200) NOT NULL,
    JobWidthMM INT NOT NULL,
    JobLengthMM INT NOT NULL,
    OrderQty INT NOT NULL,
    Colors INT,

    -- Material
    RollId INT FOREIGN KEY REFERENCES [dbo].[RollMaster](RollId),
    MaterialCost DECIMAL(18,2),

    -- Costs
    ProcessCostTotal DECIMAL(18,2),
    AdditionalCostPercent DECIMAL(10,2),
    AdditionalCostAmount DECIMAL(18,2),
    TotalJobCost DECIMAL(18,2),
    UnitCost DECIMAL(18,4),
    FinalPrice DECIMAL(18,4),
    TotalOrderValue DECIMAL(18,2),

    -- Metadata
    Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected, Converted
    Remarks NVARCHAR(500),

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    UNIQUE (TenantId, EstimationNumber),
    INDEX IX_TenantId_Number (TenantId, EstimationNumber),
    INDEX IX_TenantId_Status (TenantId, Status),
    INDEX IX_TenantId_Date (TenantId, EstimationDate DESC)
);
```

---

## 4. BACKEND TECHNOLOGY STACK

### Project Setup

**ASP.NET Core 8.0 Web API**
```bash
dotnet new webapi -n Milan.API
cd Milan.API

# Add required packages
dotnet add package Microsoft.Data.SqlClient
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
```

### Project Structure
```
Milan.API/
├── Controllers/
│   ├── ClientsController.cs
│   ├── SuppliersController.cs
│   ├── RollMasterController.cs
│   ├── PurchaseOrdersController.cs
│   ├── GRNController.cs
│   ├── SlittingController.cs
│   ├── EstimationsController.cs
│   └── AuthController.cs
├── Models/
│   ├── Domain/
│   │   ├── Client.cs
│   │   ├── Supplier.cs
│   │   ├── RollMaster.cs
│   │   ├── PurchaseOrder.cs
│   │   ├── GRN.cs
│   │   ├── SlittingJob.cs
│   │   └── Estimation.cs
│   └── DTOs/
│       ├── ClientDto.cs
│       ├── CreateClientDto.cs
│       └── ...
├── Repositories/
│   ├── Base/
│   │   ├── IRepository.cs
│   │   └── BaseRepository.cs
│   ├── IClientRepository.cs
│   ├── ClientRepository.cs
│   └── ...
├── Services/
│   ├── IClientService.cs
│   ├── ClientService.cs
│   └── ...
├── Middleware/
│   ├── TenantResolutionMiddleware.cs
│   └── ErrorHandlingMiddleware.cs
├── Infrastructure/
│   ├── Database/
│   │   └── DbConnectionFactory.cs
│   └── Security/
│       ├── JwtTokenService.cs
│       └── PasswordHasher.cs
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

---

## 5. CORE IMPLEMENTATION PATTERNS

### BaseRepository Pattern

**Purpose**: Automatically inject TenantId filter in ALL queries to prevent data leakage.

**IRepository.cs**
```csharp
public interface IRepository<T> where T : class
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<int> CreateAsync(T entity);
    Task<bool> UpdateAsync(T entity);
    Task<bool> DeleteAsync(int id);
}
```

**BaseRepository.cs**
```csharp
using Microsoft.Data.SqlClient;
using System.Data;

public abstract class BaseRepository<T> : IRepository<T> where T : class
{
    protected readonly IDbConnectionFactory _connectionFactory;
    protected readonly IHttpContextAccessor _httpContextAccessor;
    protected readonly string _tableName;

    protected BaseRepository(
        IDbConnectionFactory connectionFactory,
        IHttpContextAccessor httpContextAccessor,
        string tableName)
    {
        _connectionFactory = connectionFactory;
        _httpContextAccessor = httpContextAccessor;
        _tableName = tableName;
    }

    // CRITICAL: Auto-extract TenantId from HttpContext
    protected int GetTenantId()
    {
        var tenantId = _httpContextAccessor.HttpContext?.Items["TenantId"];

        if (tenantId == null)
        {
            throw new UnauthorizedAccessException("TenantId not found in request context");
        }

        return (int)tenantId;
    }

    // CRITICAL: Automatically inject TenantId in WHERE clause
    protected async Task<List<T>> ExecuteQueryAsync(
        string selectClause,
        Func<SqlDataReader, T> mapFunction,
        string? additionalWhere = null,
        SqlParameter[]? parameters = null)
    {
        var tenantId = GetTenantId();
        var whereClause = $"WHERE TenantId = @TenantId";

        if (!string.IsNullOrEmpty(additionalWhere))
        {
            whereClause += $" AND ({additionalWhere})";
        }

        var query = $"{selectClause} FROM {_tableName} {whereClause}";

        var parameterList = new List<SqlParameter>
        {
            new SqlParameter("@TenantId", tenantId)
        };

        if (parameters != null)
        {
            parameterList.AddRange(parameters);
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddRange(parameterList.ToArray());

        var results = new List<T>();
        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            results.Add(mapFunction(reader));
        }

        return results;
    }

    // CRITICAL: Automatically inject TenantId in INSERT
    protected async Task<int> ExecuteInsertAsync(
        string columns,
        string values,
        SqlParameter[] parameters)
    {
        var tenantId = GetTenantId();

        var query = $@"
            INSERT INTO {_tableName} (TenantId, {columns})
            OUTPUT INSERTED.{GetPrimaryKeyColumn()}
            VALUES (@TenantId, {values})";

        var parameterList = new List<SqlParameter>
        {
            new SqlParameter("@TenantId", tenantId)
        };
        parameterList.AddRange(parameters);

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddRange(parameterList.ToArray());

        return (int)await command.ExecuteScalarAsync();
    }

    // CRITICAL: Automatically inject TenantId in UPDATE
    protected async Task<bool> ExecuteUpdateAsync(
        int id,
        string setClause,
        SqlParameter[] parameters)
    {
        var tenantId = GetTenantId();

        var query = $@"
            UPDATE {_tableName}
            SET {setClause}, UpdatedAt = GETDATE()
            WHERE {GetPrimaryKeyColumn()} = @Id AND TenantId = @TenantId";

        var parameterList = new List<SqlParameter>
        {
            new SqlParameter("@Id", id),
            new SqlParameter("@TenantId", tenantId)
        };
        parameterList.AddRange(parameters);

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddRange(parameterList.ToArray());

        var rowsAffected = await command.ExecuteNonQueryAsync();
        return rowsAffected > 0;
    }

    // CRITICAL: Automatically inject TenantId in DELETE
    protected async Task<bool> ExecuteDeleteAsync(int id)
    {
        var tenantId = GetTenantId();

        var query = $@"
            DELETE FROM {_tableName}
            WHERE {GetPrimaryKeyColumn()} = @Id AND TenantId = @TenantId";

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@TenantId", tenantId);

        var rowsAffected = await command.ExecuteNonQueryAsync();
        return rowsAffected > 0;
    }

    protected abstract string GetPrimaryKeyColumn();
}
```

### TenantResolutionMiddleware

**Purpose**: Extract tenant information from request and store in HttpContext for BaseRepository.

```csharp
using Microsoft.Data.SqlClient;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    public TenantResolutionMiddleware(
        RequestDelegate next,
        IConfiguration configuration,
        ILogger<TenantResolutionMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip tenant resolution for auth endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth"))
        {
            await _next(context);
            return;
        }

        // 1. Try to extract TenantCode from JWT claims
        var tenantCode = context.User.FindFirst("TenantCode")?.Value;

        // 2. Fallback: Try custom header
        if (string.IsNullOrEmpty(tenantCode))
        {
            tenantCode = context.Request.Headers["X-Tenant-Code"].FirstOrDefault();
        }

        // 3. Fallback: Try subdomain
        if (string.IsNullOrEmpty(tenantCode))
        {
            var host = context.Request.Host.Host;
            if (host.Contains('.'))
            {
                tenantCode = host.Split('.')[0];
            }
        }

        if (string.IsNullOrEmpty(tenantCode))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant code is required" });
            return;
        }

        // Resolve TenantId from TenantCode
        var tenantId = await GetTenantIdAsync(tenantCode);

        if (tenantId == null)
        {
            _logger.LogWarning("Invalid tenant code: {TenantCode}", tenantCode);
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid or inactive tenant" });
            return;
        }

        // Store TenantId in HttpContext for BaseRepository
        context.Items["TenantId"] = tenantId.Value;
        context.Items["TenantCode"] = tenantCode;

        await _next(context);
    }

    private async Task<int?> GetTenantIdAsync(string tenantCode)
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var query = @"
            SELECT TenantId
            FROM [dbo].[Tenants]
            WHERE TenantCode = @TenantCode
                AND SubscriptionStatus = 'Active'
                AND IsActive = 1";

        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@TenantCode", tenantCode);

        var result = await command.ExecuteScalarAsync();
        return result != null ? (int)result : null;
    }
}
```

---

## 6. API ENDPOINTS

### Clients API Example

**ClientsController.cs**
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires JWT token
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    // GET: api/clients
    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetAll()
    {
        var clients = await _clientService.GetAllAsync();
        return Ok(clients);
    }

    // GET: api/clients/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetById(int id)
    {
        var client = await _clientService.GetByIdAsync(id);

        if (client == null)
        {
            return NotFound(new { message = "Client not found" });
        }

        return Ok(client);
    }

    // POST: api/clients
    [HttpPost]
    public async Task<ActionResult<ClientDto>> Create(CreateClientDto dto)
    {
        var client = await _clientService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = client.ClientId }, client);
    }

    // PUT: api/clients/5
    [HttpPut("{id}")]
    public async Task<ActionResult<ClientDto>> Update(int id, UpdateClientDto dto)
    {
        var client = await _clientService.UpdateAsync(id, dto);

        if (client == null)
        {
            return NotFound(new { message = "Client not found" });
        }

        return Ok(client);
    }

    // DELETE: api/clients/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await _clientService.DeleteAsync(id);

        if (!success)
        {
            return NotFound(new { message = "Client not found" });
        }

        return NoContent();
    }
}
```

### Authentication API

**AuthController.cs**
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        return Ok(response);
    }

    // POST: api/auth/register (Only for initial setup)
    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponseDto>> Register(RegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        return Ok(response);
    }

    // POST: api/auth/refresh
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResponseDto>> RefreshToken(RefreshTokenDto dto)
    {
        var response = await _authService.RefreshTokenAsync(dto);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        return Ok(response);
    }
}
```

---

## 7. FRONTEND INTEGRATION STRATEGY

### Adapter Pattern (Zero Breaking Changes)

**Goal**: Migrate from localStorage to API without breaking existing frontend code.

**Implementation Strategy**:

1. **Feature Flag**: Control localStorage vs API usage
2. **Adapter Layer**: Wrap API calls to match existing storage interface
3. **Gradual Migration**: Module-by-module rollout
4. **Backward Compatibility**: Existing code works unchanged

**Example: Client Storage Adapter**

**Before (localStorage only)**:
```typescript
// src/services/storage/client-storage.ts
export const clientStorage = {
    getAll: (): Client[] => {
        const data = localStorage.getItem('MILAN_CLIENTS');
        return data ? JSON.parse(data) : [];
    },

    save: (client: Client): Client => {
        const clients = clientStorage.getAll();
        clients.push(client);
        localStorage.setItem('MILAN_CLIENTS', JSON.stringify(clients));
        return client;
    }
};
```

**After (localStorage + API with adapter)**:
```typescript
// src/services/storage/client-storage.ts
import { apiClient } from '../api/api-client';

const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

export const clientStorage = {
    getAll: async (): Promise<Client[]> => {
        if (USE_BACKEND) {
            // Call API
            return await apiClient.get<Client[]>('clients');
        } else {
            // Use localStorage (existing code unchanged)
            const data = localStorage.getItem('MILAN_CLIENTS');
            return data ? JSON.parse(data) : [];
        }
    },

    save: async (client: Omit<Client, 'id'>): Promise<Client> => {
        if (USE_BACKEND) {
            // Call API
            return await apiClient.post<Client>('clients', client);
        } else {
            // Use localStorage (existing code unchanged)
            const clients = await clientStorage.getAll();
            const newClient = { ...client, id: generateId() };
            clients.push(newClient);
            localStorage.setItem('MILAN_CLIENTS', JSON.stringify(clients));
            return newClient;
        }
    }
};
```

**API Client**:
```typescript
// src/services/api/api-client.ts
class ApiClient {
    private baseUrl: string;
    private tenantCode: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.milan.com';
        this.tenantCode = localStorage.getItem('tenantCode') || 'demo';
    }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('authToken');

        return {
            'Content-Type': 'application/json',
            'X-Tenant-Code': this.tenantCode,
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
    }
}

export const apiClient = new ApiClient();
```

**Environment Variables**:
```bash
# .env.local
NEXT_PUBLIC_USE_BACKEND=false  # Set to 'true' to enable API mode
NEXT_PUBLIC_API_URL=https://api.milan.com
```

---

## 8. SECURITY & AUTHENTICATION

### JWT Token Structure

```json
{
  "sub": "user@example.com",
  "userId": 123,
  "TenantCode": "ABC123",
  "TenantId": 1,
  "role": "Admin",
  "exp": 1735689600,
  "iat": 1735603200
}
```

### Password Hashing
```csharp
// Use BCrypt (NOT SHA/MD5)
string hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);
bool isValid = BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
```

### Security Rules
1. **NEVER** store passwords in plain text
2. **ALWAYS** use HTTPS in production
3. **ALWAYS** validate TenantId in every request
4. **NEVER** trust client-provided TenantId
5. **ALWAYS** use parameterized queries (prevent SQL injection)

---

## 9. PERFORMANCE OPTIMIZATION

### Indexing Strategy

**Golden Rule**: `TenantId` must be the FIRST column in ALL indexes on business tables.

```sql
-- ✅ CORRECT
CREATE INDEX IX_TenantId_ClientCode ON Clients (TenantId, ClientCode);
CREATE INDEX IX_TenantId_IsActive ON Clients (TenantId, IsActive);

-- ❌ WRONG
CREATE INDEX IX_ClientCode_TenantId ON Clients (ClientCode, TenantId);
-- This will cause full table scan for tenant filtering!
```

### Connection Pooling
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Milan_ERP;User Id=milan_user;Password=***;Min Pool Size=10;Max Pool Size=100;Pooling=true;"
  }
}
```

### Caching Strategy
- **Master Data**: Cache for 1 hour (Clients, Suppliers, Roll Master)
- **Transactional Data**: No caching (PO, GRN, Stock)
- **Tenant Data**: Cache for session duration

---

## 10. MIGRATION PLAN

### Phase 1: Backend Setup (Week 1-2)
- [ ] Create ASP.NET Core Web API project
- [ ] Setup MS SQL Server database
- [ ] Create all tables with TenantId columns
- [ ] Implement BaseRepository pattern
- [ ] Implement TenantResolutionMiddleware
- [ ] Setup JWT authentication

### Phase 2: Core APIs (Week 3-4)
- [ ] Implement Clients API
- [ ] Implement Suppliers API
- [ ] Implement Roll Master API
- [ ] Implement Process Master API
- [ ] Test APIs with Postman/Swagger

### Phase 3: Inventory APIs (Week 5-6)
- [ ] Implement Purchase Order API
- [ ] Implement GRN API
- [ ] Implement Material Issue API
- [ ] Implement Material Return API
- [ ] Implement Stock API

### Phase 4: Production APIs (Week 7-8)
- [ ] Implement Slitting API
- [ ] Implement Estimation API
- [ ] Implement Production Entry API
- [ ] Implement Dispatch API

### Phase 5: Frontend Integration (Week 9-10)
- [ ] Create API client utility
- [ ] Implement adapter pattern in storage services
- [ ] Add feature flag for backend toggle
- [ ] Module-by-module testing
- [ ] Full integration testing

### Phase 6: Deployment (Week 11-12)
- [ ] Setup Azure/AWS infrastructure
- [ ] Deploy backend API
- [ ] Configure domain and SSL
- [ ] Setup monitoring and logging
- [ ] Production rollout

---

## 11. DO NOT DO - CRITICAL RULES

### ❌ NEVER Use Schema-Per-Tenant
```sql
-- ❌ WRONG - This is a maintenance nightmare!
CREATE SCHEMA Tenant_ABC;
CREATE SCHEMA Tenant_XYZ;
CREATE TABLE Tenant_ABC.Clients (...);
CREATE TABLE Tenant_XYZ.Clients (...);
```

**Why?**
- 100 tenants = 100 schema migrations per change
- Complex backup/restore procedures
- Unpredictable performance at scale

### ❌ NEVER Use Database-Per-Tenant
```csharp
// ❌ WRONG - Infrastructure nightmare!
var dbName = $"Milan_Tenant_{tenantCode}";
var connectionString = $"Server=...;Database={dbName}";
```

**Why?**
- Expensive licensing and infrastructure costs
- Impossible to manage at scale
- Cross-tenant reporting becomes nightmare

### ❌ NEVER Skip TenantId Validation
```csharp
// ❌ WRONG - Security vulnerability!
var query = "SELECT * FROM Clients WHERE ClientId = @ClientId";
// Missing: AND TenantId = @TenantId
```

**Why?**
- Data leakage between tenants
- Tenant A can access Tenant B's data

### ❌ NEVER Trust Client-Provided TenantId
```csharp
// ❌ WRONG - Security vulnerability!
var tenantId = Request.Headers["X-Tenant-Id"];
// Attacker can send any TenantId!
```

**Why?**
- Attacker can impersonate any tenant
- Always resolve TenantId from JWT/authenticated source

### ❌ NEVER Use String Concatenation for SQL
```csharp
// ❌ WRONG - SQL Injection vulnerability!
var query = $"SELECT * FROM Clients WHERE ClientCode = '{clientCode}'";
```

**Why?**
- SQL Injection attacks
- Always use parameterized queries

### ✅ DO Use Parameterized Queries
```csharp
// ✅ CORRECT
var query = "SELECT * FROM Clients WHERE ClientCode = @ClientCode AND TenantId = @TenantId";
command.Parameters.AddWithValue("@ClientCode", clientCode);
command.Parameters.AddWithValue("@TenantId", tenantId);
```

### ❌ NEVER Store Passwords in Plain Text
```csharp
// ❌ WRONG
var password = "admin123";
INSERT INTO Users (Password) VALUES ('admin123');
```

### ✅ DO Use BCrypt for Password Hashing
```csharp
// ✅ CORRECT
var hashedPassword = BCrypt.Net.BCrypt.HashPassword("admin123");
INSERT INTO Users (PasswordHash) VALUES (@HashedPassword);
```

---

## 12. FINAL GUIDING PRINCIPLES

### Architecture Philosophy
1. **Single Source of Truth**: One database, one schema, one codebase
2. **Row-Level Isolation**: TenantId in every business table
3. **Zero Trust**: Always validate tenant access
4. **API-First**: Business logic in backend, not frontend
5. **Backward Compatible**: Frontend works without breaking changes

### Scalability
- Designed for 1000+ tenants in single database
- Proven pattern used by Salesforce, Zoho, NetSuite
- Horizontal scaling via load balancers
- Read replicas for reporting queries

### Maintainability
- One migration script applies to all tenants
- One deployment serves all tenants
- Centralized monitoring and logging
- Easy backup and disaster recovery

### Security
- Multi-layered security (JWT + TenantId + Row-Level)
- Automatic tenant isolation via middleware
- No manual tenant checks in business logic
- Audit trail for all operations

---

## CONCLUSION

This backend implementation guide provides the **complete blueprint** for building a scalable, secure, multi-tenant SaaS ERP backend for Milan Print Management System.

**Key Takeaways:**
1. ✅ Use **Row-Level Multi-Tenancy** with TenantId column
2. ❌ **NEVER** use Schema-Per-Tenant or Database-Per-Tenant
3. ✅ Implement **BaseRepository** pattern for automatic TenantId filtering
4. ✅ Use **TenantResolutionMiddleware** for tenant identification
5. ✅ Follow **Adapter Pattern** for zero-breaking-change frontend integration
6. ✅ Use **Composite Indexes** (TenantId as first column)
7. ✅ Implement **JWT Authentication** with tenant claims
8. ✅ Always use **Parameterized Queries** (prevent SQL injection)

**This document must be followed strictly for all backend development.**

---

*Document Version: 1.0*
*Last Updated: January 7, 2026*
*Status: Complete Implementation Guide*
*Approved for Production Use: ✅*
