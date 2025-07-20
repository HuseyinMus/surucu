namespace Application.DTOs;

public class CourseCreateRequest
{
    public Guid DrivingSchoolId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string CourseType { get; set; } = null!; // Theory, Practice
} 