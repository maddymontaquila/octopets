namespace Octopets.Backend.Models;

public class Booking
{
    public int Id { get; set; }
    public int PetOwnerId { get; set; }
    public int? PetSitterId { get; set; }
    public int? ListingId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "pending";
    public decimal TotalPrice { get; set; }
    public string? SpecialRequests { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public PetOwner? PetOwner { get; set; }
    public PetSitter? PetSitter { get; set; }
    public Listing? Listing { get; set; }
}
