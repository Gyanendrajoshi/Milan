using Dapper;
using System.Data;

namespace Milan.API.Infrastructure.Database
{
    public static class SchemaUpdater
    {
        public static void EnsureSchema(string connectionString)
        {
            using var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
            connection.Open();

            var sql = @"
                IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EstimationProcessCosts')
                BEGIN
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationProcessCosts]') AND name = 'BaseRate')
                    BEGIN
                        ALTER TABLE EstimationProcessCosts ADD BaseRate DECIMAL(18,2) DEFAULT 0;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationProcessCosts]') AND name = 'ExtraColorRate')
                    BEGIN
                        ALTER TABLE EstimationProcessCosts ADD ExtraColorRate DECIMAL(18,2) DEFAULT 0;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationProcessCosts]') AND name = 'BackPrintingRate')
                    BEGIN
                        ALTER TABLE EstimationProcessCosts ADD BackPrintingRate DECIMAL(18,2) DEFAULT 0;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationProcessCosts]') AND name = 'DebugInfo')
                    BEGIN
                        ALTER TABLE EstimationProcessCosts ADD DebugInfo NVARCHAR(MAX);
                    END
                END

                IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EstimationDetails')
                BEGIN
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationDetails]') AND name = 'ToolTeeth') ALTER TABLE EstimationDetails ADD ToolTeeth INT;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationDetails]') AND name = 'ToolCircumferenceMM') ALTER TABLE EstimationDetails ADD ToolCircumferenceMM FLOAT;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationDetails]') AND name = 'ToolCircumferenceInch') ALTER TABLE EstimationDetails ADD ToolCircumferenceInch FLOAT;
                    
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationDetails]') AND name = 'RollWidthMM') ALTER TABLE EstimationDetails ADD RollWidthMM FLOAT;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[EstimationDetails]') AND name = 'RollTotalGSM') ALTER TABLE EstimationDetails ADD RollTotalGSM FLOAT;
                END
            ";

            connection.Execute(sql);
        }
    }
}
