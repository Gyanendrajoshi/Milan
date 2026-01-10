using System;

namespace Milan.API.Models.Domain
{
    public class ChargeType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LogicCode { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
