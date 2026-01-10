UPDATE ProcessMasters 
SET ChargeType = 'printing_advanced',
    FormulaParams = '{"extraColorRate": 10, "backPrintRate": 50, "baseRate": 110}'
WHERE Name = 'Printing';
GO
