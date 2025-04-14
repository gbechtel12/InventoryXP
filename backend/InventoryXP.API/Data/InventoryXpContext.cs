using InventoryXP.API.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace InventoryXP.API.Data
{
    public class InventoryXpContext : DbContext
    {
        public InventoryXpContext(DbContextOptions<InventoryXpContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<ListingPlatform> ListingPlatforms { get; set; }
        public DbSet<Location> Locations { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure email to be unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            // Configure relationships
            modelBuilder.Entity<InventoryItem>()
                .HasOne(i => i.User)
                .WithMany(u => u.InventoryItems)
                .HasForeignKey(i => i.UserID)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InventoryItem>()
                .HasOne(i => i.ListingPlatform)
                .WithMany(p => p.InventoryItems)
                .HasForeignKey(i => i.ListingPlatformID)
                .OnDelete(DeleteBehavior.SetNull);
                
            // Location self-referencing relationship
            modelBuilder.Entity<Location>()
                .HasOne(l => l.ParentLocation)
                .WithMany(l => l.ChildLocations)
                .HasForeignKey(l => l.ParentLocationID)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Seed initial data for listing platforms
            modelBuilder.Entity<ListingPlatform>().HasData(
                new ListingPlatform { PlatformID = 1, Name = "eBay" },
                new ListingPlatform { PlatformID = 2, Name = "Mercari" },
                new ListingPlatform { PlatformID = 3, Name = "Amazon" },
                new ListingPlatform { PlatformID = 4, Name = "Etsy" }
            );
        }
    }
} 