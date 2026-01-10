using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface IClientRepository : IRepository<Client>
    {
        // No longer keying by ClientCode
        // Task<Client?> GetByCodeAsync(string clientCode);
        // Task<bool> ExistsAsync(string clientCode);
    }

    public class ClientRepository : BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Clients")
        {
        }

        protected override string GetPrimaryKeyColumn() => "ClientId";

        public override async Task<int> CreateAsync(Client entity)
        {
            var sql = @"
                INSERT INTO Clients (
                    TenantId, ClientName, Address, MobileNumber, Email, 
                    GSTNumber, State, Country, IsActive, CreatedAt, UpdatedAt
                ) 
                VALUES (
                    @TenantId, @ClientName, @Address, @MobileNumber, @Email, 
                    @GSTNumber, @State, @Country, @IsActive, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() as int);";

            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(Client entity)
        {
            var sql = @"
                UPDATE Clients 
                SET 
                    ClientName = @ClientName,
                    Address = @Address,
                    MobileNumber = @MobileNumber,
                    Email = @Email,
                    GSTNumber = @GSTNumber,
                    State = @State,
                    Country = @Country,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE()
                WHERE ClientId = @ClientId AND TenantId = @TenantId";
            
            return await ExecuteAsync(sql, entity);
        }
    }
}
