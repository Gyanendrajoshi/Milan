Imports System.Web
Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.Data
Imports System.Data.SqlClient
Imports System.Web.Script.Services
Imports System.Web.Script.Serialization
Imports Connection

' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
<System.Web.Script.Services.ScriptService()>
<WebService(Namespace:="http://tempuri.org/")>
<WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)>
<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()>
Public Class WebServiceJumboRollSlitting
    Inherits System.Web.Services.WebService

    Dim db As New DBConnection
    Dim js As New JavaScriptSerializer()
    Dim data As New HelloWorldData()
    Dim dataTable As New DataTable()
    Dim str As String

    Dim GBLUserID As String
    Dim GBLUserName As String
    Dim GBLCompanyID As String
    Dim GBLFYear As String
    Dim DBType As String = ""

    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GenerateVoucherNo() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            GBLFYear = Convert.ToString(HttpContext.Current.Session("FYear"))

            Return db.GeneratePrefixedNo("ItemTransactionMain", "JRS", "MaxVoucherNo", 0, GBLFYear, " Where VoucherPrefix='JRS' AND VoucherID=-120 And Isnull(IsDeletedTransaction,0)=0 And CompanyID=" & GBLCompanyID & " And FYear='" & GBLFYear & "' ")
        Catch ex As Exception
            Return ex.Message
        End Try
    End Function
    Private Function ConvertDataTableTojSonString(ByVal dataTable As DataTable) As String
        Dim serializer As New System.Web.Script.Serialization.JavaScriptSerializer With {
            .MaxJsonLength = 2147483647
        }
        Dim tableRows As New List(Of Dictionary(Of [String], [Object]))()
        Dim row As Dictionary(Of [String], [Object])
        For Each dr As DataRow In dataTable.Rows
            row = New Dictionary(Of [String], [Object])()
            For Each col As DataColumn In dataTable.Columns
                row.Add(col.ColumnName, dr(col))
                System.Console.WriteLine(dr(col))
            Next
            tableRows.Add(row)
        Next
        Return serializer.Serialize(tableRows)
    End Function

    '-----------------------------------Get Warehouse List------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetWarehouseList() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "Select DISTINCT WarehouseName AS Warehouse From WarehouseMaster Where IFNULL(WarehouseName,'') <> '' AND IsDeletedTransaction=0 AND CompanyID=" & GBLCompanyID & " AND IFNULL(IsFloorWarehouse,0)=0 Order By WarehouseName"
            Else
                str = "Select DISTINCT WarehouseName AS Warehouse From WarehouseMaster Where Isnull(WarehouseName,'') <> '' AND IsDeletedTransaction=0 AND CompanyID=" & GBLCompanyID & " AND Isnull(IsFloorWarehouse,0)=0 Order By WarehouseName"
            End If
            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            Return js.Serialize(data.Message)
        Catch ex As Exception
            Return ex.Message
        End Try

    End Function

    '-----------------------------------Get Roll Stock------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetRollStockList() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            GBLFYear = Convert.ToString(HttpContext.Current.Session("FYear"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "SELECT IFNULL(IM.ItemID,0) AS ItemID,IFNULL(IM.ItemGroupID,0) AS ItemGroupID,IFNULL(IGM.ItemGroupNameID,0) AS ItemGroupNameID,IFNULL(ISGM.ItemSubGroupID,0) AS ItemSubGroupID,   IFNULL(Temp.ParentTransactionID,0) As ParentTransactionID,IFNULL(Temp.WarehouseID,0) As WarehouseID,Nullif(IGM.ItemGroupName,'') AS ItemGroupName,Nullif(ISGM.ItemSubGroupName,'') AS ItemSubGroupName,Nullif(IM.ItemCode,'') AS ItemCode,Nullif(IM.ItemName,'') AS ItemName,Nullif(IM.ItemDescription,'') AS ItemDescription, Nullif(IM.StockUnit,'') AS StockUnit,IFNULL(Temp.ClosingQty,0) AS BatchStock,0 AS IssueQuantity,Nullif(Temp.GRNNo,'') AS GRNNo,Convert(date_format(IfNULL(Temp.GRNDate,CURRENT_TIMESTAMP),'%d-%b-%Y'),char(13)) /*Replace(Convert(varchar(13),Temp.GRNDate,106),' ','-')*/ AS GRNDate,IFNULL(Temp.BatchID,0) AS BatchID,Nullif(Temp.BatchNo,'') AS BatchNo,Nullif(Temp.SupplierBatchNo,'') AS SupplierBatchNo,Nullif(Temp.MfgDate,'') AS MfgDate,Nullif(Temp.ExpiryDate,'') AS ExpiryDate,Nullif(Temp.WarehouseName,'') AS Warehouse,Nullif(Temp.BinName,'') AS Bin,IFNULL(IM.WtPerPacking,0) AS WtPerPacking,IFNULL(IM.UnitPerPacking,1) AS UnitPerPacking,IFNULL(IM.ConversionFactor,1) AS ConversionFactor   " &
                  " From ItemMaster As IM INNER JOIN ItemGroupMaster AS IGM ON IGM.ItemGroupID=IM.ItemGroupID And IGM.CompanyID=IM.CompanyID And IFNULL(IM.IsDeletedTransaction,0)=0 INNER JOIN (Select IFNULL(IM.CompanyID,0) AS CompanyID,IFNULL(IM.ItemID,0) AS ItemID,IFNULL(ITD.WarehouseID,0) AS WarehouseID,IFNULL(ITD.ParentTransactionID,0) AS ParentTransactionID,IFNULL(SUM(IFNULL(ITD.ReceiptQuantity,0)), 0) - IFNULL(SUM(IFNULL(ITD.IssueQuantity,0)), 0) - IFNULL(SUM(IFNULL(ITD.RejectedQuantity,0)), 0) AS ClosingQty,IFNULL(ITD.BatchID,0) AS BatchID,Nullif(ITD.BatchNo,'') AS BatchNo,Nullif(IBD.SupplierBatchNo,'') AS SupplierBatchNo,date_format(IBD.MfgDate,'%d-%b-%Y') AS MfgDate,date_format(IBD.ExpiryDate,'%d-%b-%Y') AS ExpiryDate,Nullif('','') AS Pallet_No,Nullif(WM.WarehouseName,'') AS WarehouseName,Nullif(WM.BinName,'') AS BinName,Nullif(IT.VoucherNo,'') AS GRNNo,date_format(IfNULL(IT.VoucherDate,CURRENT_TIMESTAMP),'%d-%b-%Y') /*Replace(Convert(varchar(13),IT.VoucherDate,106),' ','-')*/ AS GRNDate From ItemMaster As IM INNER JOIN ItemTransactionDetail As ITD On ITD.ItemID=IM.ItemID And ITD.CompanyID=IM.CompanyID And IFNULL(ITD.IsDeletedTransaction, 0)=0 And (IFNULL(ITD.ReceiptQuantity,0)>0 Or IFNULL(ITD.IssueQuantity,0)>0) INNER JOIN ItemTransactionMain As ITM On ITM.TransactionID=ITD.TransactionID And ITM.CompanyID=ITD.CompanyID And ITM.VoucherID Not In(-8, -9, -11)  INNER JOIN ItemTransactionMain AS IT ON IT.TransactionID=ITD.ParentTransactionID And IT.CompanyID=ITD.CompanyID INNER JOIN WarehouseMaster AS WM ON WM.WarehouseID=ITD.WarehouseID And WM.CompanyID=ITD.CompanyID INNER JOIN ItemTransactionBatchDetail AS IBD ON IBD.BatchID=ITD.BatchID And IBD.CompanyID=ITD.CompanyID " &
                  " Where ITD.CompanyID=" & GBLCompanyID & " And ITD.ItemGroupID IN(5,6,13) Group BY IFNULL(IM.ItemID, 0),IFNULL(ITD.ParentTransactionID,0),IFNULL(ITD.BatchID,0),Nullif(ITD.BatchNo,''),Nullif(IBD.SupplierBatchNo,''),date_format(IBD.MfgDate,'%d-%b-%Y'),date_format(IBD.ExpiryDate,'%d-%b-%Y'),IFNULL(ITD.WarehouseID,0),Nullif(WM.WarehouseName,''),Nullif(WM.BinName,''),Nullif(IT.VoucherNo,''),date_format(IfNULL(IT.VoucherDate,CURRENT_TIMESTAMP),'%d-%b-%Y'),IFNULL(IM.CompanyID,0) HAVING(Round(IFNULL(SUM(IFNULL(ITD.ReceiptQuantity, 0)), 0) - IFNULL(SUM(IFNULL(ITD.IssueQuantity, 0)), 0) - IFNULL(SUM(IFNULL(ITD.RejectedQuantity, 0)), 0),2) > 0 )) As Temp On Temp.ItemID=IM.ItemID And Temp.CompanyID=IM.CompanyID LEFT JOIN ItemSubGroupMaster AS ISGM ON ISGM.ItemSubGroupID=IM.ItemSubGroupID And ISGM.CompanyID=IM.CompanyID  " &
                  " Where IM.CompanyID =" & GBLCompanyID & "  and IM.ItemGroupID IN(5,6,13) Order by ParentTransactionID"
            Else
                str = "SELECT Isnull(IM.ItemID,0) AS ItemID,Isnull(IM.ItemGroupID,0) AS ItemGroupID,Isnull(IGM.ItemGroupNameID,0) AS ItemGroupNameID,Isnull(ISGM.ItemSubGroupID,0) AS ItemSubGroupID,   Isnull(Temp.ParentTransactionID,0) As ParentTransactionID,Isnull(Temp.WarehouseID,0) As WarehouseID,Nullif(IGM.ItemGroupName,'') AS ItemGroupName,Nullif(ISGM.ItemSubGroupName,'') AS ItemSubGroupName,Nullif(IM.ItemCode,'') AS ItemCode,Nullif(IM.ItemName,'') AS ItemName,NULLIF(IM.TotalGSM,'') AS GSM,NULLIF(IM.SizeW,'') AS SizeW,NULLIF (IM.Thickness, '') AS Thickness,NULLIF (IM.Density, '') AS Density,Nullif(IM.ItemDescription,'') AS ItemDescription, Nullif(IM.StockUnit,'') AS StockUnit,Isnull(Temp.ClosingQty,0) AS BatchStock,Temp.stockunit as StockUnit1,0 AS IssueQuantity,Nullif(Temp.GRNNo,'') AS GRNNo,Replace(Convert(varchar(13),Temp.GRNDate,106),' ','-') AS GRNDate,Isnull(Temp.BatchID,0) AS BatchID,Nullif(Temp.BatchNo,'') AS BatchNo,Nullif(Temp.SupplierBatchNo,'') AS SupplierBatchNo,Nullif(Temp.MfgDate,'') AS MfgDate,Nullif(Temp.ExpiryDate,'') AS ExpiryDate,Nullif(Temp.WarehouseName,'') AS Warehouse,Nullif(Temp.BinName,'') AS Bin,Isnull(IM.WtPerPacking,0) AS WtPerPacking,Isnull(IM.UnitPerPacking,1) AS UnitPerPacking,Isnull(IM.ConversionFactor,1) AS ConversionFactor   " &
                  " From ItemMaster As IM INNER JOIN ItemGroupMaster AS IGM ON IGM.ItemGroupID=IM.ItemGroupID And IGM.CompanyID=IM.CompanyID And Isnull(IM.IsDeletedTransaction,0)=0 INNER JOIN (Select Isnull(IM.CompanyID,0) AS CompanyID,Isnull(IM.ItemID,0) AS ItemID,Isnull(ITD.WarehouseID,0) AS WarehouseID,Isnull(ITD.ParentTransactionID,0) AS ParentTransactionID,ISNULL(SUM(Isnull(ITD.ReceiptQuantity,0)), 0) - ISNULL(SUM(Isnull(ITD.IssueQuantity,0)), 0) - ISNULL(SUM(Isnull(ITD.RejectedQuantity,0)), 0) AS ClosingQty,ITD.stockunit,Isnull(ITD.BatchID,0) AS BatchID,Nullif(ITD.BatchNo,'') AS BatchNo,Nullif(IBD.SupplierBatchNo,'') AS SupplierBatchNo,Nullif(IBD.MfgDate,'') AS MfgDate,Nullif(IBD.ExpiryDate,'') AS ExpiryDate,Nullif('','') AS Pallet_No,Nullif(WM.WarehouseName,'') AS WarehouseName,Nullif(WM.BinName,'') AS BinName,Nullif(IT.VoucherNo,'') AS GRNNo,Replace(Convert(varchar(13),IT.VoucherDate,106),' ','-') AS GRNDate From ItemMaster As IM INNER JOIN ItemTransactionDetail As ITD On ITD.ItemID=IM.ItemID And ITD.CompanyID=IM.CompanyID And Isnull(ITD.IsDeletedTransaction, 0)=0 And (Isnull(ITD.ReceiptQuantity,0)>0 Or Isnull(ITD.IssueQuantity,0)>0) INNER JOIN ItemTransactionMain As ITM On ITM.TransactionID=ITD.TransactionID And ITM.CompanyID=ITD.CompanyID And ITM.VoucherID Not In(-8, -9, -11)  INNER JOIN ItemTransactionMain AS IT ON IT.TransactionID=ITD.ParentTransactionID And IT.CompanyID=ITD.CompanyID INNER JOIN WarehouseMaster AS WM ON WM.WarehouseID=ITD.WarehouseID And WM.CompanyID=ITD.CompanyID INNER JOIN ItemTransactionBatchDetail AS IBD ON IBD.BatchID=ITD.BatchID And IBD.CompanyID=ITD.CompanyID " &
                  " Where ITD.CompanyID=" & GBLCompanyID & " And ITD.ItemGroupID IN(5,6,13) Group BY Isnull(IM.ItemID, 0),Isnull(ITD.ParentTransactionID,0),Isnull(ITD.BatchID,0),Nullif(ITD.BatchNo,''),Nullif(IBD.SupplierBatchNo,''),Nullif(IBD.MfgDate,''),Nullif(IBD.ExpiryDate,''),Isnull(ITD.WarehouseID,0),Nullif(WM.WarehouseName,''),Nullif(WM.BinName,''),Nullif(IT.VoucherNo,''),ITD.stockunit,Replace(Convert(varchar(13),IT.VoucherDate,106),' ','-'),Isnull(IM.CompanyID,0) HAVING(Round(ISNULL(SUM(ISNULL(ITD.ReceiptQuantity, 0)), 0) - ISNULL(SUM(ISNULL(ITD.IssueQuantity, 0)), 0) - ISNULL(SUM(ISNULL(ITD.RejectedQuantity, 0)), 0),2) > 0 )) As Temp On Temp.ItemID=IM.ItemID And Temp.CompanyID=IM.CompanyID LEFT JOIN ItemSubGroupMaster AS ISGM ON ISGM.ItemSubGroupID=IM.ItemSubGroupID And ISGM.CompanyID=IM.CompanyID  " &
                  " Where IM.CompanyID =" & GBLCompanyID & "  and IM.ItemGroupID IN(5,6,13)  Order by ParentTransactionID"
            End If

            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            js.MaxJsonLength = 2147483647
            Return js.Serialize(data.Message)

        Catch ex As Exception
            Return ex.Message
        End Try

    End Function

    '-----------------------------------Get Roll Master------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetRollMasterList(ByVal ItemCode As String) As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            GBLFYear = Convert.ToString(HttpContext.Current.Session("FYear"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "Select IM.ItemID, IM.ItemCode, IM.ItemName, IG.ItemGroupID , IG.ItemGroupName , IM.GSM, IM.AdhesiveGSM, IM.ReleaseGSM, IM.SizeW, IM.StockUnit From ItemMaster as IM INNER JOIN ItemGroupMaster as IG On IG.ItemGroupID = IM.ItemGroupID  Where IM.ItemGroupID  IN(5,6,13) Order By IM.ItemCode"
            Else
                'str = "Select IM.ItemID, IM.ItemCode, IM.ItemName, IG.ItemGroupID, IG.ItemGroupName , IM.GSM, IM.AdhesiveGSM, IM.ReleaseGSM, IM.SizeW, NULLIF(IM.StockUnit,'') StockUnit From ItemMaster as IM INNER JOIN ItemGroupMaster as IG On IG.ItemGroupID = IM.ItemGroupID  Where IM.ItemGroupID  IN(5,6,13) Order By IM.ItemCode"
                'str = "SELECT IM.ItemID, IM.ItemCode, IM.ItemName, IG.ItemGroupID, IG.ItemGroupName ,IM.TotalGSM, IM.GSM, IM.AdhesiveGSM, IM.ReleaseGSM, IM.SizeW, NULLIF(IM.StockUnit,'') StockUnit FROM ITEMMASTER IM INNER JOIN ItemGroupMaster AS IG ON IG.ItemGroupID = IM.ItemGroupID WHERE EXISTS ( SELECT 1 FROM ITEMMASTER X WHERE X.ItemCode = '" & ItemCode & "' AND ISNULL(IM.Quality, '')      = ISNULL(X.Quality, '') AND ISNULL(IM.GSM, 0)           = ISNULL(X.GSM, 0) AND ISNULL(IM.Manufecturer, '') = ISNULL(X.Manufecturer, '') ) AND IM.ItemCode <> '" & ItemCode & "'"
                str = "SELECT IM.ItemID,IM.ItemCode,IM.ItemName,IG.ItemGroupID,IG.ItemGroupName,IM.TotalGSM,IM.GSM,IM.AdhesiveGSM,IM.ReleaseGSM,IM.SizeW,NULLIF(IM.StockUnit,'') StockUnit,IM.Thickness,IM.Density FROM ITEMMASTER IM INNER JOIN ItemGroupMaster IG ON IG.ItemGroupID=IM.ItemGroupID WHERE EXISTS(SELECT 1 FROM ITEMMASTER X WHERE X.ItemCode='" & ItemCode & "' AND X.ISDELETEDTRANSACTION = 0 AND ISNULL(IM.Quality,'')=ISNULL(X.Quality,'') AND ISNULL(IM.GSM,0)=ISNULL(X.GSM,0) AND ISNULL(IM.Manufecturer,'')=ISNULL(X.Manufecturer,'')) AND IM.ItemCode<>'" & ItemCode & "' AND IM.ItemGroupID<>14 AND IM.SizeW<=(SELECT SizeW FROM ITEMMASTER WHERE ItemCode='" & ItemCode & "' AND ISDELETEDTRANSACTION = 0);"
            End If

            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            Return js.Serialize(data.Message)

        Catch ex As Exception
            Return ex.Message
        End Try

    End Function

    '-----------------------------------Get Bins List------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetBinsList(ByVal warehousename As String) As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "SELECT Distinct BinName AS Bin,IFNULL(WarehouseID,0) AS WarehouseID FROM WarehouseMaster Where WarehouseName='" & warehousename & "' AND IFNULL(BinName,'')<>'' AND IsDeletedTransaction=0 AND CompanyID=" & GBLCompanyID & " Order By BinName"
            Else
                str = "SELECT Distinct BinName AS Bin,Isnull(WarehouseID,0) AS WarehouseID FROM WarehouseMaster Where WarehouseName='" & warehousename & "' AND Isnull(BinName,'')<>'' AND IsDeletedTransaction=0 AND CompanyID=" & GBLCompanyID & " Order By BinName"
            End If
            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            Return js.Serialize(data.Message)
        Catch ex As Exception
            Return ex.Message
        End Try

    End Function

    ''---------------------------- Save Data  ------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function SaveData(ByVal prefix As String, ByVal jsonObjectsRecordMain As Object, ByVal jsonObjectsRecordDetail As Object, ByVal ObjectsConsumeMain As Object, ByVal ObjectsConsumeDetails As Object) As String

        GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
        GBLUserID = Convert.ToString(HttpContext.Current.Session("UserID"))
        GBLFYear = Convert.ToString(HttpContext.Current.Session("FYear"))
        DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

        Dim dt As New DataTable
        Dim VNo As String
        Dim MaxVNo As Long
        Dim KeyField, TransactionID, TransactionIDM As String
        Dim AddColName, AddColValue, TableName As String

        Try

            VNo = db.GeneratePrefixedNo("ItemTransactionMain", prefix, "MaxVoucherNo", MaxVNo, GBLFYear, " Where VoucherPrefix='" & prefix & "' And  CompanyID=" & GBLCompanyID & " And FYear='" & GBLFYear & "' ")

            If (db.CheckAuthories("JumboRollSlitting.aspx", GBLUserID, GBLCompanyID, "CanSave", VNo) = False) Then Return "You are not authorized to save..!, Can't Save"
            Using updateTransaction As New Transactions.TransactionScope
                '''' Item consumption or issue entry to deduct stock from inventory 
                TableName = "ItemTransactionMain"
                AddColName = "ModifiedDate,CreatedDate,UserID,CompanyID,FYear,CreatedBy,ModifiedBy,VoucherPrefix,MaxVoucherNo,VoucherNo"
                If DBType = "MYSQL" Then
                    AddColValue = "Now(),Now(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "','" & prefix & "','" & MaxVNo & "','" & VNo & "'"
                Else
                    AddColValue = "GetDate(),Getdate(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "','" & prefix & "','" & MaxVNo & "','" & VNo & "'"
                End If
                TransactionID = db.InsertDatatableToDatabase(ObjectsConsumeMain, TableName, AddColName, AddColValue)

                TransactionIDM = TransactionID '' For Jumbo Roll Slitting Transaction ID as common id for all records

                If IsNumeric(TransactionID) = False Then
                    updateTransaction.Dispose()
                    Return "Error in transaction main: " & TransactionID
                End If

                TableName = "ItemTransactionDetail"
                AddColName = "ModifiedDate,CreatedDate,UserID,CompanyID,FYear,CreatedBy,ModifiedBy,TransactionID, JumboRollSlittingTransactionID"
                If DBType = "MYSQL" Then
                    AddColValue = "Now(),Now(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "'," & TransactionID & "," & TransactionIDM & ""
                Else
                    AddColValue = "GetDate(),Getdate(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "'," & TransactionID & "," & TransactionIDM & ""
                End If
                str = db.InsertDatatableToDatabase(ObjectsConsumeDetails, TableName, AddColName, AddColValue)
                If IsNumeric(str) = False Then
                    db.ExecuteNonSQLQuery("Delete From ItemTransactionMain Where CompanyID=" & GBLCompanyID & " And TransactionID=" & TransactionID)
                    db.ExecuteNonSQLQuery("Delete From ItemTransactionDetail Where CompanyID=" & GBLCompanyID & " And TransactionID=" & TransactionID)
                    updateTransaction.Dispose()
                    Return "Error in transaction details: " & str
                End If

                If DBType = "MYSQL" Then
                    db.ExecuteNonSQLQuery("CALL UPDATE_ITEM_STOCK_VALUES( " & GBLCompanyID & "," & TransactionID & ",0);")
                Else
                    db.ExecuteNonSQLQuery("EXEC UPDATE_ITEM_STOCK_VALUES " & GBLCompanyID & "," & TransactionID & ",0")
                End If

                '''' Item Stock entry to add new stock inventory 
                TableName = "ItemTransactionMain"
                AddColName = "ModifiedDate,CreatedDate,UserID,CompanyID,FYear,CreatedBy,ModifiedBy,VoucherPrefix,MaxVoucherNo,VoucherNo"
                If DBType = "MYSQL" Then
                    AddColValue = "Now(),Now(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "','" & prefix & "','" & MaxVNo & "','" & VNo & "'"
                Else
                    AddColValue = "GetDate(),Getdate(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "','" & prefix & "','" & MaxVNo & "','" & VNo & "'"
                End If
                TransactionID = db.InsertDatatableToDatabase(jsonObjectsRecordMain, TableName, AddColName, AddColValue)

                If IsNumeric(TransactionID) = False Then
                    updateTransaction.Dispose()
                    Return "Error in transaction main: " & TransactionID
                End If

                TableName = "ItemTransactionDetail"
                AddColName = "ModifiedDate,CreatedDate,UserID,CompanyID,FYear,CreatedBy,ModifiedBy,TransactionID, JumboRollSlittingTransactionID,ParentTransactionID"
                If DBType = "MYSQL" Then
                    AddColValue = "Now(),Now(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "'," & TransactionID & "," & TransactionIDM & "," & TransactionID & ""
                Else
                    AddColValue = "GetDate(),Getdate(),'" & GBLUserID & "','" & GBLCompanyID & "','" & GBLFYear & "','" & GBLUserID & "','" & GBLUserID & "'," & TransactionID & "," & TransactionIDM & "," & TransactionID & ""
                End If
                str = db.InsertDatatableToDatabase(jsonObjectsRecordDetail, TableName, AddColName, AddColValue, "Receipt Note", VNo & "/")
                If IsNumeric(str) = False Then
                    db.ExecuteNonSQLQuery("Delete From ItemTransactionMain Where CompanyID=" & GBLCompanyID & " And TransactionID=" & TransactionID)
                    db.ExecuteNonSQLQuery("Delete From ItemTransactionDetail Where CompanyID=" & GBLCompanyID & " And TransactionID=" & TransactionID)
                    updateTransaction.Dispose()
                    Return "Error in transaction details: " & str
                End If

                db.ExecuteNonSQLQuery("Update ItemTransactionDetail Set BatchID = TransactionDetailID, BatchNo = (BatchNo + Convert(Nvarchar(50),TransactionDetailID)) Where CompanyID = " & GBLCompanyID & " AND TransactionID = " & TransactionID & " ")
                db.ExecuteNonSQLQuery("INSERT INTO ItemTransactionBatchDetail(BatchID, BatchNo, SupplierBatchNo, MfgDate, ExpiryDate, CompanyID, FYear, CreatedBy, CreatedDate)(Select BatchID,BatchNo,SupplierBatchNo, MfgDate, ExpiryDate, CompanyID, FYear, CreatedBy, CreatedDate From ItemTransactionDetail Where CompanyID = " & GBLCompanyID & " AND TransactionID = " & TransactionID & " )")

                If DBType = "MYSQL" Then
                    db.ExecuteNonSQLQuery("CALL UPDATE_ITEM_STOCK_VALUES( " & GBLCompanyID & "," & TransactionID & ",0);")
                Else
                    db.ExecuteNonSQLQuery("EXEC UPDATE_ITEM_STOCK_VALUES " & GBLCompanyID & "," & TransactionID & ",0")
                End If

                KeyField = "Success"
                updateTransaction.Complete()
            End Using
        Catch ex As Exception
            KeyField = "Error in exception: " & ex.Message
        End Try
        Return KeyField
    End Function

    ''End Spare Part Physical Veri..///////////

    ' Start Anshu Code '
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function ShowListGetDataVB() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = ""
            Else
                str = "Select  ID.TransactionID, IM.VoucherNo ,replace(convert(nvarchar(30),IM.VoucherDate,106),'','-') AS VoucherDate, I.ItemID, I.ItemCode, I.ItemName, ID.IssueQuantity, ID.ReceiptQuantity,  ID.StockUnit, W.WarehouseID, " &
                        " W.WarehouseName, W.WarehouseBinName, ID.BatchNo,ID.JumboRollSlittingTransactionID , " &
                        " Case When Isnull(ID.IssueQuantity,0) > 0 Then 'Consumed' when Isnull(ID.ReceiptQuantity,0) > 0 Then 'After Slitting' End as Narration,Isnull(IM.FYear,0) as FYear,NULLIF(MM.MachineName,'') AS MachineName,NULLIF(LM.LedgerName,'') AS OperatorName, FORMAT(IM.StartDateTime, 'dd-MMM-yyyy HH:mm:ss') AS StartDateTime,FORMAT(IM.EndDateTime, 'dd-MMM-yyyy HH:mm:ss') AS EndDateTime " &
                        " From ItemTransactionMain as IM INNER JOIN ItemTransactionDetail as ID ON ID.JumboRollSlittingTransactionID = IM.TransactionID " &
                        " Inner Join ItemMaster as I on I.ItemID = ID.ItemID INNER JOIN WarehouseMaster as W ON W.WarehouseID = ID.WarehouseID LEFT JOIN MachineMaster AS MM ON MM.MachineID = IM.MachineID AND MM.CompanyID = IM.CompanyID AND ISNULL(MM.IsDeletedTransaction,0)=0 LEFT JOIN LedgerMaster AS LM ON LM.LedgerID = IM.OperatorID AND LM.CompanyID = IM.CompanyID AND ISNULL(LM.IsDeletedTransaction,0)=0  Where IM.CompanyID ='" & GBLCompanyID & "' and Isnull(IM.IsDeletedTransaction,0)=0 AND Isnull(ID.IsDeletedTransaction,0)=0 Order by IM.VoucherDate DESC"
            End If
            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            js.MaxJsonLength = 2147483647
            Return js.Serialize(data.Message)
        Catch ex As Exception
            Return ex.Message
        End Try
        ' End Anshu Code '
    End Function

    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function DeleteJumboRollSlittingData(ByVal JRSTID As String, ByVal ObjvalidateLoginUser As Object) As String
        Dim KeyField As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))
            GBLUserID = Convert.ToString(HttpContext.Current.Session("UserID"))
            If db.ValidUserAuthentication("", ObjvalidateLoginUser("userName"), ObjvalidateLoginUser("password")) = False Then
                Return "InvalidUser"
            End If

            If DBType = "MYSQL" Then
                str = ""
            Else

                If (db.CheckAuthories("JumboRollSlitting.aspx", GBLUserID, GBLCompanyID, "CanDelete", JRSTID, ObjvalidateLoginUser("transactionRemark")) = False) Then Return "You are not authorized to delete..!, Can't Delete"

                str = "update ItemTransactionDetail set IsDeletedTransaction = 1, DeletedBy = '" & GBLUserID & "', DeletedDate = GetDate() where JumboRollSlittingTransactionID = '" & JRSTID & "' And CompanyID = '" & GBLCompanyID & "'"
                db.FillDataTable(dataTable, str)

                str = "update ItemTransactionMain set IsDeletedTransaction = 1, DeletedBy = '" & GBLUserID & "', DeletedDate = GetDate() where TransactionID in(Select TransactionID from ItemTransactionDetail where JumboRollSlittingTransactionID = '" & JRSTID & "' and CompanyID ='" & GBLCompanyID & "' ) and CompanyID = '" & GBLCompanyID & "'"
                db.FillDataTable(dataTable, str)

                dataTable.Clear()
                str = "Select Distinct TransactionID From ItemTransactionDetail where JumboRollSlittingTransactionID = '" & JRSTID & "' and CompanyID ='" & GBLCompanyID & "' "
                db.FillDataTable(dataTable, str)

                Dim i As Integer
                For i = 0 To dataTable.Rows.Count - 1
                    db.ExecuteNonSQLQuery("EXEC UPDATE_ITEM_STOCK_VALUES " & GBLCompanyID & ",'" & Val(dataTable.Rows(i).Item("TransactionID")) & "',0")
                Next

            End If

            KeyField = "Success"

        Catch ex As Exception
            KeyField = "Error in exception: " & ex.Message
        End Try
        Return KeyField
    End Function
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetMachineList() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "SELECT IFNULL(MachineID,0) AS MachineID, NULLIF(MachineName,'') AS MachineName FROM MachineMaster WHERE IFNULL(IsDeletedTransaction,0)=0 AND CompanyID=" & GBLCompanyID & " ORDER BY MachineName"
            Else
                str = "SELECT ISNULL(MachineID,0) AS MachineID, NULLIF(MachineName,'') AS MachineName FROM MachineMaster WHERE ISNULL(IsDeletedTransaction,0)=0 AND CompanyID=" & GBLCompanyID & " ORDER BY MachineName"
            End If

            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            Return js.Serialize(data.Message)
        Catch ex As Exception
            Return ex.Message
        End Try
    End Function

    '-----------------------------------Get Operator List------------------------------------------
    <WebMethod(EnableSession:=True)>
    <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
    Public Function GetOperatorList() As String
        Try
            GBLCompanyID = Convert.ToString(HttpContext.Current.Session("CompanyID"))
            DBType = Convert.ToString(HttpContext.Current.Session("DBType"))

            If DBType = "MYSQL" Then
                str = "SELECT ISNULL(LM.LedgerID,0) AS LedgerID, NULLIF(LM.LedgerName,'') AS LedgerName FROM Ledgermaster as LM inner join LedgerGroupMaster  AS LGM ON LM.LedgerGroupID = LGM.LedgerGroupID WHERE ISNULL(LM.IsDeletedTransaction,0)=0 AND LM.CompanyID=" & GBLCompanyID & "  AND LGM.LedgerGroupNameID=27 ORDER BY LedgerName"
            Else
                str = "SELECT ISNULL(LM.LedgerID,0) AS LedgerID, NULLIF(LM.LedgerName,'') AS LedgerName FROM Ledgermaster as LM inner join LedgerGroupMaster  AS LGM ON LM.LedgerGroupID = LGM.LedgerGroupID WHERE ISNULL(LM.IsDeletedTransaction,0)=0 AND LM.CompanyID=" & GBLCompanyID & "  AND LGM.LedgerGroupNameID=27 ORDER BY LedgerName"
            End If

            db.FillDataTable(dataTable, str)
            data.Message = ConvertDataTableTojSonString(dataTable)
            Return js.Serialize(data.Message)
        Catch ex As Exception
            Return ex.Message
        End Try
    End Function

    ' End Anshu Code '

    Public Class HelloWorldData
        Public Message As [String]
    End Class

End Class