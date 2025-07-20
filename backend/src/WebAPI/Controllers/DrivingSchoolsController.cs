using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Application.DTOs;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DrivingSchoolsController : ControllerBase
{
    private readonly AppDbContext _db;
    public DrivingSchoolsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List()
    {
        var schools = await _db.DrivingSchools.ToListAsync();
        return Ok(schools);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] DrivingSchoolCreateRequest request)
    {
        // Sürücü kursu kaydını oluştur
        var school = new DrivingSchool {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email,
            LogoUrl = request.LogoUrl,
            TaxNumber = request.TaxNumber,
            CreatedAt = DateTime.UtcNow
        };
        _db.DrivingSchools.Add(school);
        // Admin kullanıcı oluştur
        var user = new User {
            Id = Guid.NewGuid(),
            FullName = school.Name + " Admin",
            Email = school.Email,
            Phone = school.Phone,
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            DrivingSchoolId = school.Id
        };
        // Şifre hashlemesi
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { school, adminUserEmail = user.Email });
    }
} 