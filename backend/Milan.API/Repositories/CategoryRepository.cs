using Dapper;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;

namespace Milan.API.Repositories
{
    public interface ICategoryRepository : IRepository<CategoryMaster>
    {
        Task UpdateProcessesAsync(int categoryId, IEnumerable<int> processIds);
    }

    public class CategoryRepository : BaseRepository<CategoryMaster>, ICategoryRepository
    {
        public CategoryRepository(IDbConnectionFactory connectionFactory, IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "Categories")
        {
        }

        protected override string GetPrimaryKeyColumn() => "Id";

        // Override GetAll to include Processes
        public override async Task<IEnumerable<CategoryMaster>> GetAllAsync()
        {
            var sql = @"
                SELECT c.*, p.*
                FROM Categories c
                LEFT JOIN CategoryProcesses cp ON c.Id = cp.CategoryId AND c.TenantId = cp.TenantId
                LEFT JOIN ProcessMasters p ON cp.ProcessId = p.Id
                WHERE c.TenantId = @TenantId AND c.IsDeleted = 0";

            var tenantId = GetTenantId();
            var categoryDict = new Dictionary<int, CategoryMaster>();

            using var connection = await _connectionFactory.CreateConnectionAsync();
            var result = await connection.QueryAsync<CategoryMaster, ProcessMaster, CategoryMaster>(
                sql,
                (category, process) =>
                {
                    if (!categoryDict.TryGetValue(category.Id, out var currentCategory))
                    {
                        currentCategory = category;
                        currentCategory.Processes = new List<ProcessMaster>();
                        categoryDict.Add(currentCategory.Id, currentCategory);
                    }

                    if (process != null)
                    {
                        (currentCategory.Processes as List<ProcessMaster>)!.Add(process);
                    }

                    return currentCategory;
                },
                new { TenantId = tenantId },
                splitOn: "Id"
            );

            return categoryDict.Values;
        }
        
        // Override GetById to include Processes
        public new async Task<CategoryMaster?> GetByIdAsync(int id)
        {
             var sql = @"
                SELECT c.*, p.*
                FROM Categories c
                LEFT JOIN CategoryProcesses cp ON c.Id = cp.CategoryId AND c.TenantId = cp.TenantId
                LEFT JOIN ProcessMasters p ON cp.ProcessId = p.Id
                WHERE c.Id = @Id AND c.TenantId = @TenantId AND c.IsDeleted = 0";

            var tenantId = GetTenantId();
            var categoryDict = new Dictionary<int, CategoryMaster>();

            using var connection = await _connectionFactory.CreateConnectionAsync();
            var result = await connection.QueryAsync<CategoryMaster, ProcessMaster, CategoryMaster>(
                sql,
                (category, process) =>
                {
                    if (!categoryDict.TryGetValue(category.Id, out var currentCategory))
                    {
                        currentCategory = category;
                        currentCategory.Processes = new List<ProcessMaster>();
                        categoryDict.Add(currentCategory.Id, currentCategory);
                    }

                    if (process != null)
                    {
                        (currentCategory.Processes as List<ProcessMaster>)!.Add(process);
                    }

                    return currentCategory;
                },
                new { Id = id, TenantId = tenantId },
                splitOn: "Id"
            );

            return categoryDict.Values.FirstOrDefault();
        }


        public override async Task<int> CreateAsync(CategoryMaster entity)
        {
            var sql = @"
                INSERT INTO Categories (
                    TenantId, Name, Description, CreatedAt, UpdatedAt, IsActive, IsDeleted
                ) VALUES (
                    @TenantId, @Name, @Description, GETDATE(), GETDATE(), @IsActive, @IsDeleted
                );
                SELECT CAST(SCOPE_IDENTITY() as int)";
            
            entity.TenantId = GetTenantId();
            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(CategoryMaster entity)
        {
            var sql = @"
                UPDATE Categories 
                SET Name = @Name,
                    Description = @Description,
                    UpdatedAt = GETDATE(),
                    IsActive = @IsActive
                WHERE Id = @Id AND TenantId = @TenantId";
                
            entity.TenantId = GetTenantId();
            return await ExecuteAsync(sql, entity);
        }

        public async Task UpdateProcessesAsync(int categoryId, IEnumerable<int> processIds)
        {
             var tenantId = GetTenantId();
             using var connection = await _connectionFactory.CreateConnectionAsync();
             connection.Open();
             using var transaction = connection.BeginTransaction();
             
             try
             {
                 // Delete existing links
                 var deleteSql = "DELETE FROM CategoryProcesses WHERE CategoryId = @CategoryId AND TenantId = @TenantId";
                 await connection.ExecuteAsync(deleteSql, new { CategoryId = categoryId, TenantId = tenantId }, transaction);
                 
                 // Insert new links
                 if (processIds != null && processIds.Any())
                 {
                     var insertSql = "INSERT INTO CategoryProcesses (CategoryId, ProcessId, TenantId) VALUES (@CategoryId, @ProcessId, @TenantId)";
                     await connection.ExecuteAsync(insertSql, processIds.Select(pid => new { CategoryId = categoryId, ProcessId = pid, TenantId = tenantId }), transaction);
                 }
                 
                 transaction.Commit();
             }
             catch
             {
                 transaction.Rollback();
                 throw;
             }
        }
        
        public override async Task<bool> DeleteAsync(int id)
        {
             // Cascade delete links first
             var tenantId = GetTenantId();
             var sqlLinks = "DELETE FROM CategoryProcesses WHERE CategoryId = @Id AND TenantId = @TenantId";
             var sqlCat = "DELETE FROM Categories WHERE Id = @Id AND TenantId = @TenantId"; // Or soft delete
             
             using var connection = await _connectionFactory.CreateConnectionAsync();
             connection.Open();
             using var transaction = connection.BeginTransaction();

             try 
             {
                 await connection.ExecuteAsync(sqlLinks, new { Id = id, TenantId = tenantId }, transaction);
                 var res = await connection.ExecuteAsync(sqlCat, new { Id = id, TenantId = tenantId }, transaction);
                 transaction.Commit();
                 return res > 0;
             }
             catch
             {
                 transaction.Rollback();
                 throw;
             }
        }
    }
}
