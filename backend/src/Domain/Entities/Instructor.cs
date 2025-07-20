namespace Domain.Entities;

public enum InstructorBranch
{
    Theory,
    Practice
}

public class Instructor : ITenantEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid DrivingSchoolId { get; set; }
    public InstructorBranch Branch { get; set; }
    public string? About { get; set; }
    // Navigation properties
    public User User { get; set; } = null!;
    public DrivingSchool DrivingSchool { get; set; } = null!;
    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
} 