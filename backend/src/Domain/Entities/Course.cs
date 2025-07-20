namespace Domain.Entities;

public enum CourseType
{
    Theory,
    Practice
}

public class Course : ITenantEntity
{
    public Guid Id { get; set; }
    public Guid DrivingSchoolId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public CourseType CourseType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // Navigation properties
    public DrivingSchool DrivingSchool { get; set; } = null!;
    public ICollection<CourseContent> CourseContents { get; set; } = new List<CourseContent>();
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
} 