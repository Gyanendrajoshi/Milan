<%@ Page Title="" Language="VB" MasterPageFile="~/MasterPage_Main.master" AutoEventWireup="false" CodeFile="JumboRollSlitting.aspx.vb" Inherits="JumboRollSlitting" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">

    <div class="row clearfix" style="padding: 0px; margin: 10px;">
        <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
            <label>Voucher No</label>
            <input id="TxtVoucherNo" type="text" class="forTextBox" disabled />
        </div>

        <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
            <label>Voucher Date</label>
            <div id="DtDate"></div>
        </div>


        <div class="row clearfix" style="padding: 0px; margin: 10px;">

            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>Roll Code</label>
                <input id="TxtRollCode" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                <label>Roll Detail</label>
                <input id="TxtRollName" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-6 col-sm-6 col-md-1 col-lg-2">
                <label>Batch No</label>
                <input id="TxtBatchNo" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>Warehouse</label>
                <input id="TxtWarehouseName" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-12 col-sm-6 col-md-2 col-lg-2">
                <label>Bin</label>
                <input id="TxtBinName" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-6 col-sm-6 col-md-1 col-lg-2">
                <label>Stock Qty</label>
                <input id="TxtRollStock" type="text" class="forTextBox" disabled />
            </div>

            <div class="col-xs-6 col-sm-6 col-md-1 col-lg-2">
                <label>Stock Qty(KG)</label>
                <input id="TxtRollStockinKG" type="text" class="forTextBox" disabled />
            </div>
        </div>
                <%--  added by Pooja Pawar--%>
        <div class="row clearfix" style="padding: 0px; margin: 10px;">
            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>Machine Name</label>
                <div id="SelMachine"></div>
            </div>

            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>Operator Name</label>
                <div id="SelOperator"></div>
            </div>

            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>Start Time</label>
                <div id="DtStartTime"></div>
            </div>

            <div class="col-xs-6 col-sm-6 col-md-2 col-lg-2">
                <label>End Time</label>
                <div id="DtEndTime"></div>
            </div>

            <div class="col-xs-6 col-sm-3 col-md-2 col-lg-2 col-xl-1" style="margin-top: 5px">
                <button type="button" data-target="#modalRollStock" data-toggle="modal" id="BtnRollStock" class="btn btn-primary waves-effect">Select Item Stock</button>
            </div>
        </div>


        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div id="GridRollMaster"></div>
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Qty (mtr)</label>
            <input id="QtyinMTR" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Qty (kg)</label>
            <input id="QtyinKG" type="text" class="forTextBox" readonly />
        </div>
        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>No of Rolls</label>
            <input id="NoOfRolls" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-3 col-md-2 col-lg-1" style="margin-top: 5px">
            <button type="button" id="BtnApplyMaster" class="btn btn-primary waves-effect">Add +</button>
        </div>

        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div id="GridRollStockNew"></div>
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Con.Qty</label>
            <input id="TxtRollStockCon" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Con.Qty(KG)</label>
            <input id="TxtRollStockConinKG" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Was.Qty</label>
            <input id="TxtRollStockWast" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-6 col-md-1 col-lg-1">
            <label>Was.Qty(KG)</label>
            <input id="TxtRollStockWastinKG" type="text" class="forTextBox" readonly />
        </div>

        <div class="col-xs-6 col-sm-2 col-md-2 col-lg-2">
            <b class="font-11">Warehouse</b>
            <div id="SelWarehouse"></div>
        </div>

        <div class="col-xs-6 col-sm-2 col-md-2 col-lg-2">
            <b class="font-11">Bin</b>
            <div id="SelBin"></div>
        </div>



        <%--<div class="col-xs-6 col-sm-3 col-md-2 col-lg-1" style="margin-top: 20px">
            <button type="button" data-target="#modalRollMaster" data-toggle="modal" id="BtnRollMaster" class="btn btn-primary waves-effect">Select Item Master</button>
        </div>--%>


        <%-- <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div id="GridRollStockNew"></div>
        </div>--%>
    </div>

    <div class="row clearfix" style="padding: 0px; margin: 10px;">
    </div>

    <div class="row clearfix" style="padding: 0px; margin: 10px;">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <label>Remark</label>
            <input id="TxtRemark" type="text" class="forTextBox" />
        </div>
    </div>

    <div class="row clearfix" style="padding: 0px; margin: 10px;">
        <button type="button" id="BtnNew" class="btn btn-default waves-effect">New</button>
        <button type="button" id="BtnSave" class="btn btn-success waves-effect">Save</button>
        <button type="button" data-target="#ModalShowList" data-toggle="modal" id="BtnShowList" class="btn btn-primary waves-effect">ShowList</button>
    </div>


    <%--Modal Roll Stock Details--%>
    <div class="modal fade clearfix tab-pane animated fadeInUp" id="modalRollStock" tabindex="-1" role="dialog" style="padding: 0px; margin-top: 0px; margin-left: 0px">
        <div class="modal-dialog modal-lg" role="document" style="">
            <div class="modal-content">
                <div class="DialogBoxCustom" style="float: left; border-top-left-radius: 4px; border-top-right-radius: 4px;">
                    <strong>Item Stock</strong>
                    <a href="javascript:void(0);" class="iconRightDbox btn-danger" data-dismiss="modal">
                        <span data-dismiss="modal" style="font-weight: 900; margin-right: 8px">X</span>
                    </a>
                </div>
                <div class="modal-body">
                    <div role="tabpanel" class="rowcontents clearfix">

                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <div id="GridRollStock"></div>
                        </div>

                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 0em; border-top: 1px solid #42909A; height: 3em">
                    <button type="button" id="BtnApply" class="btn btn-primary" style="margin-top: -1em">Apply </button>
                </div>

            </div>
        </div>
    </div>

    <%--Modal Roll Master --%>
    <%--<div class="modal fade clearfix tab-pane animated fadeInUp" id="modalRollMaster" tabindex="-1" role="dialog" style="padding: 0px; margin-top: 0px; margin-left: 0px">
        <div class="modal-dialog modal-lg" role="document" style="">
            <div class="modal-content">
                <div class="DialogBoxCustom" style="float: left; border-top-left-radius: 4px; border-top-right-radius: 4px;">
                    <strong>Item Master</strong>
                    <a href="javascript:void(0);" class="iconRightDbox btn-danger" data-dismiss="modal">
                        <span data-dismiss="modal" style="font-weight: 900; margin-right: 8px">X</span>
                    </a>
                </div>
                <div class="modal-body">
                    <div role="tabpanel" class="rowcontents clearfix">

                        

                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 0em; border-top: 1px solid #42909A; height: 3em">
                    <button type="button" id="BtnApplyMaster" class="btn btn-primary" style="margin-top: -1em">Apply </button>
                </div>

            </div>
        </div>
    </div>--%>

    <%--Modal Roll Master --%>
    <div class="modal fade clearfix tab-pane animated fadeInUp" id="ModalShowList" tabindex="-1" role="dialog" style="padding: 0px; margin-top: 0px; margin-left: 0px">
        <div class="modal-dialog modal-lg" role="document" style="">
            <div class="modal-content">
                <div class="DialogBoxCustom" style="float: left; border-top-left-radius: 4px; border-top-right-radius: 4px;">
                    <strong>Save Record</strong>
                    <a href="javascript:void(0);" class="iconRightDbox btn-danger" data-dismiss="modal">
                        <span data-dismiss="modal" style="font-weight: 900; margin-right: 8px">X</span>
                    </a>
                </div>
                <div class="modal-body">
                    <div role="tabpanel" class="rowcontents clearfix">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                            <div id="ShowListDataGrid"></div>
                        </div>

                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-end gap-2">

                    <%--                    added by vikesh patidar--%>
                    <button type="button" id="BtnPrint" class="btn btn-primary">
                        <i class="fa fa-print"></i>Print
                    </button>

                    <button type="button" id="BtnPrintSlitting" class="btn btn-info">
                        <i class="fa fa-print"></i>Print Slitting
                    </button>

                    <button type="button" id="BtnDelete" class="btn btn-danger">
                        <i class="fa fa-trash"></i>Delete
                    </button>
                </div>

            </div>
        </div>
    </div>

    <script src="CustomJS/JumboRollSlitting.js"></script>

</asp:Content>

