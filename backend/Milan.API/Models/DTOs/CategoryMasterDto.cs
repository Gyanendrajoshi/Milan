using System.ComponentModel.DataAnnotations;

namespace Milan.API.Models.DTOs
{
    public class CategoryMasterDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public IEnumerable<int> ProcessIds { get; set; } = new List<int>();
        public IEnumerable<ProcessMasterDto> Processes { get; set; } = new List<ProcessMasterDto>();
    }

    public class CreateCategoryMasterDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IEnumerable<int> ProcessIds { get; set; } = new List<int>();
    }

    public class UpdateCategoryMasterDto : CreateCategoryMasterDto
    {
    }
}
