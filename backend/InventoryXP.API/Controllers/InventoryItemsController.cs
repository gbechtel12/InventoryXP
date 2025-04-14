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
    public class InventoryItemsController : ControllerBase
    {
        private readonly InventoryXpContext _context;

        public InventoryItemsController(InventoryXpContext context)
        {
            _context = context;
        }

        // GET: api/InventoryItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryItem>>> GetInventoryItems()
        {
            var userId = GetCurrentUserId();
            
            return await _context.InventoryItems
                .Where(i => i.UserID == userId)
                .Include(i => i.ListingPlatform)
                .ToListAsync();
        }

        // GET: api/InventoryItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryItem>> GetInventoryItem(int id)
        {
            var userId = GetCurrentUserId();
            
            var inventoryItem = await _context.InventoryItems
                .Include(i => i.ListingPlatform)
                .FirstOrDefaultAsync(i => i.ItemID == id && i.UserID == userId);

            if (inventoryItem == null)
            {
                return NotFound();
            }

            return inventoryItem;
        }

        // GET: api/InventoryItems/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<InventoryItem>>> GetInventoryItemsByUser(int userId)
        {
            // Only allow administrators or the user themselves to access their own items
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId)
            {
                return Forbid();
            }
            
            return await _context.InventoryItems
                .Where(i => i.UserID == userId)
                .Include(i => i.ListingPlatform)
                .ToListAsync();
        }

        // PUT: api/InventoryItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInventoryItem(int id, InventoryItem inventoryItem)
        {
            if (id != inventoryItem.ItemID)
            {
                return BadRequest();
            }
            
            // Ensure the user can only update their own items
            var userId = GetCurrentUserId();
            var item = await _context.InventoryItems.FindAsync(id);
            
            if (item == null || item.UserID != userId)
            {
                return NotFound();
            }
            
            // Ensure user can't change the UserID
            inventoryItem.UserID = userId;
            inventoryItem.UpdatedAt = DateTime.UtcNow;
            
            _context.Entry(inventoryItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventoryItemExists(id))
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

        // POST: api/InventoryItems
        [HttpPost]
        public async Task<ActionResult<InventoryItem>> PostInventoryItem(InventoryItem inventoryItem)
        {
            // Set the UserID to the current user
            inventoryItem.UserID = GetCurrentUserId();
            inventoryItem.CreatedAt = DateTime.UtcNow;
            inventoryItem.UpdatedAt = DateTime.UtcNow;
            
            _context.InventoryItems.Add(inventoryItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInventoryItem", new { id = inventoryItem.ItemID }, inventoryItem);
        }

        // DELETE: api/InventoryItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryItem(int id)
        {
            var userId = GetCurrentUserId();
            var inventoryItem = await _context.InventoryItems.FindAsync(id);
            
            if (inventoryItem == null)
            {
                return NotFound();
            }
            
            // Ensure the user can only delete their own items
            if (inventoryItem.UserID != userId)
            {
                return Forbid();
            }

            _context.InventoryItems.Remove(inventoryItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InventoryItemExists(int id)
        {
            var userId = GetCurrentUserId();
            return _context.InventoryItems.Any(e => e.ItemID == id && e.UserID == userId);
        }
        
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
} 