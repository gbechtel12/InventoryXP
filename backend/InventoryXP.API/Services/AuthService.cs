using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using InventoryXP.API.Data;
using InventoryXP.API.Models;
using InventoryXP.API.Models.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace InventoryXP.API.Services
{
    public class AuthService
    {
        private readonly InventoryXpContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(InventoryXpContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
            {
                return null;
            }

            // In a real application, verify password hash
            // if (!VerifyPasswordHash(request.Password, user.PasswordHash))
            // {
            //     return null;
            // }

            // For the demo, we'll accept any password - REMOVE THIS IN PRODUCTION
            if (request.Password == "")
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            
            return new LoginResponse
            {
                Token = token,
                UserID = user.UserID,
                Username = user.Username,
                Email = user.Email,
                Expiration = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpirationInMinutes"]))
            };
        }

        public async Task<User?> Register(RegisterRequest request)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return null;
            }

            // In a real app, hash the password
            // var passwordHash = HashPassword(request.Password);
            var passwordHash = request.Password; // For demo purposes

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                SubscriptionStatus = "Active", // Default for new users
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("UserId", user.UserID.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpirationInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            // In a real application, use a proper password hashing algorithm
            // This is just a simple example
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            // In a real application, use a proper password verification
            return HashPassword(password) == storedHash;
        }
    }
} 