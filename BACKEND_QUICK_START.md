# BACKEND QUICK START GUIDE
## Milan Print Management System - Fast Track to Backend Implementation

This guide provides a **quick reference** to get started with the Milan PMS backend implementation.

---

## 📁 DOCUMENTATION FILES

All backend documentation is located in the project root:

| File | Purpose | When to Use |
|------|---------|-------------|
| **[BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md)** | Complete architecture & patterns | Read this FIRST for full understanding |
| **[BACKEND_CODE_EXAMPLES.md](BACKEND_CODE_EXAMPLES.md)** | Production-ready code templates | Use as copy-paste reference for implementation |
| **[BACKEND_INVENTORY_LEDGER.md](BACKEND_INVENTORY_LEDGER.md)** ⭐ **CRITICAL** | Inventory transaction system | REQUIRED for all stock operations |
| **[API_REFERENCE.md](API_REFERENCE.md)** | REST API endpoint documentation | Reference when building frontend integration |
| **[BACKEND_QUICK_START.md](BACKEND_QUICK_START.md)** | This file - Quick reference | Use for fast lookups and reminders |

---

## 🚀 QUICK START IN 5 STEPS

### Step 1: Create ASP.NET Project

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

### Step 2: Create Database

```sql
CREATE DATABASE Milan_ERP;
GO

USE Milan_ERP;
GO

-- Create Tenants table (see BACKEND_IMPLEMENTATION_GUIDE.md for complete schema)
CREATE TABLE [dbo].[Tenants] (
    TenantId INT IDENTITY(1,1) PRIMARY KEY,
    TenantCode NVARCHAR(50) UNIQUE NOT NULL,
    CompanyName NVARCHAR(200) NOT NULL,
    SubscriptionStatus NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

-- Create Users table
CREATE TABLE [dbo].[Users] (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),
    Email NVARCHAR(200) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200),
    Role NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UNIQUE (TenantId, Email)
);

-- Create Clients table (CRITICAL: Has TenantId column)
CREATE TABLE [dbo].[Clients] (
    ClientId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),
    ClientCode NVARCHAR(50) NOT NULL,
    ClientName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200),
    Phone NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UNIQUE (TenantId, ClientCode),
    INDEX IX_TenantId_ClientCode (TenantId, ClientCode)
);

-- Repeat for all other tables (see complete schema in BACKEND_IMPLEMENTATION_GUIDE.md)
```

### Step 3: Configure appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Milan_ERP;User Id=milan_user;Password=YourPassword;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "Secret": "YourVerySecureSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "Milan.API",
    "Audience": "Milan.Client",
    "ExpiryMinutes": "1440"
  },
  "AllowedOrigins": ["http://localhost:3000"]
}
```

### Step 4: Copy Core Infrastructure Files

Copy these files from `BACKEND_CODE_EXAMPLES.md`:

1. **Infrastructure/Database/DbConnectionFactory.cs**
2. **Infrastructure/Security/JwtTokenService.cs**
3. **Middleware/TenantResolutionMiddleware.cs**
4. **Middleware/ErrorHandlingMiddleware.cs**
5. **Repositories/Base/BaseRepository.cs**
6. **Program.cs** (with all middleware and DI configuration)

### Step 5: Implement Your First Module

Use the **Client module** as a template (complete code in `BACKEND_CODE_EXAMPLES.md`):

1. Create `Models/Domain/Client.cs`
2. Create `Models/DTOs/ClientDto.cs`
3. Create `Repositories/IClientRepository.cs`
4. Create `Repositories/ClientRepository.cs` (extends BaseRepository)
5. Create `Services/IClientService.cs`
6. Create `Services/ClientService.cs`
7. Create `Controllers/ClientsController.cs`
8. Register in `Program.cs`

**Run and Test**:
```bash
dotnet run

# Open Swagger UI
# Navigate to: https://localhost:5001/swagger
```

---

## 🔑 CRITICAL RULES (NEVER FORGET)

### ✅ DO THIS

1. **ALWAYS add TenantId column** to ALL business tables
2. **ALWAYS use BaseRepository** (automatic TenantId filtering)
3. **ALWAYS use parameterized queries** (prevent SQL injection)
4. **ALWAYS hash passwords** with BCrypt (never plain text)
5. **ALWAYS include TenantId** as first column in composite indexes
6. **ALWAYS validate TenantId** from JWT (never trust client)

### ❌ NEVER DO THIS

1. **NEVER use schema-per-tenant** (creates migration hell)
2. **NEVER use database-per-tenant** (infrastructure nightmare)
3. **NEVER skip TenantId validation** (data leakage!)
4. **NEVER trust client-provided TenantId** (security vulnerability!)
5. **NEVER use string concatenation** for SQL (SQL injection!)
6. **NEVER store passwords** in plain text

---

## 🎯 MULTI-TENANCY PATTERN

### Database Structure

```
Milan_ERP (Single Database)
└── dbo (Single Schema)
    ├── Tenants (Master - NO TenantId)
    ├── Users (Has TenantId)
    ├── Clients (Has TenantId)
    ├── Suppliers (Has TenantId)
    ├── RollMaster (Has TenantId)
    ├── PurchaseOrders (Has TenantId)
    ├── GRN (Has TenantId)
    ├── SlittingJobs (Has TenantId)
    └── ... (ALL business tables have TenantId)
```

### Automatic TenantId Filtering

**How It Works**:
```
1. Request arrives with JWT token
2. TenantResolutionMiddleware extracts TenantCode from JWT
3. Middleware resolves TenantId from Tenants table
4. TenantId stored in HttpContext.Items["TenantId"]
5. BaseRepository automatically injects TenantId in ALL queries
6. Result: Complete tenant isolation without manual checks
```

**Example Query Transformation**:
```csharp
// Developer writes:
var clients = await _repository.GetAllAsync();

// BaseRepository executes:
SELECT * FROM Clients WHERE TenantId = @TenantId
```

---

## 📊 REQUEST FLOW

```
Client (Next.js)
    ↓
[JWT Token with TenantCode]
    ↓
API Gateway (ASP.NET Core)
    ↓
[ErrorHandlingMiddleware] → Catches all exceptions
    ↓
[TenantResolutionMiddleware] → Resolves TenantId
    ↓
[JWT Authentication] → Validates token
    ↓
Controller → Receives request
    ↓
Service Layer → Business logic
    ↓
Repository (BaseRepository) → Auto-injects TenantId
    ↓
Database (MS SQL Server)
    ↓
[Returns ONLY tenant-specific data]
    ↓
Response → JSON with data
```

---

## 🔐 AUTHENTICATION FLOW

### Registration
```
POST /api/auth/register
{
  "companyName": "ABC Printing",
  "tenantCode": "ABC123",
  "email": "admin@abc.com",
  "password": "SecurePass123!",
  "fullName": "Admin User"
}

Response:
{
  "tenantId": 1,
  "userId": 1,
  "message": "Registration successful"
}
```

### Login
```
POST /api/auth/login
{
  "email": "admin@abc.com",
  "password": "SecurePass123!",
  "tenantCode": "ABC123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Using Token
```
GET /api/clients
Headers:
  Authorization: Bearer eyJhbGc...
  X-Tenant-Code: ABC123
```

---

## 🛠 DEVELOPMENT WORKFLOW

### 1. Create New Module

For each new module (e.g., Suppliers, RollMaster, PurchaseOrders):

```
1. Define Domain Model (Models/Domain/)
2. Create DTOs (Models/DTOs/)
3. Create Database Table (with TenantId!)
4. Create Repository Interface (Repositories/)
5. Create Repository Implementation (extends BaseRepository)
6. Create Service Interface (Services/)
7. Create Service Implementation
8. Create Controller (Controllers/)
9. Register in Program.cs DI
10. Test in Swagger
```

### 2. Testing Checklist

✅ Create record via API
✅ Retrieve records (should only see own tenant data)
✅ Try to access another tenant's data (should fail)
✅ Update record
✅ Delete record
✅ Test with expired JWT (should fail)
✅ Test without JWT (should fail)

---

## 📦 FRONTEND INTEGRATION

### Enable Backend Mode

**.env.local**:
```bash
NEXT_PUBLIC_USE_BACKEND=true
NEXT_PUBLIC_API_URL=https://api.milan.com
```

### Adapter Pattern Example

```typescript
// src/services/storage/client-storage.ts
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

export const clientStorage = {
    getAll: async (): Promise<Client[]> => {
        if (USE_BACKEND) {
            // Call backend API
            return await apiClient.get<Client[]>('clients');
        } else {
            // Use existing localStorage code
            const data = localStorage.getItem('MILAN_CLIENTS');
            return data ? JSON.parse(data) : [];
        }
    }
};
```

### Zero Breaking Changes

- Existing frontend code works unchanged
- Toggle backend on/off with environment variable
- Gradual module-by-module migration
- localStorage fallback for offline development

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "TenantId not found"
**Cause**: TenantResolutionMiddleware not resolving tenant
**Solution**: Check JWT token contains TenantCode claim

### Issue: "No data returned"
**Cause**: TenantId filtering too strict or wrong tenant
**Solution**: Verify TenantId matches between request and database

### Issue: "SQL Injection warning"
**Cause**: String concatenation in queries
**Solution**: Always use SqlParameter for all user inputs

### Issue: "Unauthorized access"
**Cause**: JWT token expired or invalid
**Solution**: Implement token refresh logic in frontend

### Issue: "Cross-tenant data leak"
**Cause**: Forgot TenantId in WHERE clause
**Solution**: Always use BaseRepository (automatic filtering)

---

## 📚 REFERENCE LINKS

- **Complete Architecture**: [BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md)
- **Code Templates**: [BACKEND_CODE_EXAMPLES.md](BACKEND_CODE_EXAMPLES.md)
- **API Endpoints**: [API_REFERENCE.md](API_REFERENCE.md)
- **Frontend Memory**: [PROJECT_MEMORY.md](PROJECT_MEMORY.md)

---

## 💡 QUICK TIPS

1. **Start with Authentication** - Get login/register working first
2. **Test with Multiple Tenants** - Create 2-3 test tenants to verify isolation
3. **Use Swagger** - Interactive API testing is faster than Postman
4. **Log Everything** - Serilog helps debug tenant resolution issues
5. **Copy-Paste Template** - Use Client module as template for all other modules
6. **One Migration** - Remember: ONE schema change applies to ALL tenants
7. **Performance** - TenantId MUST be first column in all composite indexes
8. **Security** - Never trust client, always validate TenantId server-side

---

## 🚦 DEPLOYMENT CHECKLIST

Before going to production:

- [ ] All tables have TenantId column (except Tenants, Users)
- [ ] All indexes include TenantId as first column
- [ ] BaseRepository pattern used everywhere (no raw queries)
- [ ] JWT secret is strong (32+ characters)
- [ ] HTTPS enabled (redirect HTTP to HTTPS)
- [ ] Connection string uses encrypted password
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Logging configured (Serilog with file rotation)
- [ ] Health check endpoint implemented
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## 🎓 LEARNING PATH

**Day 1-2**: Read BACKEND_IMPLEMENTATION_GUIDE.md
**Day 3-4**: Setup database and run sample queries
**Day 5-7**: Implement Client module using code examples
**Day 8-10**: Implement 2-3 more modules (Suppliers, RollMaster)
**Week 2**: Complete all inventory modules (PO, GRN, Issue, Return)
**Week 3**: Implement Slitting and Stock modules
**Week 4**: Frontend integration and testing
**Week 5**: Deployment and production setup

---

## 🆘 SUPPORT

**Stuck?** Check these resources in order:

1. **BACKEND_CODE_EXAMPLES.md** - See working code
2. **API_REFERENCE.md** - Check API format
3. **BACKEND_IMPLEMENTATION_GUIDE.md** - Review architecture
4. **PROJECT_MEMORY.md** - Understand frontend context

---

*Quick Start Guide Version: 1.0*
*Last Updated: January 7, 2026*
*Ready for Implementation*
