using System;

namespace Milan.API.Models.Domain
{
    public class CategoryMaster
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        
        // Navigation / Joined Properties
        public IEnumerable<ProcessMaster> Processes { get; set; } = new List<ProcessMaster>();
    }
}
