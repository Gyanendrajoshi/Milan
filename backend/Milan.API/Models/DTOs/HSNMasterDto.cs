using System;

namespace Milan.API.Models.DTOs
{
    public class HSNMasterDto
    {
        public int HSNId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string HSNCode { get; set; } = string.Empty;
        public decimal GSTPercentage { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateHSNMasterDto
    {
        public string Name { get; set; } = string.Empty;
        public string HSNCode { get; set; } = string.Empty;
        public decimal GSTPercentage { get; set; }
    }

    public class UpdateHSNMasterDto
    {
        public string Name { get; set; } = string.Empty;
        public string HSNCode { get; set; } = string.Empty;
        public decimal GSTPercentage { get; set; }
        public bool? IsActive { get; set; }
    }
}
