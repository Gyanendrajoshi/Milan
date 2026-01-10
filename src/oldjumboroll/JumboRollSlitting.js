"use strict";
let validateUserData = { moduleName: "", userName: "", password: "", actionType: "Delete", RecordID: 0, transactionRemark: "", isUserInfoFilled: false, documentNo: "" };
var Row_No = -1;
var ItemID = 0;
var WarehouseID = 0;
var ParentTransactionID = 0;
var BatchID = 0;
var Unit = '';
var ItemGroupID = 0;
var ObjData = [];
var SelectShowListDataOBJ = [];
var JumboRollSlittingTransactionID = 0;
var SizeWUNiversal = 0;
var StockQtyUNiversal = 0;
var suppressNoOfRollsChange = false;
let maxMTR = 0;
let maxKG = 0;
let maxWaste = 0;
let maxRolls = 0;
let maxConKG = 0;
let maxConMTR = 0;
let parentStockUnit = 0;

$("#DtDate").dxDateBox({
    pickerType: "calendar",
    disabled: true,
    value: new Date().toISOString().substr(0, 10),
    displayFormat: "dd-MMM-yyyy"
});

$("#SelWarehouse").dxSelectBox({
    items: [],
    placeholder: "Select Warehouse",
    displayExpr: 'Warehouse',
    valueExpr: 'Warehouse',
    searchEnabled: true,
    showClearButton: true,
    onValueChanged: function (data) {
        RefreshBins(data.value);
    }
});

$("#SelBin").dxSelectBox({
    items: [],
    placeholder: "Select Bin",
    displayExpr: 'Bin',
    valueExpr: 'WarehouseID',
    searchEnabled: true,
    showClearButton: true
});
$("#SelMachine").dxSelectBox({
    items: [],
    placeholder: "Select Machine",
    displayExpr: 'MachineName',
    valueExpr: 'MachineID',
    searchEnabled: true,
    showClearButton: true
});

// Operator Dropdown
$("#SelOperator").dxSelectBox({
    items: [],
    placeholder: "Select Operator",
    displayExpr: 'LedgerName',  // ✅ Correct field name
    valueExpr: 'LedgerID',       // ✅ Correct field name
    searchEnabled: true,
    showClearButton: true
});


$("#DtStartTime").dxDateBox({
    pickerType: "calendar",
    value: new Date(),
    type: "datetime",
    value: new Date(),
    displayFormat: "dd-MMM-yyyy HH:mm",
    showClearButton: true,
     useMaskBehavior: true
});



$("#DtEndTime").dxDateBox({
    pickerType: "calendar",
    value: new Date(),
    type: "datetime",
    value: new Date(),
    displayFormat: "dd-MMM-yyyy HH:mm",
    showClearButton: true,
      useMaskBehavior: true
});

try {
    $.ajax({
        type: "POST",
        url: "WebServiceJumboRollSlitting.asmx/GenerateVoucherNo",
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (results) {
            document.getElementById("TxtVoucherNo").value = results.d;
        }
    });

    $.ajax({
        type: "POST",
        url: "WebServiceJumboRollSlitting.asmx/GetWarehouseList",
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        success: function (results) {
            var res = results.replace(/\\/g, '');
            res = res.replace(/"d":""/g, '');
            res = res.replace(/""/g, '');
            res = res.replace(/u0026/g, '&');
            res = res.substr(1);
            res = res.slice(0, -1);
            var warehouse = JSON.parse(res);

            $("#SelWarehouse").dxSelectBox({
                items: warehouse
            });
        }
    });
} catch (e) {
    alert(e);
}

try {
    $.ajax({
        type: "POST",
        url: "WebServiceJumboRollSlitting.asmx/GetMachineList",
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        success: function (results) {
            var res = results.replace(/\\/g, '');
            res = res.replace(/"d":""/g, '');
            res = res.replace(/""/g, '');
            res = res.replace(/u0026/g, '&');
            res = res.substr(1);
            res = res.slice(0, -1);
            var machines = JSON.parse(res);

            $("#SelMachine").dxSelectBox({
                items: machines
            });
        },
        error: function (err) {
            console.log("Error loading machines:", err);
        }
    });
} catch (e) {
    console.log(e);
}

// Load Operator List
try {
    $.ajax({
        type: "POST",
        url: "WebServiceJumboRollSlitting.asmx/GetOperatorList",
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "text",
        success: function (results) {
            var res = results.replace(/\\/g, '');
            res = res.replace(/"d":""/g, '');
            res = res.replace(/""/g, '');
            res = res.replace(/u0026/g, '&');
            res = res.substr(1);
            res = res.slice(0, -1);
            var operators = JSON.parse(res);

            $("#SelOperator").dxSelectBox({
                items: operators
            });
        },
        error: function (err) {
            console.log("Error loading operators:", err);
        }
    });
} catch (e) {
    console.log(e);
}

function RefreshBins(value) {
    try {
        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/GetBinsList",
            data: '{warehousename:' + JSON.stringify(value) + '}',
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (results) {
                var res = results.replace(/\\/g, '');
                res = res.replace(/"d":""/g, '');
                res = res.replace(/""/g, '');
                res = res.replace(/u0026/g, '&');
                res = res.substr(1);
                res = res.slice(0, -1);
                var bins = JSON.parse(res);
                $("#SelBin").dxSelectBox({
                    items: bins
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

RefreshRollStock();

function RefreshRollStock() {
    try {
        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/GetRollStockList",
            data: '{}',
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (results) {
                var res = results.replace(/\\/g, '');
                res = res.replace(/"d":""/g, '');
                res = res.replace(/""/g, '');
                res = res.replace(/u0026/g, '&');
                res = res.substr(1);
                res = res.slice(0, -1);
                var RES1 = JSON.parse(res);
                $("#GridRollStock").dxDataGrid({
                    dataSource: RES1,
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

//RefreshRollMaster();

function RefreshRollMaster(ItemCode) {
    if (ItemCode === undefined || ItemCode === null) ItemCode = "";
    try {
        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/GetRollMasterList",
            data: '{ItemCode :' + JSON.stringify(ItemCode) + '}',
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (results) {
                var res = results.replace(/\\/g, '');
                res = res.replace(/"d":""/g, '');
                res = res.replace(/""/g, '');
                res = res.replace(/u0026/g, '&');
                res = res.substr(1);
                res = res.slice(0, -1);
                var RES1 = JSON.parse(res);
                $("#GridRollMaster").dxDataGrid({
                    dataSource: RES1,
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

$("#GridRollStockNew").dxDataGrid({
    dataSource: [],
    allowColumnReordering: true,
    allowColumnResizing: true,
    showBorders: true,
    showRowLines: true,
    columnResizingMode: "widget",
    sorting: { mode: "none" },
    editing: { mode: 'cell', allowDeleting: true, allowUpdating: true },
    scrolling: { mode: 'infinite' },
    rowAlternationEnabled: false,

    columns: [
        { dataField: "ItemID", visible: false, caption: "Item ID", width: 20 },
        { dataField: "ItemGroupID", visible: false, caption: "Item Group ID", width: 20 },
        { dataField: "ItemCode", caption: "Item Code", width: 120, allowEditing: false },
        { dataField: "ItemName", caption: "Item Name", width: 600, allowEditing: false },
        {
            dataField: "ItemWidth", caption: "Width", width: 120, allowEditing: false,
            summary: { totalItems: [{ column: "ItemWidth", summaryType: "sum", displayFormat: "Total: {0}" }] }
        },
        { dataField: "GSMFace", visible: false, caption: "GSM Face", width: 120 },
        { dataField: "GSMRelease", visible: false, caption: "GSM Release", width: 100 },
        { dataField: "GSMAdhesive", visible: false, caption: "GSM Adhesive", width: 100 },
        { dataField: "Qty", caption: "Qty(Mtr)", width: 100, allowEditing: false },
        { dataField: "Qty1", caption: "Qty(KG)", width: 100, alignment: "left", allowEditing: false },
        { dataField: "StockUnit", caption: "Unit", width: 100, allowEditing: false },
        {
            dataField: "NoOfRolls",
            caption: "NoOfRolls",
            width: 100,
            allowEditing: false,
            summary: { totalItems: [{ column: "NoOfRolls", summaryType: "sum", displayFormat: "Total: {0}" }] }
        },
        { dataField: "Qty", caption: "Total Qty (Mtr)", width: 100, allowEditing: false },
        { dataField: "Qty1", caption: "Total Qty (KG)", width: 100, alignment: "left", allowEditing: false },
        {
            dataField: "BatchNo",
            caption: "Batch No",
            width: 100,
            allowEditing: false
        }
    ],
    height: () => window.innerHeight / 4.5,

    onContentReady: function (e) {
        const grid = e.component;
        const rows = grid.getVisibleRows().map(r => r.data);

        let totalQty = 0, totalQty1 = 0, totalNoRolls = 0;
        let totalWasteMTR = 0, totalWasteKG = 0;
        let maxConMTR = 0, maxConKG = 0, maxWaste = 0;
        const StockQtyUNiversal = Number($("#TxtStockQtyUniversal").val()) || 0;
        const ObjData = window.ObjData || {};

        rows.forEach(row => {
            if (row.Qty && row.NoOfRolls) {
                const qty = Number(row.Qty) || 0;
                const qty1 = Number(row.Qty1) || 0;
                const rolls = Number(row.NoOfRolls) || 0;

                if (qty > totalQty) totalQty = qty;
                totalQty1 += qty1;
                totalNoRolls += rolls;
            }
        });

        const UniversalSize = Number($("#TxtRollStock").val()) || 0;

        rows.forEach(row => {
            const rowWidth = Number(row.ItemWidth) || 0;
            const GSM = Number(ObjData.TotalGSM || 0);
            const NoOfRolls = Number(row.NoOfRolls) || 0;
            const Qty = Number(row.Qty) || 0;

            let rowWaste = 0;
            if (UniversalSize > 0 && NoOfRolls > 0) {
                rowWaste = (UniversalSize * NoOfRolls) - Qty;
                if (rowWaste < 0) rowWaste = 0;
            }

            totalWasteMTR += rowWaste;
            totalWasteKG += ((rowWaste * (rowWidth / 1000)) * GSM) / 1000;
        });

        $("#TxtRollStockCon, #TxtRollStockConinKG, #TxtRollStockWast, #TxtRollStockWastinKG").prop("readonly", false);

        $("#TxtRollStockCon").val(totalQty.toFixed(2));
        $("#TxtRollStockConinKG").val(totalQty1.toFixed(2));

        maxConMTR = totalQty;
        maxConKG = totalQty1;
        maxWaste = StockQtyUNiversal - totalQty;

        $("#TxtRollStockWast").off("blur");
        $("#TxtRollStockWastinKG").off("blur");

        $("#TxtRollStockWast").on("blur", function () {
            const wasteMTR = parseFloat(this.value) || 0;
            const GSM = Number(ObjData.TotalGSM || 0);
            const Width = Number(ObjData.SizeW || ObjData.ItemWidth || 0);
            const wasteKG = ((wasteMTR * (Width / 1000)) * GSM) / 1000;
            $("#TxtRollStockWastinKG").val(wasteKG.toFixed(2));

            //if ((totalQty + wasteMTR) > StockQtyUNiversal) {
            //    showDevExpressNotification(`Entered waste (${wasteMTR.toFixed(2)} MTR) exceeds available stock!`, "warning");
            //    $("#TxtRollStockWast").val("");
            //    $("#TxtRollStockWastinKG").val("");
            //}
        });

        $("#TxtRollStockWastinKG").on("blur", function () {
            const wasteKG = parseFloat(this.value) || 0;
            const GSM = Number(ObjData.TotalGSM || 0);
            const Width = Number(ObjData.SizeW || ObjData.ItemWidth || 0);
            let wasteMTR = 0;
            if (GSM > 0 && Width > 0) {
                wasteMTR = (wasteKG * 1000) / (GSM * (Width / 1000));
                $("#TxtRollStockWast").val(wasteMTR.toFixed(2));
            }

            if ((totalQty + wasteMTR) > StockQtyUNiversal) {
                showDevExpressNotification(`Entered waste (${wasteMTR.toFixed(2)} MTR) exceeds available stock!`, "warning");
                $("#TxtRollStockWast").val("");
                $("#TxtRollStockWastinKG").val("");
            }
        });

        if (rows.length > 0) {
            console.log(
                "Total Waste (MTR):", totalWasteMTR.toFixed(2),
                "Waste (KG):", totalWasteKG.toFixed(2)
            );
        }
    }
});

function resetCell(grid, e) {
    suppressNoOfRollsChange = true;
    grid.cellValue(e.row.rowIndex, "NoOfRolls", null);
    grid.cellValue(e.row.rowIndex, "TotalQty", null);
    suppressNoOfRollsChange = false;
}


$("#GridRollMaster").dxDataGrid({
    dataSource: [],
    allowColumnReordering: true,
    allowColumnResizing: true,
    showBorders: true,
    showRowLines: true,
    filterRow: { visible: true, applyFilter: "auto" },
    columnResizingMode: "widget",
    sorting: {
        mode: "none"
    },
    selection: { mode: 'single' },
    columns:
        [{ dataField: "ItemID", visible: false, caption: "Item ID", width: 20 },
        { dataField: "ItemGroupID", visible: false, caption: "Item Group ID", width: 20 },
        { dataField: "ItemCode", caption: "Item Code", width: 120 },
        { dataField: "ItemName", caption: "Item Name", width: 1000 },
        { dataField: "ItemGroupName", caption: "Item Group", width: 250 },
        { dataField: "SizeW", caption: "Width", width: 130 },
        { dataField: "GSM", visible: false, caption: "GSM Face", width: 130 },
        { dataField: "GSMRelease", visible: false, caption: "GSM Release", width: 120 },
        { dataField: "GSMAdhesive", visible: false, caption: "GSM Adhesive", width: 120 },
        { dataField: "StockUnit", visible: true, caption: "Unit", width: 120 },
        ],

    height: 180, 
    onRowPrepared: function (e) {
        if (e.rowType === "header") {
            e.rowElement.css('background', '#509EBC');
            e.rowElement.css('color', 'white');
            e.rowElement.css('font-weight', 'bold');
        }
    },

    onSelectionChanged: function (data) {
        ObjData = [];
        if (data.selectedRowsData.length > 0) {
            ObjData = data.selectedRowsData[0];
            let GSM = ObjData.TotalGSM;
            let SizeW = ObjData.SizeW;
            let OrignalStockQtyMTR = parseFloat($("#TxtRollStock").val()) || 0;
            let inKG = ((OrignalStockQtyMTR * (SizeW / 1000)) * GSM) / 1000;
            let Rolls = Math.floor(SizeWUNiversal / SizeW);
            $("#QtyinMTR").val(OrignalStockQtyMTR.toFixed(2));
            $("#QtyinKG").val(inKG.toFixed(2));
            $("#NoOfRolls").val(Rolls.toFixed(2));
            $("#QtyinMTR, #QtyinKG, #NoOfRolls").prop("readonly", false);
            maxMTR = OrignalStockQtyMTR;
            maxKG = inKG;
            maxRolls = Rolls;
        }
    }
});

$("#GridRollStock").dxDataGrid({
    dataSource: [],
    allowColumnReordering: true,
    allowColumnResizing: true,
    showBorders: true,
    showRowLines: true,
    selection: { mode: 'single' },
    filterRow: { visible: true, applyFilter: "auto" },
    columnResizingMode: "widget",
    sorting: {
        mode: "none"
    },
    columns:
        [{ dataField: "ItemID", visible: false, caption: "Item ID", width: 20 },
        { dataField: "ItemGroupID", visible: false, caption: "Item Group ID", width: 20 },
        { dataField: "ItemGroupName", visible: false, caption: "Item Group Name", width: 20 },
        { dataField: "ParentTransactionID", visible: false, caption: "ParentTransactionID", width: 120 },
        { dataField: "WarehouseID", visible: false, caption: "Warehouse", width: 100 },
        { dataField: "ItemCode", caption: "Item Code", width: 80 },
        { dataField: "ItemName", caption: "Item Name", width: 400 },
        { dataField: "GSM", caption: "GSM", width: 400, visible: false },
        { dataField: "SizeW", caption: "Width", width: 400, visible: false },
        { dataField: "StockUnit", caption: "Stock Unit", width: 50 },
        { dataField: "BatchStock", caption: "Stock", width: 80 },
        { dataField: "IssueQuantity", visible: false, caption: "Issue Qty", width: 300 },
        { dataField: "GRNNo", caption: "GRN No", width: 100 },
        { dataField: "BatchID", visible: false, caption: "Batch ID", width: 300 },
        { dataField: "BatchNo", caption: "Batch No", width: 100 },
        { dataField: "SupplierBatchNo", caption: "Supp.Batch No", width: 100 },
        { dataField: "Warehouse", caption: "Warehouse", width: 120 },
        { dataField: "Bin", caption: "Bin", width: 120 },
        { dataField: "WtPerPacking", visible: false, caption: "Wt/Packing", width: 300 },
        { dataField: "UnitPerPacking", visible: false, caption: "Unit/Packing", width: 300 },
        ],
    height: function () {
        return window.innerHeight / 1.25;
    },
    onRowPrepared: function (e) {
        if (e.rowType === "header") {
            e.rowElement.css('background', '#509EBC');
            e.rowElement.css('color', 'white');
            e.rowElement.css('font-weight', 'bold');
        }
    },
    export: {
        enabled: true,
        fileName: "RollStock",
        allowExportSelectedData: true
    },
    onExporting(e) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("RollStock");

        DevExpress.excelExporter.exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'RollStock.xlsx');
            });
        });
        e.cancel = true;
    },
    onSelectionChanged: function (data) {
        ObjData = [];
        if (data.selectedRowsData.length > 0) {
            ObjData = data.selectedRowsData[0];
            console.log(ObjData);
        }
    }

});

$("#BtnRollMaster").click(function () {
    if (ItemID <= 0) {
        return false;
    }
    else {
        document.getElementById("BtnRollMaster").setAttribute("data-target", "#modalRollMaster");
    }

    //if (document.getElementById("TxtRollStockCon").value <= 0) {
    //    //DevExpress.ui.notify("Pleaes enter correct Consumption quantity...?", "warning", 2500);
    //    showDevExpressNotification("Pleaes enter correct Consumption quantity...?", "warning");
    //    document.getElementById("TxtRollStockCon").focus();
    //    return false;
    //}

    if (Number(document.getElementById("TxtRollStock").value) < Number(document.getElementById("TxtRollStockCon").value)) {
        //DevExpress.ui.notify("Consumption quantity should not be more than stock quantity...?", "warning", 2500);
        showDevExpressNotification("Consumption quantity should not be more than stock quantity...?", "warning");
        document.getElementById("TxtRollStockCon").focus();
        return false;
    }

});

$("#BtnSave").click(function () {

    if (ItemID <= 0) {
        //DevExpress.ui.notify("Please select roll for slitting.....?", "warning", 2500);
        showDevExpressNotification("Please select roll for slitting.....?", "warning");
        document.getElementById("BtnRollStock").focus();
        return
    }
    if (isCurrentFinancialYear("") == false) {
        swal("Warning", "The selected jumboRollSlitting   cannot be Save  in the logged-in financial year.", "warning");
        return false;
    }
    if (document.getElementById("TxtRollStockCon").value <= 0) {
        //DevExpress.ui.notify("Pleaes enter correct Consumption quantity...?", "warning", 2500);
        showDevExpressNotification("Pleaes enter correct Consumption quantity...?", "warning");
        document.getElementById("TxtRollStockCon").focus();
        return
    }

    //let rollStockConKG = Number(document.getElementById("TxtRollStockConinKG").value) || 0;
    //let rollStockWastKG = Number(document.getElementById("TxtRollStockWastinKG").value) || 0;
    //let rollStockKG = Number(document.getElementById("TxtRollStockinKG").value) || 0;

    //if ((rollStockConKG + rollStockWastKG) < rollStockKG) {
    //    //DevExpress.ui.notify("Consumption quantity should not be more than stock quantity...?", "warning", 2500);
    //    showDevExpressNotification("Consumption quantity in KG should be equal to stock quantity...?", "warning");
    //    document.getElementById("TxtRollStockCon").focus();
    //    //return
    //}

    var dataGrid = $("#GridRollStockNew").dxDataGrid('instance');

    if (dataGrid._options.dataSource.length <= 0) {
        //DevExpress.ui.notify("Please select roll master.....?", "warning", 2500);
        showDevExpressNotification("Please select roll master.....?", "warning");
        document.getElementById("BtnRollMaster").focus();
        return
    }

    for (var i = 0; i <= dataGrid._options.dataSource.length - 1; i++) {
        if ((dataGrid._options.dataSource[i].NoOfRolls == undefined || dataGrid._options.dataSource[i].NoOfRolls <= 0) && (dataGrid._options.dataSource[i].TotalQty == undefined || dataGrid._options.dataSource[i].TotalQty <= 0)) {
            //DevExpress.ui.notify("Please enter details in roll list....?", "warning", 2500);
            showDevExpressNotification("Please enter details in roll list....?", "warning");
            return
        }
    }

    if ($('#SelBin').dxSelectBox('instance').option('value') == "" || $('#SelBin').dxSelectBox('instance').option('value') == undefined || $('#SelBin').dxSelectBox('instance').option('value') == -1) {
        //DevExpress.ui.notify(" Please select bin name! ", "warning", 2500);
        showDevExpressNotification("Please select bin name!", "warning");
        return;
    }
    var totalWidth = dataGrid.getVisibleRows().reduce((sum, r) => sum + (Number(r.data.ItemWidth) || 0), 0);

    if (SizeWUNiversal > totalWidth) {
        showDevExpressNotification("Please consume Full Roll!", "warning");
        //return;
    }
    var selectedMachine = $('#SelMachine').dxSelectBox('instance').option('value');
    if (!selectedMachine || selectedMachine <= 0) {
        showDevExpressNotification("Please select Machine Name!", "warning");
        return;
    }

    var selectedOperator = $('#SelOperator').dxSelectBox('instance').option('value');
    if (!selectedOperator || selectedOperator <= 0) {
        showDevExpressNotification("Please select Operator Name!", "warning");
        return;
    }

    var startTime = $('#DtStartTime').dxDateBox('instance').option('value');
    if (!startTime) {
        showDevExpressNotification("Please select Start Time!", "warning");
        return;
    }

    var endTime = $('#DtEndTime').dxDateBox('instance').option('value');
    if (!endTime) {
        showDevExpressNotification("Please select End Time!", "warning");
        return;
    }

    // Validate end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
        showDevExpressNotification("End Time must be after Start Time!", "warning");
        return;
    }
    swal({
        title: "Are you sure?",
        text: 'Do you want to save data!',
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, Save it!",
        closeOnConfirm: false
    }, function () {

        var DtDate = $('#DtDate').dxDateBox('instance').option('value');
        var warehouseidN = $("#SelBin").dxSelectBox("instance").option('value');
        var MachineID = $('#SelMachine').dxSelectBox('instance').option('value');
        var OperatorID = $('#SelOperator').dxSelectBox('instance').option('value');

        var StartDateTime = $('#DtStartTime').dxDateBox('instance').option('value');
    
        var EndDateTime = $('#DtEndTime').dxDateBox('instance').option('value');
   
        var TxtRemark = $("#TxtRemark").val().trim();
        var BatchNo = $("#TxtBatchNo").val();

        let unit = (parentStockUnit || "").toLowerCase();
        let ConQty, ConQty1, wasQty, wasQty1;

        if (unit === "kg") {
            ConQty = Number($("#TxtRollStockConinKG").val()) || 0;
            wasQty = Number($("#TxtRollStockWastinKG").val()) || 0;
            ConQty1 = ConQty;
            wasQty1 = wasQty;
        } else {
            ConQty = Number($("#TxtRollStockCon").val()) || 0;
            wasQty = Number($("#TxtRollStockWast").val()) || 0;
            ConQty1 = ConQty;
            wasQty1 = wasQty;
        }

        var ObjSaveRollMain1 = [], SaveRollMain1 = {};
        var ObjSaveRollDetail1 = [], SaveRollDetail1 = {};
        var prefix = 'JRS';

        // Item Transaction Main
        SaveRollMain1.VoucherID = -120;
        SaveRollMain1.VoucherDate = DtDate;
        SaveRollMain1.Narration = TxtRemark;
        SaveRollMain1.MachineID = MachineID;        
        SaveRollMain1.OperatorID = OperatorID;     
        SaveRollMain1.StartDateTime = StartDateTime;
        SaveRollMain1.EndDateTime = EndDateTime;
        SaveRollMain1.TotalQuantity = Number(Number(ConQty));
        ObjSaveRollMain1.push(SaveRollMain1);

        // Item Transaction Detail
        SaveRollDetail1.ParentTransactionID = ParentTransactionID;
        SaveRollDetail1.TransID = 1;
        SaveRollDetail1.ItemGroupID = ItemGroupID;
        SaveRollDetail1.ItemID = ItemID;
        SaveRollDetail1.StockUnit = Unit;
        SaveRollDetail1.WarehouseID = WarehouseID;
        //SaveRollDetail1.IssueQuantity = Number(Number(ConQty) + Number(wasQty));
        SaveRollDetail1.IssueQuantity = Number(Number(ConQty));
        SaveRollDetail1.RejectedQuantity = wasQty;
        SaveRollDetail1.BatchNo = BatchNo;
        SaveRollDetail1.BatchID = BatchID;

        ObjSaveRollDetail1.push(SaveRollDetail1);

        //END/// For Consumption Data Entry //

        //Start/// For Receipt Data Entry For New Stock // 
        var ObjSaveRollMain2 = [], SaveRollMain2 = {};
        var ObjSaveRollDetail2 = [], SaveRollDetail2 = {};

        // Item Transaction Main
        SaveRollMain2.VoucherID = -120;
        
        SaveRollMain2.StartDateTime = StartDateTime;    
        SaveRollMain2.Narration = TxtRemark;
        SaveRollMain2.VoucherDate = DtDate;
        SaveRollMain2.TotalQuantity = ConQty;
        ObjSaveRollMain2.push(SaveRollMain2);

        // Item Transaction Detail
        var k = 0;
        for (var i = 0; i <= dataGrid._options.dataSource.length - 1; i++) {
            for (var j = 1; j <= dataGrid._options.dataSource[i].NoOfRolls; j++) {
                k = k + 1;
                SaveRollDetail2 = {};
                SaveRollDetail2.TransID = k + 1;
                SaveRollDetail2.ItemGroupID = dataGrid._options.dataSource[i].ItemGroupID;
                SaveRollDetail2.ItemID = dataGrid._options.dataSource[i].ItemID;
                SaveRollDetail2.StockUnit = dataGrid._options.dataSource[i].StockUnit;
                SaveRollDetail2.WarehouseID = warehouseidN;
                let innerUnit = (dataGrid._options.dataSource[i].StockUnit || "").toLowerCase();
                if (innerUnit === "kg") {
                    SaveRollDetail2.ReceiptQuantity = Number(dataGrid._options.dataSource[i].Qty1) || 0;
                } else {
                    SaveRollDetail2.ReceiptQuantity = Number(dataGrid._options.dataSource[i].Qty) || 0;
                }
                SaveRollDetail2.BatchNo = dataGrid._options.dataSource[i].BatchNo;
                ObjSaveRollDetail2.push(SaveRollDetail2);
            }
        }
        //END/// For Receipt Data Entry //

        var jsonObjectsMain1 = JSON.stringify(ObjSaveRollMain1);
        var jsonObjectsDetail1 = JSON.stringify(ObjSaveRollDetail1);

        var jsonObjectsMain2 = JSON.stringify(ObjSaveRollMain2);
        var jsonObjectsDetail2 = JSON.stringify(ObjSaveRollDetail2);

        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/SaveData",
            data: '{prefix:' + JSON.stringify(prefix) + ',jsonObjectsRecordMain:' + jsonObjectsMain2 + ',jsonObjectsRecordDetail:' + jsonObjectsDetail2 + ',ObjectsConsumeMain:' + jsonObjectsMain1 + ',ObjectsConsumeDetails:' + jsonObjectsDetail1 + '}',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (results) {
                var res = JSON.stringify(results);
                res = res.replace(/"d":/g, '');
                res = res.replace(/u0026/g, ' & ');
                res = res.replace(/{/g, '');
                res = res.replace(/}/g, '');
                res = res.substr(1);
                res = res.slice(0, -1);

                $("#LoadIndicator").dxLoadPanel("instance").option("visible", false);

                if (res === "Success") {
                    swal({
                        title: "Saved!",
                        text: "Your data has been Saved successfully.",
                        type: "success"
                    }, function (isConfirm) {
                        location.reload();
                    });
                } else if (res.includes("Error:")) {
                    swal("Error..!", res, "error");
                }
            },
            error: function errorFunc(jqXHR) {
                $("#LoadIndicator").dxLoadPanel("instance").option("visible", false);
                swal("Error!", "Please try after some time..", "");
                console.log(jqXHR);
            }
        });
    });

});


$("#BtnApply").click(function () {
    document.getElementById("BtnApply").setAttribute("data-dismiss", "modal");

    let grid = $("#GridRollStockNew").dxDataGrid("instance");

    if (grid && grid.option("dataSource").length > 0) {
        grid.option("dataSource", []);
        //grid.refresh();
    }
    $("#TxtRollStockCon").val("");
    $("#TxtRollStockConinKG").val("");

    ItemID = ObjData.ItemID;
    ItemGroupID = ObjData.ItemGroupID;
    WarehouseID = ObjData.WarehouseID;
    ParentTransactionID = ObjData.ParentTransactionID;
    BatchID = ObjData.BatchID;
    Unit = ObjData.StockUnit;
    parentStockUnit = ObjData.StockUnit;
    let ItemCode = ObjData.ItemCode;
    RefreshRollMaster(ItemCode);
    let ItemGroup = ObjData.ItemGroupName;
    let GSM = ObjData.GSM;
    let SizeW = ObjData.SizeW;
    SizeWUNiversal = Number(ObjData.SizeW) || 0;
    let Length = ObjData.BatchStock;
    let StockUnit = ObjData.StockUnit1;
    let Thickness = ObjData.Thickness;
    let Density = ObjData.Density;


    if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'MTR' || StockUnit === 'Meter')) {
        let inKG = ((Length * (SizeW / 1000)) * GSM) / 1000
        document.getElementById("TxtRollStock").value = parseFloat(ObjData.BatchStock).toFixed(2);
        document.getElementById("TxtRollStockinKG").value = parseFloat(inKG).toFixed(2);
    }
    else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'KG' || StockUnit === 'KGS')) {
        let inMTR = ((Length * 1000) / ((SizeW / 1000) * GSM))
        document.getElementById("TxtRollStock").value = parseFloat(inMTR).toFixed(2);
        document.getElementById("TxtRollStockinKG").value = parseFloat(ObjData.BatchStock).toFixed(2);
    }
    else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'Square MTR' || StockUnit === 'SQM')) {
        let inKG = (Length * GSM) / 1000
        document.getElementById("TxtRollStock").value = parseFloat(ObjData.BatchStock).toFixed(2);
        document.getElementById("TxtRollStockinKG").value = parseFloat(inKG).toFixed(2);
    }
    else if ((ItemGroup === 'LAMINATION FILM') && (StockUnit === 'Kg' || StockUnit === 'KGS')) {

        let LFinMTR = Length / ((Thickness / 1000000) * (SizeW / 1000) * (Density * 1000))

        document.getElementById("TxtRollStock").value = parseFloat(LFinMTR).toFixed(2);
        document.getElementById("TxtRollStockinKG").value = parseFloat(ObjData.BatchStock).toFixed(2);
    }

    document.getElementById("TxtRollStockCon").addEventListener("blur", function () {
        let ConQty = parseFloat(this.value) || 0;

        if (ConQty > maxConMTR) {
            this.value = "";
            document.getElementById("TxtRollStockConinKG").value = "";
            document.getElementById("TxtRollStockCon").value = "";
            showDevExpressNotification(`Max Consumption quantity is ${maxConMTR}`, "warning");
            return;
        }

        let maxStock = parseFloat(document.getElementById("TxtRollStock").value) || 0;

        if (ConQty > maxStock) {
            this.value = "";
            document.getElementById("TxtRollStockConinKG").value = "";
            return;
        }

        let grid = $("#GridRollStockNew").dxDataGrid("instance");
        let totalWidth = 0;
        if (grid) {
            let data = grid.option("dataSource") || [];
            totalWidth = data.reduce((sum, row) => sum + (parseFloat(row.ItemWidth) || 0), 0);
        }
        let SizeW = totalWidth || 0;

        if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'MTR' || StockUnit === 'Meter')) {
            let ConinKG = ((ConQty * (SizeW / 1000)) * GSM) / 1000;
            document.getElementById("TxtRollStockConinKG").value = parseFloat(ConinKG).toFixed(2);
        }
        else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'KG' || StockUnit === 'KGS')) {
            let ConinKG = ((ConQty * (SizeW / 1000)) * GSM) / 1000;
            document.getElementById("TxtRollStockConinKG").value = parseFloat(ConinKG).toFixed(2);
        }
        else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'Square MTR' || StockUnit === 'SQM')) {
            let inKG = (ConQty * GSM) / 1000
            document.getElementById("TxtRollStockConinKG").value = parseFloat(inKG).toFixed(2);
        }
        else if ((ItemGroup === 'LAMINATION FILM') && (StockUnit === 'Kg' || StockUnit === 'KGS')) {

            let LFinKG = ConQty * ((Thickness / 1000000) * (SizeW / 1000) * (Density * 1000))

            document.getElementById("TxtRollStockConinKG").value = parseFloat(LFinKG).toFixed(2);
        }
    });

    document.getElementById("TxtRollStockConinKG").addEventListener("blur", function () {
        let ConQty = parseFloat(this.value) || 0;
        if (ConQty > maxConKG) {
            this.value = "";
            document.getElementById("TxtRollStockConinKG").value = "";
            document.getElementById("TxtRollStockCon").value = "";
            showDevExpressNotification(`Max Consumption quantity is ${maxConKG}`, "warning");
            return;
        }
        let maxStockKG = parseFloat(document.getElementById("TxtRollStockinKG").value) || 0;
        if (ConQty > maxStockKG) {
            this.value = "";
            document.getElementById("TxtRollStockCon").value = "";
            return;
        }
        let grid = $("#GridRollStockNew").dxDataGrid("instance");
        let totalWidth = 0;
        if (grid) {
            let data = grid.option("dataSource") || [];
            totalWidth = data.reduce((sum, row) => sum + (parseFloat(row.ItemWidth) || 0), 0);
        }
        let SizeW = totalWidth || 0;

        if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'MTR' || StockUnit === 'Meter')) {
            let ConinMTR = (ConQty * 1000) / ((SizeW / 1000) * GSM);
            document.getElementById("TxtRollStockCon").value = parseFloat(ConinMTR).toFixed(2);
        }
        else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'KG' || StockUnit === 'KGS')) {
            let ConinMTR = (ConQty * 1000) / ((SizeW / 1000) * GSM);
            document.getElementById("TxtRollStockCon").value = parseFloat(ConinMTR).toFixed(2);
        }
        else if ((ItemGroup === 'ROLL' || ItemGroup === 'REEL') && (StockUnit === 'Square MTR' || StockUnit === 'SQM')) {
            let inSQM = (ConQty * 1000) / GSM
            document.getElementById("TxtRollStockCon").value = parseFloat(inSQM).toFixed(2);
        }
        else if ((ItemGroup === 'LAMINATION FILM') && (StockUnit === 'Kg' || StockUnit === 'KGS')) {

            let LFinMTR = ConQty / ((Thickness / 1000000) * (SizeW / 1000) * (Density * 1000))

            document.getElementById("TxtRollStockCon").value = parseFloat(LFinMTR).toFixed(2);
        }
    });


    let Val = document.getElementById("TxtRollStock").value;
    StockQtyUNiversal = Number(Val) || 0;

    document.getElementById("TxtRollCode").value = ObjData.ItemCode;
    document.getElementById("TxtRollName").value = ObjData.ItemName;
    //document.getElementById("TxtRollStock").value = ObjData.BatchStock;
    document.getElementById("TxtBatchNo").value = ObjData.BatchNo;
    document.getElementById("TxtWarehouseName").value = ObjData.Warehouse;
    document.getElementById("TxtBinName").value = ObjData.Bin;

});

ItemID = ObjData.ItemID;
ItemGroupID = ObjData.ItemGroupID;
WarehouseID = ObjData.WarehouseID;
ParentTransactionID = ObjData.ParentTransactionID;
BatchID = ObjData.BatchID;
Unit = ObjData.StockUnit;

let ItemCode = ObjData.ItemCode;
RefreshRollMaster(ItemCode);

let ItemGroup = ObjData.ItemGroupName;
let GSM = ObjData.GSM;
let SizeW = ObjData.SizeW;
SizeWUNiversal = Number(ObjData.SizeW) || 0;
let Length = ObjData.BatchStock;
let StockUnit = ObjData.StockUnit1;
let Thickness = ObjData.Thickness;
let Density = ObjData.Density;

//// ---------- STOCK DISPLAY ----------
//if (["ROLL", "REEL"].includes(ItemGroup)) {
//    if (["MTR", "Meter"].includes(StockUnit)) {
//        let inKG = ((Length * (SizeW / 1000)) * GSM) / 1000;
//        $("#TxtRollStock").val(Length.toFixed(2));
//        $("#TxtRollStockinKG").val(inKG.toFixed(2));
//    }
//    else if (["KG", "KGS"].includes(StockUnit)) {
//        let inMTR = ((Length * 1000) / ((SizeW / 1000) * GSM));
//        $("#TxtRollStock").val(inMTR.toFixed(2));
//        $("#TxtRollStockinKG").val(Length.toFixed(2));
//    }
//    else if (["Square MTR", "SQM"].includes(StockUnit)) {
//        let inKG = (Length * GSM) / 1000;
//        $("#TxtRollStock").val(Length.toFixed(2));
//        $("#TxtRollStockinKG").val(inKG.toFixed(2));
//    }
//}
//else if (ItemGroup === "LAMINATION FILM" && ["Kg", "KGS"].includes(StockUnit)) {
//    let LFinMTR = Length / ((Thickness / 1000000) * (SizeW / 1000) * (Density * 1000));
//    $("#TxtRollStock").val(LFinMTR.toFixed(2));
//    $("#TxtRollStockinKG").val(Length.toFixed(2));
//}

// ---------- CONVERSION (MTR → KG) ----------

// ---- Validate Manual Waste Entry ----
$("#TxtRollStockWast").on("blur", function () {
    let entered = parseFloat(this.value) || 0;
    if (entered > maxWaste) {
        this.value = "";
        Swal.fire({
            icon: "warning",
            title: "Invalid Waste Quantity",
            text: "Entered waste cannot exceed calculated waste (" + maxWaste.toFixed(2) + ").",
            confirmButtonText: "OK"
        });
    }
});
$("#NoOfRolls").on("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
});

$("#NoOfRolls").on("blur", function () {
    let entered = parseFloat(this.value) || 0;
    if (entered > maxRolls) {
        this.value = "";
        Swal.fire({
            icon: "warning",
            title: "Invalid Waste Quantity",
            text: "Entered Rolls cannot exceed calculated waste (" + maxRolls.toFixed(2) + ").",
            confirmButtonText: "OK"
        });
    }
});

$("#QtyinMTR").on("blur", function () {
    if (!ObjData || $.isEmptyObject(ObjData)) return;
    let GSM = ObjData.TotalGSM || ObjData.GSM;
    let SizeW = ObjData.SizeW;
    let ConQty = parseFloat(this.value) || 0;

    // limit check
    if (ConQty > maxMTR) {
        this.value = "";
        $("#QtyinKG").val("");
        return;
    }

    let result = ((ConQty * (SizeW / 1000)) * GSM) / 1000;
    $("#QtyinKG").val(result.toFixed(2));
});

// ---------- CONVERSION (KG → MTR) ----------
$("#QtyinKG").on("blur", function () {
    if (!ObjData || $.isEmptyObject(ObjData)) return;
    let GSM = ObjData.TotalGSM || ObjData.GSM;
    let SizeW = ObjData.SizeW;
    let ConQty = parseFloat(this.value) || 0;

    // limit check
    if (ConQty > maxKG) {
        this.value = "";
        $("#QtyinMTR").val("");
        return;
    }

    let result = (ConQty * 1000) / ((SizeW / 1000) * GSM);
    $("#QtyinMTR").val(result.toFixed(2));
});



$("#BtnApplyMaster").click(function () {
    let Qty = parseFloat($("#QtyinMTR").val()) || 0;
    let Qty1 = parseFloat($("#QtyinKG").val()) || 0;
    let Rolls = parseInt($("#NoOfRolls").val()) || 0;

    if (
        Qty == null || Qty1 == null || Qty === "" || Qty1 === "" ||
        isNaN(Qty) || isNaN(Qty1) || Number(Qty) === 0 || Number(Qty1) === 0 ||
        Rolls == null || Rolls === "" || isNaN(Rolls) || Number(Rolls) === 0
    ) return;

    let grid = $("#GridRollStockNew").dxDataGrid("instance");
    let dataSource = grid.option("dataSource") || [];

    let currentTotalWidth = 0;
    dataSource.forEach(row => {
        currentTotalWidth += (Number(row.ItemWidth) || 0) * (Number(row.NoOfRolls) || 0);
    });

    let newWidth = (Number(ObjData.SizeW) || 0) * Rolls;
    let totalWidthAfterAdd = currentTotalWidth + newWidth;

    if (totalWidthAfterAdd > SizeWUNiversal) {
        Swal.fire({
            icon: "error",
            title: "Not Applicable!",
            text: "You cannot add more rolls — total width exceeds available size.",
            confirmButtonText: "OK"
        });
        return;
    }
    document.getElementById("BtnApplyMaster").setAttribute("data-dismiss", "modal");
    let BatchNo = document.getElementById("TxtBatchNo").value;


    let objitemmaster = {
        ItemID: ObjData.ItemID,
        ItemGroupID: ObjData.ItemGroupID,
        ItemCode: ObjData.ItemCode,
        ItemName: ObjData.ItemName,
        ItemWidth: ObjData.SizeW,
        StockUnit: ObjData.StockUnit,
        Qty: Qty,
        Qty1: Qty1,
        BatchNo: BatchNo,
    };

    for (let i = 0; i < Rolls; i++) {
        dataSource.push({
            ...objitemmaster,
            NoOfRolls: 1
        });
    }

    grid.option("dataSource", dataSource);
    grid.refresh();
});

//------------Anshu Code Start -----//


initializeGlobalDataGrid("#ShowListDataGrid", {
    dataSource: [],
    allowColumnReordering: true,
    allowColumnResizing: true,
    showBorders: true,
    showRowLines: true,
    columnResizingMode: "widget",
    filterRow: { visible: true, applyFilter: "auto" },
    sorting: {
        mode: "none"
    },
    editing: {
        mode: 'cell',
        allowDeleting: false,
        allowUpdating: false
    },
    scrolling: { mode: 'infinite' },
    selection: { mode: 'single' },
    rowAlternationEnabled: false,
    columns:
        [{ dataField: "TransactionID", visible: false, caption: "TransactionID", width: '*', width: 100 },
        { dataField: "JumboRollSlittingTransactionID", visible: false, caption: "JumboRollSlittingTransactionID", width: '*', width: 200 },
        { dataField: "VoucherNo", visible: true, caption: "VoucherNo", width: '*', width: 100 },
        { dataField: "VoucherDate", caption: "VoucherDate", width: '*', width: 100 },
        { dataField: "ItemID", visible: false, caption: "ItemID", width: '*', width: 100 },
        { dataField: "ItemCode", caption: "ItemCode", width: '*', width: 100 },
        { dataField: "ItemName", caption: "ItemName", width: '*', width: 500 },
        { dataField: "IssueQuantity", caption: "IssueQuantity", width: '*', width: 100 },
        { dataField: "ReceiptQuantity", caption: "ReceiptQuantity", width: '*', width: 100 },
        { dataField: "BatchNo", caption: "BatchNo", width: '*', width: 200 },
        { dataField: "StockUnit", caption: "StockUnit", width: '*', width: 100 },
        { dataField: "WarehouseID", visible: false, caption: "WarehouseID", width: '*', width: 100 },
        { dataField: "WarehouseName", caption: "WarehouseName", width: '*', width: 100 },
        { dataField: "WarehouseBinName", caption: "WarehouseBinName", width: '*', width: 100 },
        { dataField: "Narration", caption: "TransactionType", width: '*', width: 100 },
        { dataField: "MachineName", caption: "MachineName", width: '*', width: 100 },
        { dataField: "OperatorName", caption: "OperatorName", width: '*', width: 100 },
            /*{ dataField: "StartDateTime", caption: "StartDateTime", width: '*', width: 100 },*/


        
             { dataField: "StartDateTime", caption: "StartDateTime", width: 100 },
          
            { dataField: "EndDateTime", caption: "EndDateTime", width: 100 },


        ],

    height: function () {
        return window.innerHeight / 1.3;
    },
    export: {
        enabled: true,
        fileName: "JumboRollSlitting",
        allowExportSelectedData: true
    },
    onExporting(e) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("JumboRollSlitting");

        DevExpress.excelExporter.exportDataGrid({
            component: e.component,
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'JumboRollSlitting.xlsx');
            });
        });
        e.cancel = true;
    },
    onSelectionChanged: function (e) {
        SelectShowListDataOBJ = [];
        if (e.selectedRowsData.length > 0) {
            SelectShowListDataOBJ = e.selectedRowsData;
        }
        JumboRollSlittingTransactionID = SelectShowListDataOBJ[0].JumboRollSlittingTransactionID;
    }
});


$('#BtnDelete').click(async function () {

    if (JumboRollSlittingTransactionID <= 0 || JumboRollSlittingTransactionID == "" || JumboRollSlittingTransactionID == undefined) {
        //DevExpress.ui.notify(" Please select Record Do you want to Delete Data! ", "warning", 2500);
        showDevExpressNotification("Please select Record Do you want to Delete Data !", "warning");
        return;
    };
    var GridShowList = $('#ShowListDataGrid').dxDataGrid('instance');
    var selectedRow = GridShowList.getSelectedRowsData()[0];

    if (isCurrentFinancialYear(selectedRow.FYear) == false) {
        swal("Warning", "The selected JumboRollSlitting   cannot be Delete  in the logged-in financial year.", "warning");
        return false;
    }
    if (validateUserData.isUserInfoFilled === false) {
        validateUserData.userName = ""; validateUserData.password = ""; validateUserData.RecordID = JumboRollSlittingTransactionID; validateUserData.actionType = "Delete"; validateUserData.transactionRemark = ""; validateUserData.isUserInfoFilled = false;
        let result = await openSecurityPanelModal(validateUserData);
    }

    try {
        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/DeleteJumboRollSlittingData",
            data: '{JRSTID:' + JSON.stringify(JumboRollSlittingTransactionID) + ',ObjvalidateLoginUser:' + JSON.stringify(validateUserData) + '}',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (results) {
                var res = JSON.stringify(results);
                res = res.replace(/"d":/g, '');
                res = res.replace(/{/g, '');
                res = res.replace(/}/g, '');
                res = res.substr(1);
                res = res.slice(0, -1);
                if (res === "Success") {
                    alert('Your Data Successfully Deleted');
                    swal("Deleted!", "Your Data Has Been Saved Congratulations ", "success");
                    validateUserData.isUserInfoFilled = false;
                    location.reload();

                    document.getElementById("BtnDelete").setAttribute("data-dismiss", "modal");
                } else if (res === "InvalidUser") {
                    swal("Invalid User!", "Invalid user credentials, please enter valid username or password to delete the information.", "error");
                    validateUserData.isUserInfoFilled = false;
                    return false;
                } else {
                    swal("error!", res, "error");
                }
            }
        });
    } catch (e) {
        console.log(e);
    }

});

ShowListLoadData();
function ShowListLoadData() {
    try {
        $.ajax({
            type: "POST",
            url: "WebServiceJumboRollSlitting.asmx/ShowListGetDataVB",
            data: '{}',
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (results) {
                var res = results.replace(/\\/g, '');
                res = res.replace(/"d":""/g, '');
                res = res.replace(/""/g, '');
                res = res.replace(/u0026/g, '&');
                res = res.substr(1);
                res = res.slice(0, -1);
                var RES1 = JSON.parse(res);
                $("#ShowListDataGrid").dxDataGrid({
                    dataSource: RES1,
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
}

//added by vikesh

$("#BtnPrint").click(function () {
    var dataGrid = $("#ShowListDataGrid").dxDataGrid("instance");
    var selectedData = dataGrid.getSelectedRowsData();

    if (selectedData.length > 0) {
        var JumboRollSlittingTransactionID = selectedData[0].JumboRollSlittingTransactionID;
        var url = "ReportJumboRollSlitting.aspx?JumboRollSlittingTransactionID="
            + JumboRollSlittingTransactionID + "&type=Normal";
        window.open(url, "_blank", "location=yes,height=1100,width=1050,scrollbars=yes,status=no");
    } else {
        alert("Please select a row first.");
    }
});

// Splitting Print
$("#BtnPrintSlitting").click(function () {
    var dataGrid = $("#ShowListDataGrid").dxDataGrid("instance");
    var selectedData = dataGrid.getSelectedRowsData();

    if (selectedData.length > 0) {
        var JumboRollSlittingTransactionID = selectedData[0].JumboRollSlittingTransactionID;
        var url = "ReportJumboRollSlitting.aspx?JumboRollSlittingTransactionID="
            + JumboRollSlittingTransactionID + "&type=Slitting";
        window.open(url, "_blank", "location=yes,height=1100,width=1050,scrollbars=yes,status=no");
    } else {
        alert("Please select a row first.");
    }
});

$("#BtnNew").click(function () {
    $("#TxtRollCode").val("");
    $("#TxtRollName").val("");
    $("#TxtRollStock").val("");
    $("#TxtRollStockinKG").val("");
    $("#TxtRollStockCon").val("");
    $("#TxtRollStockConinKG").val("");
    $("#TxtBatchNo").val("");
    $("#TxtWarehouseName").val("");
    $("#TxtBinName").val("");
    $("#TxtRemark").val("");

    // ✅ Grid empty
    if ($("#GridRollStockNew").data("dxDataGrid")) {
        $("#GridRollStockNew").dxDataGrid("instance").option("dataSource", []);
    }

    if ($("#GridRollStock").data("dxDataGrid")) {
        $("#GridRollStock").dxDataGrid("instance").option("dataSource", []);
    }

    if ($("#GridRollMaster").data("dxDataGrid")) {
        $("#GridRollMaster").dxDataGrid("instance").option("dataSource", []);
    }

    RefreshRollStock();
    ShowListLoadData();
});