using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ICourseService
{
    Task<Course> CreateCourseAsync(CourseCreateRequest request);
    Task<List<Course>> ListCoursesAsync(Guid drivingSchoolId);
} 