using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryXP.API.Models
{
    public class InventoryItem
    {
        [Key]
        public int ItemID { get; set; }
        
        [Required]
        public int UserID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Cost { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal ListingPrice { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        [NotMapped]
        public decimal ROI => Cost > 0 ? (ListingPrice - Cost) / Cost * 100 : 0;
        
        [StringLength(50)]
        public string MainLocation { get; set; }
        
        [StringLength(50)]
        public string SubLocation { get; set; }
        
        public int? ListingPlatformID { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("UserID")]
        public User User { get; set; }
        
        [ForeignKey("ListingPlatformID")]
        public ListingPlatform ListingPlatform { get; set; }
    }
} 