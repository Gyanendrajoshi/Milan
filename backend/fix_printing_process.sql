UPDATE ProcessMasters 
SET FormulaParams = '{"baseRate": 110, "extraColorRate": 10, "backPrintingRate": 50}', 
    ChargeType = 'Printing (Advanced)',
    Rate = 110
WHERE Name = 'Printing';
GO
