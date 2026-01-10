using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IPurchaseOrderService
    {
        Task<IEnumerable<PurchaseOrderDto>> GetAllAsync();
        Task<PurchaseOrderDto?> GetByIdAsync(int id);
        Task<string> GetNextPONumberAsync();
        Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IPurchaseOrderRepository _repository;

        public PurchaseOrderService(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PurchaseOrderDto>> GetAllAsync()
        {
            // For list view, we might not need items, but let's fetch basic details
            // Or if we use Base GetAllAsync, it returns headers only.
            var pos = await _repository.GetAllAsync();
            return pos.Select(MapToDto);
        }

        public async Task<PurchaseOrderDto?> GetByIdAsync(int id)
        {
            var po = await _repository.GetWithItemsAsync(id);
            return po == null ? null : MapToDto(po);
        }

        public async Task<PurchaseOrderDto> CreateAsync(CreatePurchaseOrderDto dto)
        {
            var po = new PurchaseOrder
            {
                PONumber = dto.PONumber,
                PODate = dto.PODate,
                SupplierId = dto.SupplierId,
                Status = "Pending",
                Remarks = dto.Remarks,
                OtherCharges = dto.OtherCharges,
                OtherChargeDescription = dto.OtherChargeDescription,
                GrandBasic = dto.GrandBasic,
                GrandTax = dto.GrandTax,
                GrandTotal = dto.GrandTotal,
                IsActive = true,
                Items = dto.Items.Select(i => new PurchaseOrderItem
                {
                    ItemType = i.ItemType,
                    ItemId = i.ItemId,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    RollWidthMM = i.RollWidthMM,
                    RollTotalGSM = i.RollTotalGSM,
                    QtyKg = i.QtyKg,
                    QtySqMtr = i.QtySqMtr,
                    QtyRunMtr = i.QtyRunMtr,
                    QtyUnit = i.QtyUnit,
                    ReqDate = i.ReqDate,
                    Rate = i.Rate,
                    RateType = i.RateType,
                    BasicAmount = i.BasicAmount,
                    TaxAmount = i.TaxAmount,
                    CGST = i.CGST,
                    SGST = i.SGST,
                    IGST = i.IGST,
                    TotalAmount = i.TotalAmount,
                    HSNCode = i.HSNCode,
                    GSTPercent = i.GSTPercent,
                    Remark = i.Remark,
                    IsActive = true
                }).ToList()
            };

            var id = await _repository.CreateAsync(po);
            return await GetByIdAsync(id) ?? throw new Exception("Failed to retrieve created PO");
        }

        private static PurchaseOrderDto MapToDto(PurchaseOrder po)
        {
            return new PurchaseOrderDto
            {
                POId = po.POId,
                PONumber = po.PONumber,
                PODate = po.PODate,
                SupplierId = po.SupplierId,
                SupplierName = po.SupplierName,
                Status = po.Status,
                Remarks = po.Remarks,
                OtherCharges = po.OtherCharges,
                OtherChargeDescription = po.OtherChargeDescription,
                GrandBasic = po.GrandBasic,
                GrandTax = po.GrandTax,
                GrandTotal = po.GrandTotal,
                CreatedAt = po.CreatedAt,
                UpdatedAt = po.UpdatedAt,
                Items = po.Items.Select(i => new PurchaseOrderItemDto
                {
                    POItemId = i.POItemId,
                    POId = i.POId,
                    ItemType = i.ItemType,
                    ItemId = i.ItemId,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    RollWidthMM = i.RollWidthMM,
                    RollTotalGSM = i.RollTotalGSM,
                    QtyKg = i.QtyKg,
                    QtySqMtr = i.QtySqMtr,
                    QtyRunMtr = i.QtyRunMtr,
                    QtyUnit = i.QtyUnit,
                    ReqDate = i.ReqDate,
                    Rate = i.Rate,
                    RateType = i.RateType,
                    BasicAmount = i.BasicAmount,
                    TaxAmount = i.TaxAmount,
                    CGST = i.CGST,
                    SGST = i.SGST,
                    IGST = i.IGST,
                    TotalAmount = i.TotalAmount,
                    HSNCode = i.HSNCode,
                    GSTPercent = i.GSTPercent,
                    Remark = i.Remark
                }).ToList()
            };
        }
        public async Task<string> GetNextPONumberAsync()
        {
            return await _repository.GetNextPONumberAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
