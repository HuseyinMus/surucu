using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Create([FromBody] CourseCreateRequest request)
    {
        var course = await _courseService.CreateCourseAsync(request);
        return Ok(course);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List()
    {
        Guid drivingSchoolId;
        var claim = User.FindFirst("DrivingSchoolId")?.Value;
        if (claim != null && Guid.TryParse(claim, out var parsedId))
            drivingSchoolId = parsedId;
        else
            drivingSchoolId = Guid.Empty; // veya bir default/anonim tenant
        var courses = await _courseService.ListCoursesAsync(drivingSchoolId);
        return Ok(courses);
    }
} 