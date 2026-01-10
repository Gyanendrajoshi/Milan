using Microsoft.AspNetCore.Mvc;
using Milan.API.Models.DTOs;
using Milan.API.Services;

namespace Milan.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstimationsController : ControllerBase
    {
        private readonly IEstimationService _service;

        public EstimationsController(IEstimationService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<int>> Create([FromBody] EstimationDto dto)
        {
            if (dto == null) return BadRequest();
            try
            {
                var id = await _service.CreateEstimationAsync(dto);
                return Ok(id);
            }
            catch (Exception ex)
            {
                // Log error to file for debugging
                var logPath = @"C:\Users\hp\.gemini\antigravity\brain\98a54ade-cdba-44cf-bae5-a297e3d26784\error_log.txt";
                await System.IO.File.AppendAllTextAsync(logPath, $"{DateTime.Now}: {ex.ToString()}\n--------------------------------------------------\n");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstimationDto>>> GetAll()
        {
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EstimationDto>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EstimationDto dto)
        {
            if (dto == null) return BadRequest();
            try
            {
                await _service.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                 // Log error
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
            }
        }
    }
}
