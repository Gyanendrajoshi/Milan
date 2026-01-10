# BACKEND CODE EXAMPLES
## Complete Implementation Reference for Milan PMS Backend

This document provides **complete, production-ready code examples** for implementing the backend patterns described in `BACKEND_IMPLEMENTATION_GUIDE.md`.

---

## ⚠️ CRITICAL UPDATE: Inventory Transaction Tracking

**Version 2.0 - NOW INCLUDES INVENTORY LEDGER INTEGRATION**

All stock movement operations **MUST** record inventory transactions for:
- ✅ **Legal Compliance** - GST audit trail requirements
- ✅ **Cost Tracking** - FIFO-based inventory valuation
- ✅ **Audit Trail** - Complete transaction history
- ✅ **Reconciliation** - Physical vs. system stock matching

**See Section 3: [Inventory Transaction Integration Examples](#inventory-transaction-integration-examples) for complete implementation patterns.**

**Related Documentation**: [BACKEND_INVENTORY_LEDGER.md](BACKEND_INVENTORY_LEDGER.md) - Complete database schema and service implementation

---

## TABLE OF CONTENTS

1. [Complete Client Module Example](#complete-client-module-example)
2. [Complete Slitting Module Example](#complete-slitting-module-example)
3. [Inventory Transaction Integration Examples](#inventory-transaction-integration-examples) ⭐ **CRITICAL**
4. [Database Connection Factory](#database-connection-factory)
5. [JWT Token Service](#jwt-token-service)
6. [Error Handling](#error-handling)
7. [Program.cs Configuration](#programcs-configuration)
8. [Frontend API Integration Examples](#frontend-api-integration-examples)

---

## 1. COMPLETE CLIENT MODULE EXAMPLE

### Domain Model

**Models/Domain/Client.cs**
```csharp
namespace Milan.API.Models.Domain
{
    public class Client
    {
        public int ClientId { get; set; }
        public int TenantId { get; set; }
        public string ClientCode { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? GST { get; set; }
        public string? PAN { get; set; }
        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal? CreditLimit { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

### DTOs

**Models/DTOs/ClientDto.cs**
```csharp
namespace Milan.API.Models.DTOs
{
    public class ClientDto
    {
        public int ClientId { get; set; }
        public string ClientCode { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? GST { get; set; }
        public string? PAN { get; set; }
        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal? CreditLimit { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateClientDto
    {
        public string ClientCode { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? GST { get; set; }
        public string? PAN { get; set; }
        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal? CreditLimit { get; set; }
    }

    public class UpdateClientDto
    {
        public string ClientName { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? GST { get; set; }
        public string? PAN { get; set; }
        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal? CreditLimit { get; set; }
        public bool? IsActive { get; set; }
    }
}
```

### Repository Interface

**Repositories/IClientRepository.cs**
```csharp
using Milan.API.Models.Domain;

namespace Milan.API.Repositories
{
    public interface IClientRepository
    {
        Task<List<Client>> GetAllAsync();
        Task<Client?> GetByIdAsync(int clientId);
        Task<Client?> GetByCodeAsync(string clientCode);
        Task<int> CreateAsync(Client client);
        Task<bool> UpdateAsync(Client client);
        Task<bool> DeleteAsync(int clientId);
        Task<bool> ExistsAsync(string clientCode);
    }
}
```

### Repository Implementation

**Repositories/ClientRepository.cs**
```csharp
using Microsoft.Data.SqlClient;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public class ClientRepository : BaseRepository<Client>, IClientRepository
    {
        public ClientRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Clients")
        {
        }

        protected override string GetPrimaryKeyColumn() => "ClientId";

        public async Task<List<Client>> GetAllAsync()
        {
            return await ExecuteQueryAsync(
                "SELECT * ",
                MapClientFromReader
            );
        }

        public async Task<Client?> GetByIdAsync(int clientId)
        {
            var results = await ExecuteQueryAsync(
                "SELECT * ",
                MapClientFromReader,
                "ClientId = @ClientId",
                new[] { new SqlParameter("@ClientId", clientId) }
            );

            return results.FirstOrDefault();
        }

        public async Task<Client?> GetByCodeAsync(string clientCode)
        {
            var results = await ExecuteQueryAsync(
                "SELECT * ",
                MapClientFromReader,
                "ClientCode = @ClientCode",
                new[] { new SqlParameter("@ClientCode", clientCode) }
            );

            return results.FirstOrDefault();
        }

        public async Task<int> CreateAsync(Client client)
        {
            var columns = @"ClientCode, ClientName, ContactPerson, Email, Phone,
                          GST, PAN, BillingAddress, ShippingAddress,
                          PaymentTerms, CreditLimit, IsActive, CreatedAt, UpdatedAt";

            var values = @"@ClientCode, @ClientName, @ContactPerson, @Email, @Phone,
                         @GST, @PAN, @BillingAddress, @ShippingAddress,
                         @PaymentTerms, @CreditLimit, @IsActive, GETDATE(), GETDATE()";

            var parameters = new[]
            {
                new SqlParameter("@ClientCode", client.ClientCode),
                new SqlParameter("@ClientName", client.ClientName),
                new SqlParameter("@ContactPerson", (object?)client.ContactPerson ?? DBNull.Value),
                new SqlParameter("@Email", (object?)client.Email ?? DBNull.Value),
                new SqlParameter("@Phone", (object?)client.Phone ?? DBNull.Value),
                new SqlParameter("@GST", (object?)client.GST ?? DBNull.Value),
                new SqlParameter("@PAN", (object?)client.PAN ?? DBNull.Value),
                new SqlParameter("@BillingAddress", (object?)client.BillingAddress ?? DBNull.Value),
                new SqlParameter("@ShippingAddress", (object?)client.ShippingAddress ?? DBNull.Value),
                new SqlParameter("@PaymentTerms", (object?)client.PaymentTerms ?? DBNull.Value),
                new SqlParameter("@CreditLimit", (object?)client.CreditLimit ?? DBNull.Value),
                new SqlParameter("@IsActive", client.IsActive)
            };

            return await ExecuteInsertAsync(columns, values, parameters);
        }

        public async Task<bool> UpdateAsync(Client client)
        {
            var setClause = @"ClientName = @ClientName,
                            ContactPerson = @ContactPerson,
                            Email = @Email,
                            Phone = @Phone,
                            GST = @GST,
                            PAN = @PAN,
                            BillingAddress = @BillingAddress,
                            ShippingAddress = @ShippingAddress,
                            PaymentTerms = @PaymentTerms,
                            CreditLimit = @CreditLimit,
                            IsActive = @IsActive";

            var parameters = new[]
            {
                new SqlParameter("@ClientName", client.ClientName),
                new SqlParameter("@ContactPerson", (object?)client.ContactPerson ?? DBNull.Value),
                new SqlParameter("@Email", (object?)client.Email ?? DBNull.Value),
                new SqlParameter("@Phone", (object?)client.Phone ?? DBNull.Value),
                new SqlParameter("@GST", (object?)client.GST ?? DBNull.Value),
                new SqlParameter("@PAN", (object?)client.PAN ?? DBNull.Value),
                new SqlParameter("@BillingAddress", (object?)client.BillingAddress ?? DBNull.Value),
                new SqlParameter("@ShippingAddress", (object?)client.ShippingAddress ?? DBNull.Value),
                new SqlParameter("@PaymentTerms", (object?)client.PaymentTerms ?? DBNull.Value),
                new SqlParameter("@CreditLimit", (object?)client.CreditLimit ?? DBNull.Value),
                new SqlParameter("@IsActive", client.IsActive)
            };

            return await ExecuteUpdateAsync(client.ClientId, setClause, parameters);
        }

        public async Task<bool> DeleteAsync(int clientId)
        {
            return await ExecuteDeleteAsync(clientId);
        }

        public async Task<bool> ExistsAsync(string clientCode)
        {
            var tenantId = GetTenantId();

            var query = @"SELECT COUNT(1) FROM Clients
                         WHERE TenantId = @TenantId AND ClientCode = @ClientCode";

            using var connection = await _connectionFactory.CreateConnectionAsync();
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@TenantId", tenantId);
            command.Parameters.AddWithValue("@ClientCode", clientCode);

            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }

        private Client MapClientFromReader(SqlDataReader reader)
        {
            return new Client
            {
                ClientId = reader.GetInt32(reader.GetOrdinal("ClientId")),
                TenantId = reader.GetInt32(reader.GetOrdinal("TenantId")),
                ClientCode = reader.GetString(reader.GetOrdinal("ClientCode")),
                ClientName = reader.GetString(reader.GetOrdinal("ClientName")),
                ContactPerson = reader.IsDBNull(reader.GetOrdinal("ContactPerson"))
                    ? null : reader.GetString(reader.GetOrdinal("ContactPerson")),
                Email = reader.IsDBNull(reader.GetOrdinal("Email"))
                    ? null : reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.IsDBNull(reader.GetOrdinal("Phone"))
                    ? null : reader.GetString(reader.GetOrdinal("Phone")),
                GST = reader.IsDBNull(reader.GetOrdinal("GST"))
                    ? null : reader.GetString(reader.GetOrdinal("GST")),
                PAN = reader.IsDBNull(reader.GetOrdinal("PAN"))
                    ? null : reader.GetString(reader.GetOrdinal("PAN")),
                BillingAddress = reader.IsDBNull(reader.GetOrdinal("BillingAddress"))
                    ? null : reader.GetString(reader.GetOrdinal("BillingAddress")),
                ShippingAddress = reader.IsDBNull(reader.GetOrdinal("ShippingAddress"))
                    ? null : reader.GetString(reader.GetOrdinal("ShippingAddress")),
                PaymentTerms = reader.IsDBNull(reader.GetOrdinal("PaymentTerms"))
                    ? null : reader.GetString(reader.GetOrdinal("PaymentTerms")),
                CreditLimit = reader.IsDBNull(reader.GetOrdinal("CreditLimit"))
                    ? null : reader.GetDecimal(reader.GetOrdinal("CreditLimit")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
            };
        }
    }
}
```

### Service Interface

**Services/IClientService.cs**
```csharp
using Milan.API.Models.DTOs;

namespace Milan.API.Services
{
    public interface IClientService
    {
        Task<List<ClientDto>> GetAllAsync();
        Task<ClientDto?> GetByIdAsync(int clientId);
        Task<ClientDto> CreateAsync(CreateClientDto dto);
        Task<ClientDto?> UpdateAsync(int clientId, UpdateClientDto dto);
        Task<bool> DeleteAsync(int clientId);
    }
}
```

### Service Implementation

**Services/ClientService.cs**
```csharp
using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;

namespace Milan.API.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _clientRepository;
        private readonly ILogger<ClientService> _logger;

        public ClientService(
            IClientRepository clientRepository,
            ILogger<ClientService> logger)
        {
            _clientRepository = clientRepository;
            _logger = logger;
        }

        public async Task<List<ClientDto>> GetAllAsync()
        {
            var clients = await _clientRepository.GetAllAsync();
            return clients.Select(MapToDto).ToList();
        }

        public async Task<ClientDto?> GetByIdAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            return client != null ? MapToDto(client) : null;
        }

        public async Task<ClientDto> CreateAsync(CreateClientDto dto)
        {
            // Validate client code uniqueness
            if (await _clientRepository.ExistsAsync(dto.ClientCode))
            {
                throw new InvalidOperationException($"Client with code '{dto.ClientCode}' already exists");
            }

            var client = new Client
            {
                ClientCode = dto.ClientCode,
                ClientName = dto.ClientName,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                GST = dto.GST,
                PAN = dto.PAN,
                BillingAddress = dto.BillingAddress,
                ShippingAddress = dto.ShippingAddress,
                PaymentTerms = dto.PaymentTerms,
                CreditLimit = dto.CreditLimit,
                IsActive = true
            };

            var clientId = await _clientRepository.CreateAsync(client);
            client.ClientId = clientId;

            _logger.LogInformation("Created client {ClientCode} with ID {ClientId}",
                client.ClientCode, clientId);

            return MapToDto(client);
        }

        public async Task<ClientDto?> UpdateAsync(int clientId, UpdateClientDto dto)
        {
            var existingClient = await _clientRepository.GetByIdAsync(clientId);
            if (existingClient == null)
            {
                return null;
            }

            // Update fields
            existingClient.ClientName = dto.ClientName;
            existingClient.ContactPerson = dto.ContactPerson;
            existingClient.Email = dto.Email;
            existingClient.Phone = dto.Phone;
            existingClient.GST = dto.GST;
            existingClient.PAN = dto.PAN;
            existingClient.BillingAddress = dto.BillingAddress;
            existingClient.ShippingAddress = dto.ShippingAddress;
            existingClient.PaymentTerms = dto.PaymentTerms;
            existingClient.CreditLimit = dto.CreditLimit;

            if (dto.IsActive.HasValue)
            {
                existingClient.IsActive = dto.IsActive.Value;
            }

            var success = await _clientRepository.UpdateAsync(existingClient);
            if (!success)
            {
                return null;
            }

            _logger.LogInformation("Updated client {ClientCode} (ID: {ClientId})",
                existingClient.ClientCode, clientId);

            return MapToDto(existingClient);
        }

        public async Task<bool> DeleteAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
            {
                return false;
            }

            var success = await _clientRepository.DeleteAsync(clientId);

            if (success)
            {
                _logger.LogInformation("Deleted client {ClientCode} (ID: {ClientId})",
                    client.ClientCode, clientId);
            }

            return success;
        }

        private ClientDto MapToDto(Client client)
        {
            return new ClientDto
            {
                ClientId = client.ClientId,
                ClientCode = client.ClientCode,
                ClientName = client.ClientName,
                ContactPerson = client.ContactPerson,
                Email = client.Email,
                Phone = client.Phone,
                GST = client.GST,
                PAN = client.PAN,
                BillingAddress = client.BillingAddress,
                ShippingAddress = client.ShippingAddress,
                PaymentTerms = client.PaymentTerms,
                CreditLimit = client.CreditLimit,
                IsActive = client.IsActive,
                CreatedAt = client.CreatedAt,
                UpdatedAt = client.UpdatedAt
            };
        }
    }
}
```

### Controller

**Controllers/ClientsController.cs**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Milan.API.Models.DTOs;
using Milan.API.Services;

namespace Milan.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(
            IClientService clientService,
            ILogger<ClientsController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        /// <summary>
        /// Get all clients for the current tenant
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<ClientDto>), 200)]
        public async Task<ActionResult<List<ClientDto>>> GetAll()
        {
            try
            {
                var clients = await _clientService.GetAllAsync();
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clients");
                return StatusCode(500, new { message = "An error occurred while retrieving clients" });
            }
        }

        /// <summary>
        /// Get a specific client by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClientDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<ClientDto>> GetById(int id)
        {
            try
            {
                var client = await _clientService.GetByIdAsync(id);

                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                return Ok(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving client {ClientId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the client" });
            }
        }

        /// <summary>
        /// Create a new client
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ClientDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<ClientDto>> Create([FromBody] CreateClientDto dto)
        {
            try
            {
                var client = await _clientService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = client.ClientId }, client);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return StatusCode(500, new { message = "An error occurred while creating the client" });
            }
        }

        /// <summary>
        /// Update an existing client
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ClientDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<ClientDto>> Update(int id, [FromBody] UpdateClientDto dto)
        {
            try
            {
                var client = await _clientService.UpdateAsync(id, dto);

                if (client == null)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                return Ok(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client {ClientId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the client" });
            }
        }

        /// <summary>
        /// Delete a client
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _clientService.DeleteAsync(id);

                if (!success)
                {
                    return NotFound(new { message = $"Client with ID {id} not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client {ClientId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the client" });
            }
        }
    }
}
```

---

## 2. COMPLETE SLITTING MODULE EXAMPLE

### Domain Models

**Models/Domain/SlittingJob.cs**
```csharp
namespace Milan.API.Models.Domain
{
    public class SlittingJob
    {
        public int SlittingJobId { get; set; }
        public int TenantId { get; set; }
        public string SlittingJobNumber { get; set; } = string.Empty;
        public DateTime SlittingDate { get; set; }

        // Input Roll
        public int? InputGRNItemId { get; set; }
        public int? InputStockId { get; set; }
        public string InputItemCode { get; set; } = string.Empty;
        public string InputItemName { get; set; } = string.Empty;
        public string InputBatchNo { get; set; } = string.Empty;
        public int InputWidth { get; set; }
        public decimal InputGSM { get; set; }
        public decimal InputRM { get; set; }
        public decimal InputSqMtr { get; set; }
        public decimal InputKg { get; set; }

        // Wastage
        public decimal WastageKg { get; set; }
        public decimal? WastageRM { get; set; }
        public decimal? WastageSqMtr { get; set; }
        public string? WastageRemarks { get; set; }

        // Metadata
        public string? OperatorName { get; set; }
        public string? MachineNo { get; set; }
        public string? Remarks { get; set; }
        public string Status { get; set; } = "Completed";

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public List<SlittingOutputRoll> OutputRolls { get; set; } = new();
    }

    public class SlittingOutputRoll
    {
        public int OutputRollId { get; set; }
        public int TenantId { get; set; }
        public int SlittingJobId { get; set; }
        public int? RollMasterId { get; set; }

        public int OutputWidth { get; set; }
        public decimal OutputGSM { get; set; }
        public decimal OutputRM { get; set; }
        public decimal OutputSqMtr { get; set; }
        public decimal OutputKg { get; set; }

        public string BatchNo { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;

        public string? QRCodeData { get; set; }
        public string? Remarks { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
```

### Slitting Service with Business Logic

**Services/SlittingService.cs**
```csharp
using Milan.API.Models.Domain;
using Milan.API.Models.DTOs;
using Milan.API.Repositories;
using System.Text.Json;

namespace Milan.API.Services
{
    public class SlittingService : ISlittingService
    {
        private readonly ISlittingRepository _slittingRepository;
        private readonly IGRNRepository _grnRepository;
        private readonly IStockRepository _stockRepository;
        private readonly IRollMasterRepository _rollMasterRepository;
        private readonly IInventoryTransactionService _inventoryTransactionService;
        private readonly ILogger<SlittingService> _logger;

        public SlittingService(
            ISlittingRepository slittingRepository,
            IGRNRepository grnRepository,
            IStockRepository stockRepository,
            IRollMasterRepository rollMasterRepository,
            IInventoryTransactionService inventoryTransactionService,
            ILogger<SlittingService> logger)
        {
            _slittingRepository = slittingRepository;
            _grnRepository = grnRepository;
            _stockRepository = stockRepository;
            _rollMasterRepository = rollMasterRepository;
            _inventoryTransactionService = inventoryTransactionService;
            _logger = logger;
        }

        public async Task<SlittingJobDto> CreateAsync(CreateSlittingJobDto dto)
        {
            // Validate output widths
            var totalOutputWidth = dto.OutputRolls.Sum(r => r.OutputWidth);
            if (totalOutputWidth > dto.InputRoll.InputWidth)
            {
                throw new InvalidOperationException(
                    $"Total output width ({totalOutputWidth}mm) exceeds input width ({dto.InputRoll.InputWidth}mm)");
            }

            // Calculate wastage
            var totalOutputKg = dto.OutputRolls.Sum(r => r.OutputKg);
            var consumedKg = totalOutputKg + dto.WastageKg;

            // Create slitting job
            var slittingJob = new SlittingJob
            {
                SlittingDate = dto.SlittingDate,
                InputGRNItemId = dto.InputRoll.GRNItemId,
                InputStockId = dto.InputRoll.StockId,
                InputItemCode = dto.InputRoll.ItemCode,
                InputItemName = dto.InputRoll.ItemName,
                InputBatchNo = dto.InputRoll.BatchNo,
                InputWidth = dto.InputRoll.InputWidth,
                InputGSM = dto.InputRoll.InputGSM,
                InputRM = dto.InputRoll.InputRM,
                InputSqMtr = dto.InputRoll.InputSqMtr,
                InputKg = dto.InputRoll.InputKg,
                WastageKg = dto.WastageKg,
                WastageRM = dto.WastageRM,
                WastageSqMtr = dto.WastageSqMtr,
                WastageRemarks = dto.WastageRemarks,
                OperatorName = dto.OperatorName,
                MachineNo = dto.MachineNo,
                Remarks = dto.Remarks,
                Status = dto.Status
            };

            // Generate job number
            slittingJob.SlittingJobNumber = await GenerateJobNumberAsync();

            // Create output rolls
            for (int i = 0; i < dto.OutputRolls.Count; i++)
            {
                var outputDto = dto.OutputRolls[i];

                // Find or create Roll Master
                var rollMaster = await FindOrCreateRollMasterAsync(outputDto, dto.InputRoll);

                var outputRoll = new SlittingOutputRoll
                {
                    RollMasterId = rollMaster.RollId,
                    OutputWidth = outputDto.OutputWidth,
                    OutputGSM = outputDto.OutputGSM,
                    OutputRM = outputDto.OutputRM,
                    OutputSqMtr = outputDto.OutputSqMtr,
                    OutputKg = outputDto.OutputKg,
                    BatchNo = $"{dto.InputRoll.BatchNo}-SL{(i + 1).ToString().PadLeft(2, '0')}",
                    ItemCode = outputDto.ItemCode,
                    ItemName = outputDto.ItemName,
                    QRCodeData = GenerateQRCodeData(slittingJob.SlittingJobNumber, outputDto),
                    Remarks = outputDto.Remarks
                };

                slittingJob.OutputRolls.Add(outputRoll);
            }

            // Save to database (within transaction)
            var jobId = await _slittingRepository.CreateAsync(slittingJob);
            slittingJob.SlittingJobId = jobId;

            // Update stock
            await ExecuteStockUpdatesAsync(slittingJob);

            _logger.LogInformation("Created slitting job {JobNumber} with {OutputCount} outputs",
                slittingJob.SlittingJobNumber, slittingJob.OutputRolls.Count);

            return MapToDto(slittingJob);
        }

        private async Task<string> GenerateJobNumberAsync()
        {
            var now = DateTime.Now;
            var month = now.Month;
            var year = now.Year;

            // Financial year logic (April to March)
            var fyStart = month >= 4 ? year : year - 1;
            var fyEnd = fyStart + 1;
            var fyString = $"{fyStart.ToString().Substring(2)}-{fyEnd.ToString().Substring(2)}";

            var prefix = "SL";
            var suffix = $"/{fyString}";

            var nextSeq = await _slittingRepository.GetNextSequenceNumberAsync(prefix, suffix);
            return $"{prefix}{nextSeq.ToString().PadLeft(5, '0')}{suffix}";
        }

        private async Task<RollMaster> FindOrCreateRollMasterAsync(
            CreateSlittingOutputRollDto outputDto,
            SlittingInputRollDto inputDto)
        {
            // Try to find existing Roll Master with matching specs
            var existingRoll = await _rollMasterRepository.FindBySpecsAsync(
                outputDto.OutputWidth,
                outputDto.OutputGSM,
                inputDto.ItemName,
                inputDto.ItemType);

            if (existingRoll != null)
            {
                return existingRoll;
            }

            // Create new Roll Master
            var newRoll = new RollMaster
            {
                ItemCode = $"{inputDto.ItemCode}-{outputDto.OutputWidth}MM",
                ItemName = inputDto.ItemName,
                ItemType = inputDto.ItemType,
                RollWidthMM = outputDto.OutputWidth,
                TotalGSM = outputDto.OutputGSM,
                FaceGSM = inputDto.FaceGSM,
                ReleaseGSM = inputDto.ReleaseGSM,
                AdhesiveGSM = inputDto.AdhesiveGSM,
                IsActive = true
            };

            var rollId = await _rollMasterRepository.CreateAsync(newRoll);
            newRoll.RollId = rollId;

            _logger.LogInformation("Auto-created Roll Master {ItemCode} for slitting output",
                newRoll.ItemCode);

            return newRoll;
        }

        private string GenerateQRCodeData(string jobNumber, CreateSlittingOutputRollDto output)
        {
            var qrData = new
            {
                type = "SLITTING_OUTPUT",
                slittingJob = jobNumber,
                batch = output.BatchNo,
                width = output.OutputWidth,
                gsm = output.OutputGSM,
                weight = output.OutputKg,
                timestamp = DateTime.UtcNow
            };

            return JsonSerializer.Serialize(qrData);
        }

        private async Task ExecuteStockUpdatesAsync(SlittingJob job)
        {
            var totalOutputKg = job.OutputRolls.Sum(r => r.OutputKg);
            var consumedKg = totalOutputKg + job.WastageKg;

            // 1. Record SLITTING_OUT transaction (input consumption)
            await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
            {
                TransactionDate = job.SlittingDate,
                TransactionType = "SLITTING_OUT",
                ItemCode = job.InputItemCode,
                ItemName = job.InputItemName,
                BatchNo = job.InputBatchNo,
                QuantityIn = 0,
                QuantityOut = consumedKg,
                UOM = "Kg",
                ReferenceType = "SlittingJob",
                ReferenceNumber = job.SlittingJobNumber,
                ReferenceId = job.SlittingJobId,
                Remarks = $"Slitting job {job.SlittingJobNumber} - consumed {consumedKg}kg (output: {totalOutputKg}kg, wastage: {job.WastageKg}kg)"
            });

            // 2. Reduce input stock in physical tables
            if (job.InputGRNItemId.HasValue)
            {
                // Input from GRN
                await _grnRepository.UpdateStockAsync(
                    job.InputGRNItemId.Value,
                    consumedKg);
            }
            else if (job.InputStockId.HasValue)
            {
                // Input from Stock (recursive slitting)
                await _stockRepository.ReduceStockAsync(
                    job.InputStockId.Value,
                    consumedKg);
            }

            // 3. Create output stock entries with SLITTING_IN transactions
            for (int i = 0; i < job.OutputRolls.Count; i++)
            {
                var output = job.OutputRolls[i];

                // Create stock item
                var stockItem = new Stock
                {
                    ItemCode = output.ItemCode,
                    ItemName = output.ItemName,
                    Category = "Roll",
                    Quantity = output.OutputKg,
                    UOM = "Kg",
                    RunningMtr = output.OutputRM,
                    SqMtr = output.OutputSqMtr,
                    WeightKg = output.OutputKg,
                    WidthMM = output.OutputWidth,
                    GSM = output.OutputGSM,
                    BatchNo = output.BatchNo,
                    Location = $"Slitting: {job.SlittingJobNumber}",
                    Status = "In-Stock",
                    ReceivedDate = job.SlittingDate,
                    QRCodeData = output.QRCodeData
                };

                var stockId = await _stockRepository.CreateAsync(stockItem);

                // Record SLITTING_IN transaction for output roll
                await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
                {
                    TransactionDate = job.SlittingDate,
                    TransactionType = "SLITTING_IN",
                    ItemCode = output.ItemCode,
                    ItemName = output.ItemName,
                    BatchNo = output.BatchNo,
                    QuantityIn = output.OutputKg,
                    QuantityOut = 0,
                    UOM = "Kg",
                    // Cost is calculated from FIFO queue automatically
                    ReferenceType = "SlittingJob",
                    ReferenceNumber = job.SlittingJobNumber,
                    ReferenceId = job.SlittingJobId,
                    Remarks = $"Slitting output {i + 1}/{job.OutputRolls.Count} - {output.OutputWidth}mm x {output.OutputRM}RM"
                });
            }

            // 4. Record wastage transaction if any
            if (job.WastageKg > 0)
            {
                await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
                {
                    TransactionDate = job.SlittingDate,
                    TransactionType = "ADJUSTMENT_OUT",
                    ItemCode = job.InputItemCode,
                    ItemName = job.InputItemName,
                    BatchNo = job.InputBatchNo,
                    QuantityIn = 0,
                    QuantityOut = job.WastageKg,
                    UOM = "Kg",
                    ReferenceType = "SlittingJob",
                    ReferenceNumber = job.SlittingJobNumber,
                    ReferenceId = job.SlittingJobId,
                    Remarks = $"Slitting wastage - {job.WastageRemarks ?? "Normal wastage"}"
                });
            }

            _logger.LogInformation("Stock updated for slitting job {JobNumber}: consumed {ConsumedKg}kg, created {OutputCount} outputs with full transaction records",
                job.SlittingJobNumber, consumedKg, job.OutputRolls.Count);
        }

        private SlittingJobDto MapToDto(SlittingJob job)
        {
            return new SlittingJobDto
            {
                SlittingJobId = job.SlittingJobId,
                SlittingJobNumber = job.SlittingJobNumber,
                SlittingDate = job.SlittingDate,
                InputRoll = new SlittingInputRollDto
                {
                    GRNItemId = job.InputGRNItemId,
                    StockId = job.InputStockId,
                    ItemCode = job.InputItemCode,
                    ItemName = job.InputItemName,
                    BatchNo = job.InputBatchNo,
                    InputWidth = job.InputWidth,
                    InputGSM = job.InputGSM,
                    InputRM = job.InputRM,
                    InputSqMtr = job.InputSqMtr,
                    InputKg = job.InputKg
                },
                OutputRolls = job.OutputRolls.Select(o => new SlittingOutputRollDto
                {
                    OutputRollId = o.OutputRollId,
                    OutputWidth = o.OutputWidth,
                    OutputGSM = o.OutputGSM,
                    OutputRM = o.OutputRM,
                    OutputSqMtr = o.OutputSqMtr,
                    OutputKg = o.OutputKg,
                    BatchNo = o.BatchNo,
                    ItemCode = o.ItemCode,
                    ItemName = o.ItemName,
                    QRCodeData = o.QRCodeData,
                    Remarks = o.Remarks
                }).ToList(),
                WastageKg = job.WastageKg,
                WastageRM = job.WastageRM,
                WastageSqMtr = job.WastageSqMtr,
                WastageRemarks = job.WastageRemarks,
                OperatorName = job.OperatorName,
                MachineNo = job.MachineNo,
                Remarks = job.Remarks,
                Status = job.Status,
                CreatedAt = job.CreatedAt,
                UpdatedAt = job.UpdatedAt
            };
        }
    }
}
```

---

## 3. INVENTORY TRANSACTION INTEGRATION EXAMPLES

### GRN Service with Transaction Recording

**Services/GRNService.cs (Key Methods)**
```csharp
namespace Milan.API.Services
{
    public class GRNService : IGRNService
    {
        private readonly IGRNRepository _grnRepository;
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly IInventoryTransactionService _inventoryTransactionService;
        private readonly ILogger<GRNService> _logger;

        public GRNService(
            IGRNRepository grnRepository,
            IPurchaseOrderRepository purchaseOrderRepository,
            IInventoryTransactionService inventoryTransactionService,
            ILogger<GRNService> logger)
        {
            _grnRepository = grnRepository;
            _purchaseOrderRepository = purchaseOrderRepository;
            _inventoryTransactionService = inventoryTransactionService;
            _logger = logger;
        }

        public async Task<GRNDto> CreateAsync(CreateGRNDto dto)
        {
            // Validate PO exists
            var purchaseOrder = await _purchaseOrderRepository.GetByIdAsync(dto.PurchaseOrderId);
            if (purchaseOrder == null)
            {
                throw new InvalidOperationException($"Purchase Order not found");
            }

            // Create GRN
            var grn = new GRN
            {
                GRNNumber = await GenerateGRNNumberAsync(),
                GRNDate = dto.GRNDate,
                PurchaseOrderId = dto.PurchaseOrderId,
                PONumber = purchaseOrder.PONumber,
                SupplierId = purchaseOrder.SupplierId,
                SupplierName = purchaseOrder.SupplierName,
                InvoiceNumber = dto.InvoiceNumber,
                InvoiceDate = dto.InvoiceDate,
                VehicleNumber = dto.VehicleNumber,
                ReceivedBy = dto.ReceivedBy,
                Remarks = dto.Remarks,
                Status = "Received"
            };

            // Create GRN items
            foreach (var itemDto in dto.Items)
            {
                var grnItem = new GRNItem
                {
                    POItemId = itemDto.POItemId,
                    ItemCode = itemDto.ItemCode,
                    ItemName = itemDto.ItemName,
                    ReceivedQuantity = itemDto.ReceivedQuantity,
                    RemainingQuantity = itemDto.ReceivedQuantity, // Initially all available
                    UOM = itemDto.UOM,
                    UnitPrice = itemDto.UnitPrice,
                    TotalAmount = itemDto.ReceivedQuantity * itemDto.UnitPrice,
                    BatchNo = itemDto.BatchNo,
                    InspectionStatus = "Pending",
                    QualityRemarks = itemDto.QualityRemarks
                };

                grn.Items.Add(grnItem);
            }

            // Save GRN to database
            var grnId = await _grnRepository.CreateAsync(grn);
            grn.GRNId = grnId;

            // ✅ CRITICAL: Record inventory transactions for each item
            foreach (var item in grn.Items)
            {
                await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
                {
                    TransactionDate = grn.GRNDate,
                    TransactionType = "GRN_IN",
                    ItemCode = item.ItemCode,
                    ItemName = item.ItemName,
                    BatchNo = item.BatchNo,
                    QuantityIn = item.ReceivedQuantity,
                    QuantityOut = 0,
                    UOM = item.UOM,
                    UnitCost = item.UnitPrice,
                    TotalCost = item.TotalAmount,
                    ReferenceType = "GRN",
                    ReferenceNumber = grn.GRNNumber,
                    ReferenceId = grnId,
                    Remarks = $"GRN received - Invoice: {grn.InvoiceNumber}"
                });

                _logger.LogInformation("Recorded GRN_IN transaction for {ItemCode} batch {BatchNo}: {Quantity}{UOM}",
                    item.ItemCode, item.BatchNo, item.ReceivedQuantity, item.UOM);
            }

            _logger.LogInformation("Created GRN {GRNNumber} with {ItemCount} items and inventory transactions",
                grn.GRNNumber, grn.Items.Count);

            return MapToDto(grn);
        }

        public async Task<bool> UpdateStockAsync(int grnItemId, decimal quantityConsumed)
        {
            // Get GRN item
            var grnItem = await _grnRepository.GetItemByIdAsync(grnItemId);
            if (grnItem == null)
            {
                throw new InvalidOperationException($"GRN item not found");
            }

            // Validate sufficient stock
            if (grnItem.RemainingQuantity < quantityConsumed)
            {
                throw new InvalidOperationException(
                    $"Insufficient stock. Available: {grnItem.RemainingQuantity}, Required: {quantityConsumed}");
            }

            // Update GRN item stock
            var newRemaining = grnItem.RemainingQuantity - quantityConsumed;
            await _grnRepository.UpdateItemStockAsync(grnItemId, newRemaining);

            _logger.LogInformation("Updated GRN item {ItemId} stock: consumed {Consumed}, remaining {Remaining}",
                grnItemId, quantityConsumed, newRemaining);

            return true;
        }

        private async Task<string> GenerateGRNNumberAsync()
        {
            var now = DateTime.Now;
            var month = now.Month;
            var year = now.Year;

            // Financial year logic (April to March)
            var fyStart = month >= 4 ? year : year - 1;
            var fyEnd = fyStart + 1;
            var fyString = $"{fyStart.ToString().Substring(2)}-{fyEnd.ToString().Substring(2)}";

            var prefix = "GRN";
            var suffix = $"/{fyString}";

            var nextSeq = await _grnRepository.GetNextSequenceNumberAsync(prefix, suffix);
            return $"{prefix}{nextSeq.ToString().PadLeft(5, '0')}{suffix}";
        }

        private GRNDto MapToDto(GRN grn) { /* mapping logic */ }
    }
}
```

### Material Issue Service with Transaction Recording

**Services/MaterialIssueService.cs (Key Methods)**
```csharp
namespace Milan.API.Services
{
    public class MaterialIssueService : IMaterialIssueService
    {
        private readonly IMaterialIssueRepository _materialIssueRepository;
        private readonly IGRNRepository _grnRepository;
        private readonly IInventoryTransactionService _inventoryTransactionService;
        private readonly ILogger<MaterialIssueService> _logger;

        public MaterialIssueService(
            IMaterialIssueRepository materialIssueRepository,
            IGRNRepository grnRepository,
            IInventoryTransactionService inventoryTransactionService,
            ILogger<MaterialIssueService> logger)
        {
            _materialIssueRepository = materialIssueRepository;
            _grnRepository = grnRepository;
            _inventoryTransactionService = inventoryTransactionService;
            _logger = logger;
        }

        public async Task<MaterialIssueDto> CreateAsync(CreateMaterialIssueDto dto)
        {
            // Create material issue
            var issue = new MaterialIssue
            {
                IssueNumber = await GenerateIssueNumberAsync(),
                IssueDate = dto.IssueDate,
                IssuedTo = dto.IssuedTo,
                Department = dto.Department,
                Purpose = dto.Purpose,
                Remarks = dto.Remarks,
                Status = "Issued"
            };

            // Create issue items
            foreach (var itemDto in dto.Items)
            {
                // Validate stock availability
                var grnItem = await _grnRepository.GetItemByIdAsync(itemDto.GRNItemId);
                if (grnItem == null || grnItem.RemainingQuantity < itemDto.IssuedQuantity)
                {
                    throw new InvalidOperationException(
                        $"Insufficient stock for {itemDto.ItemCode}. Available: {grnItem?.RemainingQuantity ?? 0}, Required: {itemDto.IssuedQuantity}");
                }

                var issueItem = new MaterialIssueItem
                {
                    GRNItemId = itemDto.GRNItemId,
                    ItemCode = itemDto.ItemCode,
                    ItemName = itemDto.ItemName,
                    BatchNo = itemDto.BatchNo,
                    IssuedQuantity = itemDto.IssuedQuantity,
                    UOM = itemDto.UOM,
                    Remarks = itemDto.Remarks
                };

                issue.Items.Add(issueItem);
            }

            // Save material issue
            var issueId = await _materialIssueRepository.CreateAsync(issue);
            issue.IssueId = issueId;

            // Update stock and record transactions
            foreach (var item in issue.Items)
            {
                // Reduce GRN stock
                await _grnRepository.UpdateStockAsync(item.GRNItemId, item.IssuedQuantity);

                // ✅ Record ISSUE_OUT transaction
                await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
                {
                    TransactionDate = issue.IssueDate,
                    TransactionType = "ISSUE_OUT",
                    ItemCode = item.ItemCode,
                    ItemName = item.ItemName,
                    BatchNo = item.BatchNo,
                    QuantityIn = 0,
                    QuantityOut = item.IssuedQuantity,
                    UOM = item.UOM,
                    // Cost is calculated from FIFO automatically
                    ReferenceType = "MaterialIssue",
                    ReferenceNumber = issue.IssueNumber,
                    ReferenceId = issueId,
                    Remarks = $"Issued to {issue.IssuedTo} - {issue.Purpose}"
                });

                _logger.LogInformation("Recorded ISSUE_OUT transaction for {ItemCode} batch {BatchNo}: {Quantity}{UOM}",
                    item.ItemCode, item.BatchNo, item.IssuedQuantity, item.UOM);
            }

            _logger.LogInformation("Created material issue {IssueNumber} with {ItemCount} items and inventory transactions",
                issue.IssueNumber, issue.Items.Count);

            return MapToDto(issue);
        }

        private async Task<string> GenerateIssueNumberAsync()
        {
            var now = DateTime.Now;
            var month = now.Month;
            var year = now.Year;

            var fyStart = month >= 4 ? year : year - 1;
            var fyEnd = fyStart + 1;
            var fyString = $"{fyStart.ToString().Substring(2)}-{fyEnd.ToString().Substring(2)}";

            var prefix = "ISS";
            var suffix = $"/{fyString}";

            var nextSeq = await _materialIssueRepository.GetNextSequenceNumberAsync(prefix, suffix);
            return $"{prefix}{nextSeq.ToString().PadLeft(5, '0')}{suffix}";
        }

        private MaterialIssueDto MapToDto(MaterialIssue issue) { /* mapping logic */ }
    }
}
```

### Key Integration Points

**✅ Always Record Transactions For**:
1. **GRN Receipt** → `GRN_IN` transaction
2. **Material Issue** → `ISSUE_OUT` transaction
3. **Material Return** → `RETURN_IN` transaction
4. **Slitting Input** → `SLITTING_OUT` transaction
5. **Slitting Output** → `SLITTING_IN` transaction
6. **Stock Adjustments** → `ADJUSTMENT_IN` or `ADJUSTMENT_OUT`
7. **Production Output** → `PRODUCTION_IN` transaction
8. **Dispatch** → `DISPATCH_OUT` transaction

**✅ Transaction Recording Pattern**:
```csharp
// Step 1: Perform physical stock operation (create/reduce stock)
await _stockRepository.UpdateStockAsync(itemId, quantity);

// Step 2: Record inventory transaction for audit trail
await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
{
    TransactionDate = DateTime.Now,
    TransactionType = "APPROPRIATE_TYPE",
    ItemCode = item.ItemCode,
    ItemName = item.ItemName,
    BatchNo = item.BatchNo,
    QuantityIn = inQty,  // 0 for OUT transactions
    QuantityOut = outQty, // 0 for IN transactions
    UOM = item.UOM,
    UnitCost = cost,  // Optional: Auto-calculated from FIFO if not provided
    ReferenceType = "ModuleName",
    ReferenceNumber = "DocNumber",
    ReferenceId = documentId,
    Remarks = "Description of transaction"
});
```

**❌ NEVER**:
- Skip transaction recording for any stock movement
- Manually calculate balances (use InventoryTransactionService)
- Update InventoryLedger directly (service handles it)
- Forget to link transactions to source documents via ReferenceType/ReferenceNumber

---

## 4. DATABASE CONNECTION FACTORY

**Infrastructure/Database/IDbConnectionFactory.cs**
```csharp
using Microsoft.Data.SqlClient;

namespace Milan.API.Infrastructure.Database
{
    public interface IDbConnectionFactory
    {
        Task<SqlConnection> CreateConnectionAsync();
    }
}
```

**Infrastructure/Database/DbConnectionFactory.cs**
```csharp
using Microsoft.Data.SqlClient;

namespace Milan.API.Infrastructure.Database
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string not found");
        }

        public async Task<SqlConnection> CreateConnectionAsync()
        {
            var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            return connection;
        }
    }
}
```

---

## 4. JWT TOKEN SERVICE

**Infrastructure/Security/JwtTokenService.cs**
```csharp
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Milan.API.Infrastructure.Security
{
    public class JwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(int userId, string email, int tenantId, string tenantCode, string role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT secret not configured");
            var issuer = jwtSettings["Issuer"] ?? "Milan.API";
            var audience = jwtSettings["Audience"] ?? "Milan.Client";
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440"); // 24 hours

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", userId.ToString()),
                new Claim("TenantId", tenantId.ToString()),
                new Claim("TenantCode", tenantCode),
                new Claim("role", role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT secret not configured");

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
```

---

## 5. ERROR HANDLING

**Middleware/ErrorHandlingMiddleware.cs**
```csharp
using System.Net;
using System.Text.Json;

namespace Milan.API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new
            {
                message = exception.Message,
                type = exception.GetType().Name
            };

            response.StatusCode = exception switch
            {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                _ => (int)HttpStatusCode.InternalServerError
            };

            var jsonResponse = JsonSerializer.Serialize(errorResponse);
            await response.WriteAsync(jsonResponse);
        }
    }
}
```

---

## 6. PROGRAM.CS CONFIGURATION

**Program.cs**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Milan.API.Infrastructure.Database;
using Milan.API.Infrastructure.Security;
using Milan.API.Middleware;
using Milan.API.Repositories;
using Milan.API.Services;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/milan-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// Add HttpContextAccessor (required for BaseRepository)
builder.Services.AddHttpContextAccessor();

// Add Database
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

// Add Repositories
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<IRollMasterRepository, RollMasterRepository>();
builder.Services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
builder.Services.AddScoped<IGRNRepository, GRNRepository>();
builder.Services.AddScoped<ISlittingRepository, SlittingRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IInventoryTransactionRepository, InventoryTransactionRepository>();
builder.Services.AddScoped<IInventoryLedgerRepository, InventoryLedgerRepository>();
builder.Services.AddScoped<IInventoryFIFORepository, InventoryFIFORepository>();

// Add Services
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<IRollMasterService, RollMasterService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
builder.Services.AddScoped<IGRNService, GRNService>();
builder.Services.AddScoped<ISlittingService, SlittingService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Add Inventory Transaction Services (CRITICAL for audit trail)
builder.Services.AddScoped<IInventoryTransactionService, InventoryTransactionService>();
builder.Services.AddScoped<IFIFOCostCalculationService, FIFOCostCalculationService>();
builder.Services.AddScoped<IStockValuationService, StockValuationService>();

// Add JWT Authentication
builder.Services.AddSingleton<JwtTokenService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT secret not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Milan PMS API",
        Version = "v1",
        Description = "Milan Print Management System - Multi-tenant SaaS ERP API"
    });

    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

// CRITICAL: Error handling must be first
app.UseMiddleware<ErrorHandlingMiddleware>();

// CRITICAL: Tenant resolution must be before authentication
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Log.Information("Milan API starting up...");

app.Run();
```

**appsettings.json**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Milan_ERP;User Id=milan_user;Password=YourSecurePassword123!;TrustServerCertificate=true;Min Pool Size=10;Max Pool Size=100;Pooling=true;"
  },
  "JwtSettings": {
    "Secret": "YourVerySecureSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "Milan.API",
    "Audience": "Milan.Client",
    "ExpiryMinutes": "1440"
  },
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://milan.yourdomain.com"
  ],
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

---

## 7. FRONTEND API INTEGRATION EXAMPLES

### TypeScript API Client

**src/services/api/api-client.ts**
```typescript
interface ApiError {
    message: string;
    type: string;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.milan.com';
    }

    private getHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const tenantCode = typeof window !== 'undefined' ? localStorage.getItem('tenantCode') : null;

        return {
            'Content-Type': 'application/json',
            ...(tenantCode && { 'X-Tenant-Code': tenantCode }),
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                message: response.statusText,
                type: 'HttpError'
            }));

            throw new Error(error.message || 'API request failed');
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });

        return this.handleResponse<T>(response);
    }

    async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        return this.handleResponse<void>(response);
    }
}

export const apiClient = new ApiClient();
```

### Client Storage Adapter (With Backend Toggle)

**src/services/storage/client-storage.ts**
```typescript
import { Client } from '@/types/client-master';
import { apiClient } from '../api/api-client';

const STORAGE_KEY = 'MILAN_CLIENTS';
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true';

export const clientStorage = {
    getAll: async (): Promise<Client[]> => {
        if (USE_BACKEND) {
            return await apiClient.get<Client[]>('clients');
        } else {
            // localStorage fallback
            if (typeof window === 'undefined') return [];
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        }
    },

    getById: async (id: string): Promise<Client | undefined> => {
        if (USE_BACKEND) {
            try {
                return await apiClient.get<Client>(`clients/${id}`);
            } catch {
                return undefined;
            }
        } else {
            const clients = await clientStorage.getAll();
            return clients.find(c => c.id === id);
        }
    },

    save: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
        if (USE_BACKEND) {
            if ('id' in client) {
                // Update
                return await apiClient.put<Client>(`clients/${(client as any).id}`, client);
            } else {
                // Create
                return await apiClient.post<Client>('clients', client);
            }
        } else {
            // localStorage fallback
            const clients = await clientStorage.getAll();
            const now = new Date().toISOString();

            if ('id' in client) {
                // Update existing
                const index = clients.findIndex(c => c.id === (client as any).id);
                if (index !== -1) {
                    clients[index] = {
                        ...client as Client,
                        updatedAt: now
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
                    return clients[index];
                }
                throw new Error('Client not found');
            } else {
                // Create new
                const newClient: Client = {
                    ...(client as any),
                    id: `CL${Date.now()}`,
                    createdAt: now,
                    updatedAt: now
                };
                clients.push(newClient);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
                return newClient;
            }
        }
    },

    delete: async (id: string): Promise<void> => {
        if (USE_BACKEND) {
            await apiClient.delete(`clients/${id}`);
        } else {
            const clients = await clientStorage.getAll();
            const filtered = clients.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
    }
};
```

---

## CONCLUSION

This document provides **complete, production-ready code examples** for implementing the Milan PMS backend with:

✅ **Complete Module Pattern** (Client example with all layers)
✅ **Complex Business Logic** (Slitting module with stock updates)
✅ **Inventory Transaction Integration** ⭐ **CRITICAL - Audit Trail & Compliance**
✅ **Database Connection Factory**
✅ **JWT Token Service**
✅ **Error Handling Middleware**
✅ **Complete Program.cs Configuration**
✅ **Frontend API Integration with Adapter Pattern**

### ⚠️ CRITICAL REQUIREMENT: Inventory Transactions

**EVERY module that moves stock MUST record inventory transactions:**

- **GRN Receipt** → Record `GRN_IN` transaction
- **Material Issue** → Record `ISSUE_OUT` transaction
- **Material Return** → Record `RETURN_IN` transaction
- **Slitting Job** → Record `SLITTING_OUT` + `SLITTING_IN` transactions
- **Production** → Record `PRODUCTION_IN` transaction
- **Stock Adjustment** → Record `ADJUSTMENT_IN/OUT` transaction
- **Dispatch** → Record `DISPATCH_OUT` transaction

**Why This Matters:**
1. **Legal Compliance** - Required for GST audits and regulatory reporting
2. **Cost Tracking** - FIFO cost calculation for accurate profit/loss
3. **Audit Trail** - Complete history of all stock movements
4. **Reconciliation** - Match physical stock with system records
5. **Analytics** - Generate stock movement, aging, and valuation reports

**Integration Pattern:**
```csharp
// Step 1: Validate and perform physical stock operation
await _stockRepository.UpdateStockAsync(itemId, quantity);

// Step 2: ALWAYS record inventory transaction
await _inventoryTransactionService.RecordTransactionAsync(new CreateInventoryTransactionDto
{
    // ... transaction details
});
```

**See Section 3 for complete integration examples.**

---

**Use these examples as templates for implementing ALL other modules.**

For complete inventory transaction system implementation, see [BACKEND_INVENTORY_LEDGER.md](BACKEND_INVENTORY_LEDGER.md).

---

*Document Version: 2.0* ⭐ **Updated with Inventory Transaction Integration**
*Last Updated: January 7, 2026*
*Complete Code Reference: Ready for Implementation*
