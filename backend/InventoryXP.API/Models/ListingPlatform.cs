using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InventoryXP.API.Models
{
    public class ListingPlatform
    {
        [Key]
        public int PlatformID { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        // Navigation properties
        public ICollection<InventoryItem> InventoryItems { get; set; }
    }
} 