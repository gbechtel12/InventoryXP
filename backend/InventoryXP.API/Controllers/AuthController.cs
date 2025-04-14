using InventoryXP.API.Models.Auth;
using InventoryXP.API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace InventoryXP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest loginRequest)
        {
            var response = await _authService.Login(loginRequest);
            
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            return Ok(response);
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterRequest registerRequest)
        {
            var user = await _authService.Register(registerRequest);
            
            if (user == null)
            {
                return BadRequest(new { message = "Email is already registered" });
            }
            
            // Automatically log in the user after registration
            var loginRequest = new LoginRequest
            {
                Email = registerRequest.Email,
                Password = registerRequest.Password
            };
            
            var loginResponse = await _authService.Login(loginRequest);
            
            return CreatedAtAction(nameof(Login), new { id = user.UserID }, loginResponse);
        }
    }
} 