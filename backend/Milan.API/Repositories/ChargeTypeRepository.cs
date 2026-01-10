using Dapper;
using Milan.API.Infrastructure.Database;
using Milan.API.Models.Domain;
using Milan.API.Repositories.Base;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Milan.API.Repositories
{
    public interface IChargeTypeRepository : IRepository<ChargeType>
    {
        Task<IEnumerable<ChargeType>> GetAllActiveAsync();
    }

    public class ChargeTypeRepository : BaseRepository<ChargeType>, IChargeTypeRepository
    {
        public ChargeTypeRepository(
            IDbConnectionFactory connectionFactory,
            IHttpContextAccessor httpContextAccessor)
            : base(connectionFactory, httpContextAccessor, "ChargeTypes")
        {
        }

        public override async Task<int> CreateAsync(ChargeType entity)
        {
            var sql = @"
                INSERT INTO ChargeTypes (Name, LogicCode, IsActive) 
                VALUES (@Name, @LogicCode, @IsActive);
                SELECT CAST(SCOPE_IDENTITY() as int)";
            return await ExecuteScalarAsync(sql, entity);
        }

        public override async Task<bool> UpdateAsync(ChargeType entity)
        {
            var sql = @"
                UPDATE ChargeTypes 
                SET Name = @Name, LogicCode = @LogicCode, IsActive = @IsActive 
                WHERE Id = @Id";
            return await ExecuteAsync(sql, entity);
        }

        protected override string GetPrimaryKeyColumn() => "Id";

        public async Task<IEnumerable<ChargeType>> GetAllActiveAsync()
        {
            var sql = "SELECT * FROM ChargeTypes WHERE IsActive = 1";
            return await QueryAsync(sql);
        }
    }
}
