// Mock data for pet-friendly listings
import { Listing } from '../types/types';

const listingsData: Listing[] = [
  {
    id: "1",
    name: "Pawsome Park",
    type: "park",
    location: "123 Park Avenue, New York, NY",
    description: "A spacious park with dedicated areas for dogs to run off-leash. Beautiful walking paths and rest areas for owners.",
    allowedPets: ["dogs", "cats"],
    amenities: ["Water fountains", "Waste stations", "Benches", "Shade areas"],
    photos: ["park1.jpg", "park2.jpg"],
    rating: 4.7,
    reviews: [
      {
        id: "101",
        userId: "user1",
        userName: "Alex Johnson",
        rating: 5,
        comment: "My golden retriever loves this park! Plenty of space to run around.",
        date: "2025-04-15"
      },
      {
        id: "102",
        userId: "user2",
        userName: "Taylor Smith",
        rating: 4,
        comment: "Clean and well-maintained. Would be perfect with more shade in summer.",
        date: "2025-04-10"
      }
    ],
    contactInfo: {
      phone: "555-123-4567",
      email: "info@pawsomepark.com",
      website: "https://pawsomepark.com"
    }
  },
  {
    id: "2",
    name: "Whiskers Cafe",
    type: "cafe",
    location: "456 Main Street, Seattle, WA",
    description: "A cozy cafe with a special menu for pets. Indoor and outdoor seating available with pet-friendly accommodations.",
    allowedPets: ["dogs", "cats", "small_mammals"],
    amenities: ["Pet menu", "Water bowls", "Pet beds", "Outdoor patio"],
    photos: ["cafe1.jpg", "cafe2.jpg"],
    rating: 4.5,
    reviews: [
      {
        id: "201",
        userId: "user3",
        userName: "Jamie Lee",
        rating: 5,
        comment: "They have treats for my dog and great coffee for me!",
        date: "2025-04-18"
      },
      {
        id: "202",
        userId: "user4",
        userName: "Casey Morgan",
        rating: 4,
        comment: "My cat enjoyed lounging on their special pet beds. Very accommodating staff.",
        date: "2025-04-05"
      }
    ],
    contactInfo: {
      phone: "555-987-6543",
      email: "hello@whiskerscafe.com",
      website: "https://whiskerscafe.com"
    }
  },
  {
    id: "3",
    name: "Pet Haven Home",
    type: "home",
    location: "789 Oak Road, San Francisco, CA",
    description: "A beautiful vacation home with a fenced yard, pet doors, and all necessities for your furry friends.",
    allowedPets: ["dogs", "cats", "birds", "small_mammals"],
    amenities: ["Fenced yard", "Pet doors", "Pet beds", "Feeding stations", "Pet toys"],
    photos: ["home1.jpg", "home2.jpg"],
    rating: 4.9,
    reviews: [
      {
        id: "301",
        userId: "user5",
        userName: "Jordan Riley",
        rating: 5,
        comment: "Best pet-friendly accommodation we've found! Our dogs loved the yard.",
        date: "2025-03-28"
      },
      {
        id: "302",
        userId: "user6",
        userName: "Riley Chen",
        rating: 5,
        comment: "Even our parakeet was comfortable here. Thoughtful touches for all types of pets.",
        date: "2025-03-15"
      }
    ],
    contactInfo: {
      phone: "555-234-5678",
      email: "stay@pethavenhome.com",
      website: "https://pethavenhome.com"
    }
  },
  {
    id: "4",
    name: "Pets & Pillows Hotel",
    type: "hotel",
    location: "101 Sunset Blvd, Los Angeles, CA",
    description: "Luxury hotel that welcomes pets of all sizes. Special pet services available including walking and grooming.",
    allowedPets: ["dogs", "cats", "birds"],
    amenities: ["Pet spa", "Walking service", "Pet menu", "Pet sitting", "Pet beds"],
    photos: ["hotel1.jpg", "hotel2.jpg"],
    rating: 4.8,
    reviews: [
      {
        id: "401",
        userId: "user7",
        userName: "Sam Wilson",
        rating: 5,
        comment: "They treated my dog like royalty! Room service even for pets.",
        date: "2025-04-02"
      },
      {
        id: "402",
        userId: "user8",
        userName: "Jesse Taylor",
        rating: 4.5,
        comment: "Great amenities for pets, though a bit pricey.",
        date: "2025-03-20"
      }
    ],
    contactInfo: {
      phone: "555-876-5432",
      email: "reservations@petsandpillows.com",
      website: "https://petsandpillows.com"
    }
  },
  {
    id: "5",
    name: "Furry Friends Store",
    type: "custom",
    location: "246 Cherry Lane, Chicago, IL",
    description: "A pet store with a play area where pets are welcome to try toys and meet other animals.",
    allowedPets: ["dogs", "cats", "small_mammals", "birds", "other"],
    amenities: ["Play area", "Treats bar", "Water stations", "Pet events"],
    photos: ["store1.jpg", "store2.jpg"],
    rating: 4.6,
    reviews: [
      {
        id: "501",
        userId: "user9",
        userName: "Taylor Kim",
        rating: 5,
        comment: "My ferret loved the play area! Staff was very knowledgeable about exotic pets.",
        date: "2025-04-12"
      },
      {
        id: "502",
        userId: "user10",
        userName: "Alex Rivera",
        rating: 4,
        comment: "Great selection of products for all types of pets.",
        date: "2025-04-08"
      }
    ],    contactInfo: {
      phone: "555-345-6789",
      email: "shop@furryfriendsstore.com",
      website: "https://furryfriendsstore.com"
    }
  },
  {
    id: "6",
    name: "Mooch's Meow",
    type: "cafe",
    location: "789 Banana Street, Miami, FL",
    description: "A unique monkey-themed cafe where you can enjoy your coffee surrounded by banana decor and monkey-themed treats. Perfect for primate enthusiasts and their pets!",
    allowedPets: ["dogs", "cats", "small_mammals", "other"],
    amenities: ["Banana treats", "Monkey-themed play area", "Climbing structures", "Tropical atmosphere", "Pet-friendly seating"],
    photos: ["moochs1.jpg", "moochs2.jpg"],
    rating: 5.0,
    reviews: [
      {
        id: "601",
        userId: "user11",
        userName: "Charlie Simmons",
        rating: 5,
        comment: "Such a fun atmosphere! My dog loved the banana-shaped treats and the staff was amazing.",
        date: "2025-04-28"
      },
      {
        id: "602",
        userId: "user12",
        userName: "Morgan Patel",
        rating: 5,
        comment: "The monkey theme is adorable! Great place to bring your pets, they have special accommodations for all types of animals.",
        date: "2025-04-22"
      },
      {
        id: "603",
        userId: "user13",
        userName: "Sam Washington",
        rating: 5,
        comment: "Best cafe experience ever! My cat actually enjoyed the climbing structures, and I loved the monkey-themed lattes!",
        date: "2025-05-01"
      }
    ],
    contactInfo: {
      phone: "555-111-2222",
      email: "hello@moochsmeow.com",
      website: "https://moochsmeow.com"
    }
  },
  {
    id: "17",
    name: "The Gilded Paw Resort",
    type: "hotel",
    location: "123 Luxury Lane, Beverly Hills, CA",
    description: "An upscale pet-friendly resort offering world-class accommodations for you and your furry companions. Spa services, gourmet pet dining, and concierge services available.",
    allowedPets: ["dogs", "cats"],
    amenities: ["Pet spa", "Gourmet pet dining", "24/7 concierge", "Luxury suites", "Pet sitting services"],
    photos: ["hotel1.jpg", "hotel2.jpg"],
    rating: 4.9,
    reviews: [],
    contactInfo: {
      phone: "555-777-8888",
      email: "concierge@gildedpaw.com",
      website: "https://gildedpawresort.com"
    }
  },
  {
    id: "18",
    name: "Woodland Trails",
    type: "park",
    location: "456 Forest Road, Portland, OR",
    description: "Miles of scenic hiking trails through lush forests. Perfect for adventurous dogs and nature-loving cats on leashes.",
    allowedPets: ["dogs", "cats"],
    amenities: ["Hiking trails", "Water stations", "Waste stations", "Picnic areas", "Off-leash zones"],
    photos: ["park1.jpg", "park2.jpg"],
    rating: 4.7,
    reviews: [],
    contactInfo: {
      phone: "555-333-4444",
      email: "info@woodlandtrails.com",
      website: "https://woodlandtrails.com"
    }
  },
  {
    id: "19",
    name: "Cozy Cottage",
    type: "restaurant",
    location: "789 Maple Street, Nashville, TN",
    description: "A charming cottage-style restaurant with a pet-friendly patio serving comfort food classics. Dogs and cats welcome!",
    allowedPets: ["dogs", "cats"],
    amenities: ["Outdoor patio", "Pet menu", "Water bowls", "Treats", "Heaters in winter"],
    photos: ["cafe1.jpg", "cafe2.jpg"],
    rating: 4.5,
    reviews: [],
    contactInfo: {
      phone: "555-222-3333",
      email: "reservations@cozycottage.com",
      website: "https://cozycottage.com"
    }
  },
  {
    id: "20",
    name: "Bark & Brew",
    type: "cafe",
    location: "321 Coffee Street, Seattle, WA",
    description: "A dog-friendly coffee shop with treats for both humans and pups. Great wifi, cozy atmosphere, and a small indoor play area for dogs.",
    allowedPets: ["dogs"],
    amenities: ["Puppuccinos", "Dog play area", "Free wifi", "Outdoor seating", "Dog treats"],
    photos: ["moochs1.jpg", "moochs2.jpg"],
    rating: 4.8,
    reviews: [],
    contactInfo: {
      phone: "555-999-0000",
      email: "hello@barkandbrew.com",
      website: "https://barkandbrew.com"
    }
  },
  {
    id: "21",
    name: "Exotic Pets Emporium",
    type: "shop",
    location: "654 Reptile Road, Austin, TX",
    description: "Specialty shop catering to exotic pet owners. Supplies for reptiles, birds, small mammals, and more. Knowledgeable staff and adoption services.",
    allowedPets: ["birds", "reptiles", "small_mammals", "other"],
    amenities: ["Expert staff", "Adoption services", "Specialty supplies", "Educational workshops", "Pet grooming"],
    photos: ["store1.jpg", "store2.jpg"],
    rating: 4.6,
    reviews: [],
    contactInfo: {
      phone: "555-444-5555",
      email: "info@exoticpets.com",
      website: "https://exoticpetsemporium.com"
    }
  },
  {
    id: "22",
    name: "Fins & Friends Aquatic Center",
    type: "shop",
    location: "987 Ocean Boulevard, San Diego, CA",
    description: "Premium aquarium shop specializing in fish, aquatic plants, and supplies. Also welcomes small aquatic pets and reptiles. Expert advice for saltwater and freshwater enthusiasts.",
    allowedPets: ["fish", "reptiles", "small_mammals"],
    amenities: ["Expert consultations", "Custom aquarium design", "Live plants", "Rare fish species", "Maintenance services"],
    photos: ["home1.jpg", "home2.jpg"],
    rating: 4.9,
    reviews: [],
    contactInfo: {
      phone: "555-666-7777",
      email: "info@finsandfriends.com",
      website: "https://finsandfriends.com"
    }
  }
];

export default listingsData;
