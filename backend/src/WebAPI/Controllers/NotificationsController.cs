using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Send([FromBody] NotificationCreateRequest request)
    {
        var result = await _service.SendNotificationAsync(request);
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Admin,Instructor,Student")]
    public async Task<IActionResult> GetUserNotifications(Guid userId)
    {
        var result = await _service.GetUserNotificationsAsync(userId);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> List()
    {
        var notifications = await _service.GetAllNotificationsAsync();
        var last5 = notifications.OrderByDescending(n => n.SentAt).Take(5);
        return Ok(last5);
    }
} 