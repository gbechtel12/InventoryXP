using InventoryXP.API.Data;
using InventoryXP.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventoryXP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingPlatformsController : ControllerBase
    {
        private readonly InventoryXpContext _context;

        public ListingPlatformsController(InventoryXpContext context)
        {
            _context = context;
        }

        // GET: api/ListingPlatforms
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ListingPlatform>>> GetListingPlatforms()
        {
            return await _context.ListingPlatforms.ToListAsync();
        }

        // GET: api/ListingPlatforms/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ListingPlatform>> GetListingPlatform(int id)
        {
            var listingPlatform = await _context.ListingPlatforms.FindAsync(id);

            if (listingPlatform == null)
            {
                return NotFound();
            }

            return listingPlatform;
        }

        // PUT: api/ListingPlatforms/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutListingPlatform(int id, ListingPlatform listingPlatform)
        {
            if (id != listingPlatform.PlatformID)
            {
                return BadRequest();
            }

            _context.Entry(listingPlatform).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListingPlatformExists(id))
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

        // POST: api/ListingPlatforms
        [HttpPost]
        public async Task<ActionResult<ListingPlatform>> PostListingPlatform(ListingPlatform listingPlatform)
        {
            _context.ListingPlatforms.Add(listingPlatform);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetListingPlatform", new { id = listingPlatform.PlatformID }, listingPlatform);
        }

        // DELETE: api/ListingPlatforms/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteListingPlatform(int id)
        {
            var listingPlatform = await _context.ListingPlatforms.FindAsync(id);
            if (listingPlatform == null)
            {
                return NotFound();
            }

            _context.ListingPlatforms.Remove(listingPlatform);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ListingPlatformExists(int id)
        {
            return _context.ListingPlatforms.Any(e => e.PlatformID == id);
        }
    }
} 