using System;

namespace Milan.API.Models.DTOs
{
    public class SupplierDto
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? MobileNumber { get; set; }
        public string? Email { get; set; }
        public string? GSTNumber { get; set; }
        public decimal? ExcessQuantityTolerance { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateSupplierDto
    {
        public string SupplierName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? MobileNumber { get; set; }
        public string? Email { get; set; }
        public string? GSTNumber { get; set; }
        public decimal? ExcessQuantityTolerance { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
    }

    public class UpdateSupplierDto
    {
        public string SupplierName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? MobileNumber { get; set; }
        public string? Email { get; set; }
        public string? GSTNumber { get; set; }
        public decimal? ExcessQuantityTolerance { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public bool? IsActive { get; set; }
    }
}
