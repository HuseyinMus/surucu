using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;
    public QuizzesController(IQuizService quizService)
    {
        _quizService = quizService;
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
        var quizzes = await _quizService.ListQuizzesAsync(drivingSchoolId);
        return Ok(quizzes);
    }
} 