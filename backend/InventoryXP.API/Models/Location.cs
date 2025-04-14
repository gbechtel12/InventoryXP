using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryXP.API.Models
{
    public class Location
    {
        [Key]
        public int LocationID { get; set; }
        
        public int? ParentLocationID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        // Self-referencing relationship for hierarchical structure
        [ForeignKey("ParentLocationID")]
        public Location ParentLocation { get; set; }
        
        public ICollection<Location> ChildLocations { get; set; }
    }
} 