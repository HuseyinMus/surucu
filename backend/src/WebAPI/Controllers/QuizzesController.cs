using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;
    private readonly AppDbContext _db;
    public QuizzesController(IQuizService quizService, AppDbContext db)
    {
        _quizService = quizService;
        _db = db;
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

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> CreateQuiz([FromBody] Quiz quiz)
    {
        quiz.Id = Guid.NewGuid();
        quiz.CreatedAt = DateTime.UtcNow;
        _db.Quizzes.Add(quiz);
        await _db.SaveChangesAsync();
        return Ok(quiz);
    }

    [HttpPost("{quizId}/questions")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> AddQuestion([FromRoute] Guid quizId, [FromBody] QuizQuestion question)
    {
        var quiz = await _db.Quizzes.Include(q => q.Questions).FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz == null) return NotFound();
        question.Id = Guid.NewGuid();
        question.QuizId = quizId;
        _db.QuizQuestions.Add(question);
        await _db.SaveChangesAsync();
        return Ok(question);
    }

    [HttpPost("{quizId}/questions/{questionId}/options")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> AddOption([FromRoute] Guid quizId, [FromRoute] Guid questionId, [FromBody] QuizOption option)
    {
        var question = await _db.QuizQuestions.FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);
        if (question == null) return NotFound();
        option.Id = Guid.NewGuid();
        option.QuestionId = questionId;
        _db.QuizOptions.Add(option);
        await _db.SaveChangesAsync();
        return Ok(option);
    }
} 