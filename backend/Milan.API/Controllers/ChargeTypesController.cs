using Microsoft.AspNetCore.Mvc;
using Milan.API.Models.Domain;
using Milan.API.Repositories;

namespace Milan.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChargeTypesController : ControllerBase
    {
        private readonly IChargeTypeRepository _repository;

        public ChargeTypesController(IChargeTypeRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChargeType>>> GetAll()
        {
            var types = await _repository.GetAllActiveAsync();
            return Ok(types);
        }
    }
}
