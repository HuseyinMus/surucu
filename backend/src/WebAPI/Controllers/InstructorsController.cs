using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructorsController : ControllerBase
{
    private readonly AppDbContext _db;
    public InstructorsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> List()
    {
        var instructors = await _db.Users
            .Where(u => u.Role == UserRole.Instructor)
            .ToListAsync();
        return Ok(instructors);
    }
} 