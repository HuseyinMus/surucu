namespace Domain.Entities;

public class StudentProgress
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Guid CourseContentId { get; set; }
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    public int Progress { get; set; } // 0-100 (yüzde)
    // Navigation
    public Student Student { get; set; } = null!;
    public CourseContent CourseContent { get; set; } = null!;
} 