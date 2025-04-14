using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InventoryXP.API.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        public string SubscriptionStatus { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        // Navigation properties
        public ICollection<InventoryItem> InventoryItems { get; set; }
    }
} 