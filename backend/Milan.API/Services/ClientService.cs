using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public interface IClientService
    {
        Task<IEnumerable<ClientDto>> GetAllAsync();
        Task<ClientDto?> GetByIdAsync(int id);
        Task<ClientDto> CreateAsync(CreateClientDto dto);
        Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class ClientService : IClientService
    {
        private readonly IClientRepository _repository;
        private readonly ILogger<ClientService> _logger;

        public ClientService(IClientRepository repository, ILogger<ClientService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ClientDto>> GetAllAsync()
        {
            var clients = await _repository.GetAllAsync();
            return clients.Select(MapToDto);
        }

        public async Task<ClientDto?> GetByIdAsync(int id)
        {
            var client = await _repository.GetByIdAsync(id);
            return client == null ? null : MapToDto(client);
        }

        public async Task<ClientDto> CreateAsync(CreateClientDto dto)
        {
            // Removed validation for ClientCode as it no longer exists
            
            var client = new Client
            {
                ClientName = dto.ClientName,
                Address = dto.Address,
                MobileNumber = dto.MobileNumber,
                Email = dto.Email,
                GSTNumber = dto.GSTNumber,
                State = dto.State,
                Country = dto.Country,
                IsActive = true
            };

            var id = await _repository.CreateAsync(client);
            client.ClientId = id;
            client.CreatedAt = DateTime.UtcNow;
            client.UpdatedAt = DateTime.UtcNow;

            return MapToDto(client);
        }

        public async Task<ClientDto?> UpdateAsync(int id, UpdateClientDto dto)
        {
            var client = await _repository.GetByIdAsync(id);
            if (client == null) return null;

            client.ClientName = dto.ClientName;
            client.Address = dto.Address;
            client.MobileNumber = dto.MobileNumber;
            client.Email = dto.Email;
            client.GSTNumber = dto.GSTNumber;
            client.State = dto.State;
            client.Country = dto.Country;
            
            if (dto.IsActive.HasValue) client.IsActive = dto.IsActive.Value;

            await _repository.UpdateAsync(client);
            
            client.UpdatedAt = DateTime.UtcNow;
            return MapToDto(client);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static ClientDto MapToDto(Client client)
        {
            return new ClientDto
            {
                ClientId = client.ClientId,
                ClientName = client.ClientName,
                Address = client.Address,
                MobileNumber = client.MobileNumber,
                Email = client.Email,
                GSTNumber = client.GSTNumber,
                State = client.State,
                Country = client.Country,
                IsActive = client.IsActive,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };
        }
    }
}
