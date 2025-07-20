namespace Domain.Entities;

public enum ContentType
{
    Video,
    Text,
    PDF
}

public class CourseContent
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = null!;
    public ContentType ContentType { get; set; }
    public string ContentUrl { get; set; } = null!;
    public int Order { get; set; }
    public TimeSpan? Duration { get; set; }
    // Navigation properties
    public Course Course { get; set; } = null!;
} 