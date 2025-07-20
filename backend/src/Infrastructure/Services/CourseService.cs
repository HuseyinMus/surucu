using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _db;
    public CourseService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Course> CreateCourseAsync(CourseCreateRequest request)
    {
        var course = new Course
        {
            Id = Guid.NewGuid(),
            DrivingSchoolId = request.DrivingSchoolId,
            Title = request.Title,
            Description = request.Description,
            CourseType = Enum.Parse<CourseType>(request.CourseType, true),
            CreatedAt = DateTime.UtcNow
        };
        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        return course;
    }

    public async Task<List<Course>> ListCoursesAsync()
    {
        return await _db.Courses.ToListAsync();
    }

    public async Task<List<Course>> ListCoursesAsync(Guid drivingSchoolId)
    {
        return await _db.Courses.Where(c => c.DrivingSchoolId == drivingSchoolId).ToListAsync();
    }
} 