-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Milan_ERP')
BEGIN
    CREATE DATABASE Milan_ERP;
END
GO

USE Milan_ERP;
GO

-- Create Tenants Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tenants')
BEGIN
    CREATE TABLE [dbo].[Tenants] (
        TenantId INT IDENTITY(1,1) PRIMARY KEY,
        TenantCode NVARCHAR(50) UNIQUE NOT NULL,
        CompanyName NVARCHAR(200) NOT NULL,
        Email NVARCHAR(200),
        Phone NVARCHAR(50),
        Address NVARCHAR(500),
        SubscriptionStatus NVARCHAR(20) NOT NULL DEFAULT 'Active',
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1,
        INDEX IX_TenantCode (TenantCode)
    );
    
    -- Insert Default Tenant
    INSERT INTO Tenants (TenantCode, CompanyName, Email, IsActive)
    VALUES ('DEFAULT', 'Default Company', 'admin@default.com', 1);
END
GO

-- Create Clients Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE [dbo].[Clients] (
        ClientId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        ClientName NVARCHAR(200) NOT NULL,
        Address NVARCHAR(500),
        MobileNumber NVARCHAR(50),
        Email NVARCHAR(200),
        GSTNumber NVARCHAR(50),
        State NVARCHAR(100),
        Country NVARCHAR(100),

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        -- ClientName assumed unique per tenant if no code exists, or just index it
        INDEX IX_TenantId_ClientName (TenantId, ClientName)
    );
END
GO

-- Create Suppliers Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
BEGIN
    CREATE TABLE [dbo].[Suppliers] (
        SupplierId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        SupplierName NVARCHAR(200) NOT NULL,
        Address NVARCHAR(500),
        MobileNumber NVARCHAR(50),
        Email NVARCHAR(200),
        GSTNumber NVARCHAR(50),
        ExcessQuantityTolerance DECIMAL(5, 2), -- Percentage or Value
        State NVARCHAR(100),
        Country NVARCHAR(100),

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_SupplierName (TenantId, SupplierName)
    );
END
GO

-- Create HSNMasters Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HSNMasters')
BEGIN
    CREATE TABLE [dbo].[HSNMasters] (
        HSNId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        Name NVARCHAR(200) NOT NULL,
        HSNCode NVARCHAR(50) NOT NULL,
        GSTPercentage DECIMAL(5, 2) NOT NULL,

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_HSNCode (TenantId, HSNCode)
    );
END
GO

-- Create Materials Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Materials')
BEGIN
    CREATE TABLE [dbo].[Materials] (
        MaterialId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        ItemCode NVARCHAR(50) NOT NULL,
        ItemName NVARCHAR(200) NOT NULL,
        ShelfLifeDays INT,
        ItemGroup NVARCHAR(100) NOT NULL,
        PurchaseUnit NVARCHAR(50) NOT NULL,
        PurchaseRate DECIMAL(18, 2), -- Changed to 18,2 for currency
        HSNCode NVARCHAR(50), 
        
        -- Roll Specifics
        GSM DECIMAL(10, 2),
        WidthMm DECIMAL(10, 2),

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_ItemCode (TenantId, ItemCode),
        INDEX IX_TenantId_ItemName (TenantId, ItemName)
    );
END
GO

-- Create RollMasters Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RollMasters')
BEGIN
    CREATE TABLE [dbo].[RollMasters] (
        RollId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        ItemType NVARCHAR(50) NOT NULL, -- Film, Paper
        ItemCode NVARCHAR(50) NOT NULL, -- RF..., RP...
        ItemName NVARCHAR(200) NOT NULL,
        SupplierItemCode NVARCHAR(100),
        
        Mill NVARCHAR(100),
        Quality NVARCHAR(100),
        RollWidthMM DECIMAL(10, 2) NOT NULL,
        
        -- Technical Specs
        ThicknessMicron DECIMAL(10, 2),
        Density DECIMAL(10, 2),
        FaceGSM DECIMAL(10, 2),
        ReleaseGSM DECIMAL(10, 2),
        AdhesiveGSM DECIMAL(10, 2),
        TotalGSM DECIMAL(10, 2),
        
        -- Commercial / Inventory
        ShelfLifeDays INT,
        PurchaseUnit NVARCHAR(50) NOT NULL,
        StockUnit NVARCHAR(50) NOT NULL,
        PurchaseRate DECIMAL(18, 2),
        HSNCode NVARCHAR(50),
        Location NVARCHAR(100),
        SupplierName NVARCHAR(200), -- Providing Supplier

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_RollCode (TenantId, ItemCode)
    );
END
GO

-- Create ToolMasters Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ToolMasters')
BEGIN
    CREATE TABLE [dbo].[ToolMasters] (
        ToolId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),

        ToolPrefix NVARCHAR(50) NOT NULL, -- PLATES, PRINTING CYLINDER, etc.
        ToolNo NVARCHAR(50) NOT NULL,     -- e.g. PC001
        ItemCode NVARCHAR(50) NOT NULL,   -- Mapped to ToolNo
        ToolName NVARCHAR(200) NOT NULL,
        ToolRefCode NVARCHAR(100),
        
        -- Location & Classification
        Location NVARCHAR(100),
        Cabinet NVARCHAR(50),
        Shelf NVARCHAR(50),
        Bin NVARCHAR(50),
        ToolType NVARCHAR(100),
        MachineName NVARCHAR(100),
        CylinderType NVARCHAR(100),
        Make NVARCHAR(100),
        PrintType NVARCHAR(50),
        Category NVARCHAR(50),
        
        -- Commercial / Status
        SupplierName NVARCHAR(200),
        PurchaseDate DATETIME,
        Status NVARCHAR(50),
        Remark NVARCHAR(MAX),
        UsageCount INT DEFAULT 0,
        
        -- Dimensional / Technical
        Size NVARCHAR(50),
        Width NVARCHAR(50),
        Height NVARCHAR(50),
        Thickness NVARCHAR(50),
        Unit NVARCHAR(50),
        DrawingNo NVARCHAR(100),
        RevNo NVARCHAR(50),
        
        -- Cylinder Specifics
        NoOfTeeth DECIMAL(10, 2), -- Changed to decimal to match frontend usage if needed (though usually int)
        CircumferenceMM DECIMAL(10, 3),
        CircumferenceInch DECIMAL(10, 3),
        
        -- Others
        HSNCode NVARCHAR(50),
        PurchaseUnit NVARCHAR(50),
        PurchaseRate DECIMAL(18, 2),
        
        -- Specifics based on Type
        -- PLATES
        ColorDetails NVARCHAR(200),
        Plates NVARCHAR(MAX), 
        
        -- ANILOX
        LPI NVARCHAR(50),
        BCM NVARCHAR(50),
        
        -- DIES
        JobSize NVARCHAR(100),
        AcrossUps DECIMAL(10, 2),
        AroundUps DECIMAL(10, 2),
        AcrossGap DECIMAL(10, 2),
        AroundGap DECIMAL(10, 2),

        -- Metadata
        JobCode NVARCHAR(100),
        JobName NVARCHAR(200),
        ToolDescription NVARCHAR(MAX),

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_ToolNo (TenantId, ToolNo)
    );
END
GO

-- Create PurchaseOrders Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PurchaseOrders')
BEGIN
    CREATE TABLE [dbo].[PurchaseOrders] (
        POId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),
        
        PONumber NVARCHAR(50) NOT NULL,
        PODate DATETIME NOT NULL,
        SupplierId INT NOT NULL, -- Logical FK to Suppliers (Assuming SupplierId is Int)
        
        Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Received, Closed, Cancelled
        Remarks NVARCHAR(MAX),
        
        -- Charges & Totals
        OtherCharges DECIMAL(18, 2) DEFAULT 0,
        OtherChargeDescription NVARCHAR(200),
        
        GrandBasic DECIMAL(18, 2) DEFAULT 0,
        GrandTax DECIMAL(18, 2) DEFAULT 0,
        GrandTotal DECIMAL(18, 2) DEFAULT 0,

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_PONumber (TenantId, PONumber)
    );
END
GO

-- Create PurchaseOrderItems Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PurchaseOrderItems')
BEGIN
    CREATE TABLE [dbo].[PurchaseOrderItems] (
        POItemId INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Tenants](TenantId),
        POId INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PurchaseOrders](POId) ON DELETE CASCADE,
        
        -- Item Details
        ItemType NVARCHAR(50) NOT NULL, -- 'Roll' or 'Material'
        ItemId INT NOT NULL, -- FK to RollMasters or Materials
        ItemCode NVARCHAR(50),
        ItemName NVARCHAR(200),
        
        -- Roll Specifics
        RollWidthMM DECIMAL(10, 2),
        RollTotalGSM DECIMAL(10, 2),
        
        -- Quantities
        QtyKg DECIMAL(18, 3),      -- For Rolls
        QtySqMtr DECIMAL(18, 3),   -- For Rolls
        QtyRunMtr DECIMAL(18, 3),  -- For Rolls
        QtyUnit DECIMAL(18, 3),    -- For Materials
        
        -- Commercials
        ReqDate DATETIME,
        Rate DECIMAL(18, 2),
        RateType NVARCHAR(50), -- UOM (KG, Sq.Mtr, Nos, etc.)
        
        -- Amounts
        BasicAmount DECIMAL(18, 2),
        TaxAmount DECIMAL(18, 2),
        CGST DECIMAL(18, 2) DEFAULT 0,
        SGST DECIMAL(18, 2) DEFAULT 0,
        IGST DECIMAL(18, 2) DEFAULT 0,
        TotalAmount DECIMAL(18, 2),
        
        -- Tax Details
        HSNCode NVARCHAR(50),
        GSTPercent DECIMAL(5, 2),
        
        Remark NVARCHAR(200),

        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

        INDEX IX_TenantId_POId (TenantId, POId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcessMasters')
BEGIN
    CREATE TABLE ProcessMasters (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        ChargeType NVARCHAR(100) NOT NULL,
        IsUnitConversion BIT NOT NULL DEFAULT 0,
        Rate DECIMAL(18,2) NOT NULL DEFAULT 0,
        FormulaParams NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        IsActive BIT DEFAULT 1,
        IsDeleted BIT DEFAULT 0,
        INDEX IX_ProcessMasters_TenantId (TenantId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        IsActive BIT DEFAULT 1,
        IsDeleted BIT DEFAULT 0,
        INDEX IX_Categories_TenantId (TenantId)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CategoryProcesses')
BEGIN
    CREATE TABLE CategoryProcesses (
        CategoryId INT NOT NULL,
        ProcessId INT NOT NULL,
        TenantId INT NOT NULL,
        CONSTRAINT PK_CategoryProcesses PRIMARY KEY (CategoryId, ProcessId),
        CONSTRAINT FK_CategoryProcesses_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id),
        CONSTRAINT FK_CategoryProcesses_ProcessMasters FOREIGN KEY (ProcessId) REFERENCES ProcessMasters(Id),
        INDEX IX_CategoryProcesses_TenantId (TenantId)
    );
END
GO

