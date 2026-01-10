IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Estimations')
BEGIN
    CREATE TABLE Estimations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        TenantId INT NOT NULL DEFAULT 1,
        JobCardNo NVARCHAR(50) NOT NULL,
        Date DATETIME NOT NULL,
        ClientId INT NOT NULL,
        JobName NVARCHAR(255) NOT NULL,
        JobPriority NVARCHAR(50) DEFAULT 'Medium',
        JobType NVARCHAR(50) DEFAULT 'New Job',
        Status NVARCHAR(50) DEFAULT 'Draft',
        
        -- Global Fields (Aggregated or Single)
        OrderQty FLOAT NOT NULL,
        CategoryId INT NOT NULL,
        PoNumber NVARCHAR(50),
        DeliveryDate DATETIME,
        SalesPerson NVARCHAR(100),

        -- Financials (Aggregated)
        TotalJobCost DECIMAL(18,2) DEFAULT 0,
        FinalPriceWithGST DECIMAL(18,2) DEFAULT 0,
        UnitCost DECIMAL(18,2) DEFAULT 0,
        FinalSalesPrice DECIMAL(18,2) DEFAULT 0,
        TotalOrderValue DECIMAL(18,2) DEFAULT 0,

        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        IsActive BIT DEFAULT 1,
        IsDeleted BIT DEFAULT 0
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EstimationDetails')
BEGIN
    CREATE TABLE EstimationDetails (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EstimationId INT NOT NULL FOREIGN KEY REFERENCES Estimations(Id) ON DELETE CASCADE,
        
        ContentName NVARCHAR(100),
        MachineName NVARCHAR(100),
        
        -- Specs
        JobWidthMM FLOAT DEFAULT 0,
        JobHeightMM FLOAT DEFAULT 0,
        ColorsFront INT DEFAULT 0,
        ColorsBack INT DEFAULT 0,
        UpsAcross INT DEFAULT 0,
        UpsAround INT DEFAULT 0,
        TotalUps INT DEFAULT 0,
        
        -- Resources
        ToolId INT,
        ToolTeeth INT,
        ToolCircumferenceMM FLOAT,
        ToolCircumferenceInch FLOAT,
        DieId INT,
        RollId INT,
        RollWidthMM FLOAT,
        RollTotalGSM FLOAT,
        
        -- Calculations
        BaseRunningMtr FLOAT DEFAULT 0,
        BaseSqMtr FLOAT DEFAULT 0,
        BaseKg FLOAT DEFAULT 0,
        
        WastagePercent FLOAT DEFAULT 0,
        WastageRM FLOAT DEFAULT 0,
        
        TotalRunningMtr FLOAT DEFAULT 0,
        TotalSqMtr FLOAT DEFAULT 0,
        TotalKg FLOAT DEFAULT 0,
        
        MaterialRate DECIMAL(18,2) DEFAULT 0,
        MaterialCostAmount DECIMAL(18,2) DEFAULT 0,
        
        AdditionalCostPercent FLOAT DEFAULT 0,
        AdditionalCostAmount DECIMAL(18,2) DEFAULT 0,
        
        TotalJobCost DECIMAL(18,2) DEFAULT 0,
        TotalOrderValue DECIMAL(18,2) DEFAULT 0
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EstimationProcessCosts')
BEGIN
    CREATE TABLE EstimationProcessCosts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EstimationDetailId INT NOT NULL FOREIGN KEY REFERENCES EstimationDetails(Id) ON DELETE CASCADE,
        
        ProcessId INT NOT NULL,
        RateType NVARCHAR(50), -- Can be linked to ChargeTypes via LogicCode or Name
        Quantity FLOAT DEFAULT 0,
        Rate DECIMAL(18,2) DEFAULT 0,
        Amount DECIMAL(18,2) DEFAULT 0,
        IsManualQuantity BIT DEFAULT 0,
        IsManualRate BIT DEFAULT 0,

        -- Advanced Params Snapshot
        BaseRate DECIMAL(18,2) DEFAULT 0,
        ExtraColorRate DECIMAL(18,2) DEFAULT 0,
        BackPrintingRate DECIMAL(18,2) DEFAULT 0,
        DebugInfo NVARCHAR(MAX)
    );
END

-- FORMULAS / CHARGE TYPES MASTER
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChargeTypes')
BEGIN
    CREATE TABLE ChargeTypes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        LogicCode NVARCHAR(50) NOT NULL UNIQUE, -- PER_KG, PRINT_ADV, etc.
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );

    -- SEED DATA
    INSERT INTO ChargeTypes (Name, LogicCode) VALUES 
    ('Per KG', 'PER_KG'),
    ('Per RM', 'PER_RM'),
    ('Per Sq.Mtr', 'PER_SQ_MTR'),
    ('Printing (Advanced)', 'PRINT_ADV'),
    ('Rate/Color', 'RATE_PER_COLOR'),
    ('Rate/Sq.Inch/Color', 'RATE_SQ_INCH_COLOR'),
    ('Rate/Sq.Inch/Unit', 'RATE_SQ_INCH_UNIT'),
    ('Rate/Sq.Inch', 'RATE_SQ_INCH'),
    ('Rate/Unit', 'RATE_PER_UNIT'),
    ('Per 1000 Ups', 'PER_1000_UPS'),
    ('Rate/Job', 'RATE_PER_JOB'),
    ('Rate/Inch/Unit', 'RATE_INCH_UNIT'),
    ('Rate/Sq.CM', 'RATE_SQ_CM');
END
