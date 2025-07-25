using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "API çalışıyor!", timestamp = DateTime.UtcNow });
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses()
    {
        // Basit test verisi
        var testCourses = new[]
        {
            new { 
                id = Guid.NewGuid(), 
                title = "Test Kurs 1", 
                description = "Bu bir test kursudur",
                courseType = 0,
                createdAt = DateTime.UtcNow
            },
            new { 
                id = Guid.NewGuid(), 
                title = "Test Kurs 2", 
                description = "Bu da bir test kursudur",
                courseType = 1,
                createdAt = DateTime.UtcNow
            }
        };

        return Ok(testCourses);
    }

    [HttpGet("courses/{id}/contents")]
    public async Task<IActionResult> GetCourseContents(Guid id)
    {
        // Basit test içerikleri
        var testContents = new[]
        {
            new { 
                id = Guid.NewGuid(), 
                title = "Test Ders 1", 
                description = "Bu bir test dersidir",
                contentType = 0,
                contentUrl = "/uploads/test-video.mp4",
                order = 1,
                duration = 300 // 5 dakika
            },
            new { 
                id = Guid.NewGuid(), 
                title = "Test Ders 2", 
                description = "Bu da bir test dersidir",
                contentType = 1,
                contentUrl = "Bu ders metin içerikli",
                order = 2,
                duration = 180 // 3 dakika
            }
        };

        return Ok(testContents);
    }
} 