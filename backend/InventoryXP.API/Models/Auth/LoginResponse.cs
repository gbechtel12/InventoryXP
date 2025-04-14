namespace InventoryXP.API.Models.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
    }
} 