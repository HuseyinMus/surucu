using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly AppDbContext _db;
    public StudentsController(IStudentService studentService, AppDbContext db)
    {
        _studentService = studentService;
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Create([FromBody] StudentCreateRequest request)
    {
        var drivingSchoolId = User.FindFirst("DrivingSchoolId")?.Value;
        request.DrivingSchoolId = Guid.Parse(drivingSchoolId);
        var student = await _studentService.CreateStudentAsync(request);
        return Ok(student);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> List()
    {
        var drivingSchoolId = User.FindFirst("DrivingSchoolId")?.Value;
        var students = await _studentService.GetAllStudentsAsync();
        var filtered = students.Where(s => s.DrivingSchoolId == Guid.Parse(drivingSchoolId));
        var result = filtered.Select(s => new {
            s.Id,
            s.LicenseType,
            s.RegistrationDate,
            fullName = s.User != null ? s.User.FullName : null,
            email = s.User != null ? s.User.Email : null
        });
        return Ok(result);
    }

    [HttpGet("findByTc")]
    [AllowAnonymous]
    public async Task<IActionResult> FindByTc([FromQuery] string tc)
    {
        var student = await _studentService.FindByTcAsync(tc);
        if (student == null)
            return NotFound();

        var courses = await _db.Courses
            .Where(c => c.DrivingSchoolId == student.DrivingSchoolId)
            .ToListAsync();
        var quizzes = await _db.Quizzes
            .Where(q => q.DrivingSchoolId == student.DrivingSchoolId)
            .ToListAsync();

        return Ok(new {
            student.Id,
            student.TCNumber,
            student.BirthDate,
            student.LicenseType,
            student.RegistrationDate,
            fullName = student.User?.FullName,
            email = student.User?.Email,
            drivingSchoolId = student.DrivingSchoolId,
            drivingSchoolName = student.DrivingSchool?.Name,
            courses = courses.Select(c => new {
                c.Id,
                c.Title,
                c.Description,
                c.CourseType,
                c.CreatedAt
            }),
            quizzes = quizzes.Select(q => new {
                q.Id,
                q.Title,
                q.TotalPoints,
                q.CreatedAt
            })
        });
    }

    [HttpGet("{id}/contents")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStudentContents([FromRoute] Guid id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student == null)
            return NotFound();
        var courses = await _db.Courses
            .Where(c => c.DrivingSchoolId == student.DrivingSchoolId)
            .Include(c => c.CourseContents)
            .ToListAsync();
        var result = courses.Select(c => new {
            c.Id,
            c.Title,
            c.Description,
            contents = c.CourseContents.Select(cc => new {
                cc.Id,
                cc.Title,
                cc.ContentType,
                cc.ContentUrl,
                cc.Order,
                cc.Duration
            })
        });
        return Ok(result);
    }

    [HttpGet("{id}/progress")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStudentProgress([FromRoute] Guid id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student == null)
            return NotFound();
        var progressService = HttpContext.RequestServices.GetService(typeof(IStudentProgressService)) as IStudentProgressService;
        var report = await progressService.GetProgressReportAsync(id, student.DrivingSchoolId);
        return Ok(report);
    }
} 