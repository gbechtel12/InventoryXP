using InventoryXP.API.Data;
using InventoryXP.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InventoryXP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly InventoryXpContext _context;

        public UsersController(InventoryXpContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "Admin")] // Only admin can see all users
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            // Users can only view their own profile
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id)
            {
                return Forbid();
            }
            
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // GET: api/Users/current
        [HttpGet("current")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return user;
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserID)
            {
                return BadRequest();
            }
            
            // Users can only update their own profile
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id)
            {
                return Forbid();
            }

            user.UpdatedAt = DateTime.UtcNow;
            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Users
        [HttpPost]
        [AllowAnonymous] // Anyone can create a user (register)
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // This endpoint should be replaced with the Auth/Register endpoint
            // Leaving this for backward compatibility but marked as obsolete
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UserID }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // Users can only delete their own profile
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id)
            {
                return Forbid();
            }
            
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserID == id);
        }
        
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
} 