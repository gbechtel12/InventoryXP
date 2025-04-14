using InventoryXP.API.Data;
using InventoryXP.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventoryXP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly InventoryXpContext _context;

        public LocationsController(InventoryXpContext context)
        {
            _context = context;
        }

        // GET: api/Locations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetLocations()
        {
            return await _context.Locations.ToListAsync();
        }

        // GET: api/Locations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Location>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);

            if (location == null)
            {
                return NotFound();
            }

            return location;
        }

        // GET: api/Locations/rootlocations
        [HttpGet("rootlocations")]
        public async Task<ActionResult<IEnumerable<Location>>> GetRootLocations()
        {
            return await _context.Locations
                .Where(l => l.ParentLocationID == null)
                .ToListAsync();
        }

        // GET: api/Locations/children/5
        [HttpGet("children/{parentId}")]
        public async Task<ActionResult<IEnumerable<Location>>> GetChildLocations(int parentId)
        {
            return await _context.Locations
                .Where(l => l.ParentLocationID == parentId)
                .ToListAsync();
        }

        // PUT: api/Locations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLocation(int id, Location location)
        {
            if (id != location.LocationID)
            {
                return BadRequest();
            }

            _context.Entry(location).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LocationExists(id))
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

        // POST: api/Locations
        [HttpPost]
        public async Task<ActionResult<Location>> PostLocation(Location location)
        {
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLocation", new { id = location.LocationID }, location);
        }

        // DELETE: api/Locations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
            {
                return NotFound();
            }

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LocationExists(int id)
        {
            return _context.Locations.Any(e => e.LocationID == id);
        }
    }
} 