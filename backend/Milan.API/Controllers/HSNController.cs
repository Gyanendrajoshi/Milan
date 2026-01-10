using Microsoft.AspNetCore.Mvc;
using Milan.API.Models.DTOs;
using Milan.API.Services;

namespace Milan.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HSNController : ControllerBase
    {
        private readonly IHSNService _service;
        private readonly ILogger<HSNController> _logger;

        public HSNController(IHSNService service, ILogger<HSNController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HSNMasterDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HSNMasterDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<HSNMasterDto>> Create([FromBody] CreateHSNMasterDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.HSNId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<HSNMasterDto>> Update(int id, [FromBody] UpdateHSNMasterDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
