namespace Milan.API.Models.Domain
{
    public class Client
    {
        public int ClientId { get; set; }
        public int TenantId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? MobileNumber { get; set; }
        public string? Email { get; set; }
        public string? GSTNumber { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
