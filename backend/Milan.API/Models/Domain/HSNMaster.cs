using System;

namespace Milan.API.Models.Domain
{
    public class HSNMaster
    {
        public int HSNId { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string HSNCode { get; set; } = string.Empty;
        public decimal GSTPercentage { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
