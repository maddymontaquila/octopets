namespace Octopets.Backend.Models;

public class PetSitter
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string Bio { get; set; } = string.Empty;
    public List<string> ServiceTypes { get; set; } = new();
    public List<string> AcceptedPetTypes { get; set; } = new();
    public decimal HourlyRate { get; set; }
    public double Rating { get; set; } = 0.0;
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
